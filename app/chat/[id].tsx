// app/chat/[id].tsx
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/lib/supabase";
import { GroupedMessage, groupMessagesByDay } from "@/utils/chatHelpers";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatBubble from "@/components/ChatBubble";
import ChatHeader from "@/components/ChatHeader";
import DateSeparator from "@/components/DateSeparator";
import MessageInput from "@/components/MessageInput";
import TypingIndicator from "@/components/TypingIndicator";

// ✅ Outer guard component — waits for auth to resolve
export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    // Bypass useAuth to ensure we get the real auth.uid() for RLS and presence
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAuthUid(data.user.id);
    });
  }, []);

  if (!authUid) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  // ✅ Now passing the guaranteed auth.uid()
  return <ChatScreenInner conversationId={conversationId} userId={authUid} />;
}

// ✅ Inner component — only mounts once userId is guaranteed to be a real UUID
function ChatScreenInner({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const {
    messages,
    loading,
    sendMessage,
    retryMessage,
    setTyping,
    isTyping,
    isUserOnline, // ✅ NEW — from presence tracking in useChat.ts
  } = useChat(conversationId, userId); // ✅ always a real UUID, never ""

  const flatListRef = useRef<FlatList>(null);
  const shouldScrollToEnd = useRef(true);

  // ── Other participant's display info ──────────────────────────────────
  const [otherName, setOtherName] = useState<string>("Chat");
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null); // ✅ NEW
  const [headerLoading, setHeaderLoading] = useState(true);

  useEffect(() => {
    const fetchOtherParticipant = async () => {
      if (!conversationId || !userId) return;

      setHeaderLoading(true);
      try {
        // 1. Get the conversation row to find customer_id / provider_id
        const { data: convo, error: convoError } = await supabase
          .from("conversations")
          .select("customer_id, provider_id")
          .eq("id", conversationId)
          .single();

        if (convoError || !convo) {
          console.error("Error fetching conversation:", convoError);
          setOtherName("Chat");
          return;
        }

        const isCustomer = userId === convo.customer_id;

        if (isCustomer) {
          // I'm the customer — fetch the provider's company name + image
          const { data: provider, error: providerError } = await supabase
            .from("providers")
            .select("company_name, image, user_id")
            .eq("id", convo.provider_id)
            .maybeSingle();

          if (providerError) {
            console.error("Error fetching provider:", providerError);
          }

          if (!provider) {
            setOtherName("Provider");
            return;
          }

          setOtherName(provider.company_name ?? "Provider");
          setOtherAvatar(provider.image ?? null);
          // ✅ Presence is keyed by auth user_id, so we need the
          // provider's actual auth id, not providers.id, to check
          // their online status correctly.
          setOtherUserId(provider.user_id ?? null);
        } else {
          // I'm the provider — fetch the customer's name + avatar
          const { data: customer, error: customerError } = await supabase
            .from("users")
            .select("full_name, avatar_url")
            .eq("id", convo.customer_id)
            .maybeSingle();

          if (customerError) {
            console.error("Error fetching customer:", customerError);
          }

          if (!customer) {
            setOtherName("Customer");
            return;
          }

          setOtherName(customer.full_name ?? "Customer");
          setOtherAvatar(customer.avatar_url ?? null);
          setOtherUserId(convo.customer_id); // already an auth user_id
        }
      } finally {
        setHeaderLoading(false);
      }
    };

    fetchOtherParticipant();
  }, [conversationId, userId]);

  const grouped = groupMessagesByDay(messages, userId);

  // ✅ Real online status for the other participant, from presence
  const otherIsOnline = otherUserId ? isUserOnline(otherUserId) : false;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldScrollToEnd.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderItem = useCallback(
    ({ item }: { item: GroupedMessage }) => {
      if (item.type === "date") {
        return <DateSeparator date={item.data as string} />;
      }
      const msg = item.data as any;
      return (
        <ChatBubble
          message={msg}
          isMe={item.isMe || false}
          onRetry={retryMessage}
        />
      );
    },
    [retryMessage],
  );

  const keyExtractor = useCallback((item: GroupedMessage, index: number) => {
    if (item.type === "date") return `date-${index}`;
    return (item.data as any).id;
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (shouldScrollToEnd.current) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  const handleScroll = useCallback(() => {
    shouldScrollToEnd.current = false;
  }, []);

  // ✅ Handle send with error feedback
  const handleSendMessage = useCallback(
    async (text: string) => {
      const { success, error } = await sendMessage(text);
      if (!success && error) {
        Alert.alert("Failed to send message", error);
      }
    },
    [sendMessage],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ChatHeader
        name={headerLoading ? "Loading..." : otherName}
        avatar={otherAvatar ?? undefined}
        isOnline={otherIsOnline} // ✅ real presence-based status
        status={isTyping ? "typing..." : otherIsOnline ? "online" : "offline"}
      />

      <FlatList
        ref={flatListRef}
        data={grouped}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={handleContentSizeChange}
        onScrollBeginDrag={handleScroll}
        onEndReached={() => {
          shouldScrollToEnd.current = true;
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      <MessageInput onSend={handleSendMessage} onTyping={setTyping} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5DDD5", // WhatsApp chat background
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5DDD5",
  },
  listContent: {
    paddingVertical: 8,
  },
});
