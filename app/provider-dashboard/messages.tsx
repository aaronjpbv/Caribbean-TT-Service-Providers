// app/provider-dashboard/messages.tsx
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface Conversation {
  id: string;
  provider_id: string;
  customer_id: string;
  last_message: string | null;
  last_message_at: string;
  last_message_status?: string;
  customer_name?: string;
  unread_count: number;
}

export default function ProviderMessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myProviderId, setMyProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const customerCacheRef = useRef<Map<string, string>>(new Map());

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    muted: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E5E7EB",
    teal: "#0F6C7B",
  };

  useFocusEffect(
    useCallback(() => {
      if (currentUserId && myProviderId) {
        fetchConversations(currentUserId, myProviderId);
      }
    }, [currentUserId, myProviderId]),
  );

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!myProviderId || !currentUserId) return;

    // FIX: Added filter so we only listen to messages related to this specific user
    const channel = supabase
      .channel("provider-messages-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async () => {
          await fetchConversations(currentUserId, myProviderId);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, myProviderId]);

  const initialize = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: providerRow } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!providerRow) {
      setLoading(false);
      return;
    }

    // FIX: Set the IDs, but let useFocusEffect handle the actual fetching to prevent double-calls
    setMyProviderId(providerRow.id);
  };

  const fetchConversations = useCallback(
    async (userId: string, providerId: string) => {
      try {
        const { data: convoRows, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("provider_id", providerId)
          .order("last_message_at", { ascending: false });

        if (error) throw error;

        if (!convoRows || convoRows.length === 0) {
          setConversations([]);
          return;
        }

        const customerIds = new Set<string>();
        convoRows.forEach((conv) => customerIds.add(conv.customer_id));

        const customersToFetch = Array.from(customerIds).filter(
          (id) => !customerCacheRef.current.has(id),
        );

        if (customersToFetch.length > 0) {
          const { data: customers } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", customersToFetch);

          customers?.forEach((c) => {
            customerCacheRef.current.set(c.id, c.full_name ?? "Customer");
          });
        }

        const formatted: Conversation[] = await Promise.all(
          convoRows.map(async (conv: any) => {
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("id", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .eq("receiver_id", userId)
              .neq("status", "read");

            return {
              ...conv,
              customer_name: customerCacheRef.current.get(conv.customer_id),
              unread_count: unreadCount ?? 0,
            };
          }),
        );

        setConversations(formatted);
      } catch (error) {
        console.error("Error fetching provider conversations:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (currentUserId && myProviderId) {
      fetchConversations(currentUserId, myProviderId);
    }
  };

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "?";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getLastMessagePreview = (
    message: string | null,
    status: string | undefined,
  ) => {
    if (!message) return "No messages yet";

    const statusIcon = (() => {
      switch (status) {
        case "pending":
          return "⏳ ";
        case "sent":
          return "✓ ";
        case "read":
          return "✓✓ ";
        case "failed":
          return "✗ ";
        default:
          return "";
      }
    })();

    return `${statusIcon}${message}`;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const customerName = item.customer_name || "Customer";
    const isUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}`)}
        style={[
          styles.conversationItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
          <Text style={styles.avatarText}>{getInitials(customerName)}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {customerName}
            </Text>
            <Text style={[styles.time, { color: colors.muted }]}>
              {item.last_message_at ? formatTime(item.last_message_at) : ""}
            </Text>
          </View>

          <Text
            style={[
              styles.lastMessage,
              { color: isUnread ? colors.text : colors.muted },
              isUnread ? styles.unreadText : undefined,
            ]}
            numberOfLines={1}
          >
            {getLastMessagePreview(item.last_message, item.last_message_status)}
          </Text>
        </View>

        {isUnread && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.teal }]}>
            <Text style={styles.unreadCount}>
              {item.unread_count > 9 ? "9+" : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.bg },
        ]}
      >
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.muted}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              Messages from customers will show up here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  content: { flex: 1, marginLeft: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  lastMessage: { fontSize: 14 },
  unreadText: { fontWeight: "600" },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadCount: { fontSize: 12, fontWeight: "700", color: "#fff" },
  empty: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: "600" },
  emptySubtext: { marginTop: 8, fontSize: 14, textAlign: "center" },
});
