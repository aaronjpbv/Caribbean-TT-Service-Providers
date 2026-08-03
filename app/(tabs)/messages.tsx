import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  last_message: string;
  last_message_at: string;
  provider_name?: string;
  customer_name?: string;
  unread_count?: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      fetchConversations(user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchConversations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          provider:providers(company_name),
          customer:users(full_name)
        `,
        )
        .or(`provider_id.eq.${userId},customer_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((conv: any) => ({
        ...conv,
        provider_name: conv.provider?.company_name,
        customer_name: conv.customer?.full_name,
      }));

      setConversations(formatted);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (currentUserId) fetchConversations(currentUserId);
  };

  const getOtherPartyName = (conv: Conversation) => {
    if (!currentUserId) return "Unknown";
    return conv.provider_id === currentUserId
      ? conv.customer_name || "Customer"
      : conv.provider_name || "Provider";
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

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

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherName = getOtherPartyName(item);
    const isUnread = (item.unread_count ?? 0) > 0;

    return (
      <Link href={`../chat/${item.id}`} asChild>
        <TouchableOpacity
          style={[
            styles.conversationItem,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
            <Text style={styles.avatarText}>{getInitials(otherName)}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <Text
                style={[styles.name, { color: colors.text }]}
                numberOfLines={1}
              >
                {otherName}
              </Text>
              <Text style={[styles.time, { color: colors.muted }]}>
                {formatTime(item.last_message_at)}
              </Text>
            </View>

            <Text
              style={[
                styles.lastMessage,
                { color: isUnread ? colors.text : colors.muted },
                isUnread && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.last_message || "No messages yet"}
            </Text>
          </View>

          {isUnread && (
            <View
              style={[styles.unreadBadge, { backgroundColor: colors.teal }]}
            >
              <Text style={styles.unreadCount}>{item.unread_count}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.teal }]}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

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
              Start chatting with a service provider
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
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
