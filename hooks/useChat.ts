// hooks/useChat.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export type MessageStatus = "pending" | "sent" | "read" | "failed";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: MessageStatus;
  is_read?: boolean; // Keep for backward compat during migration
  created_at: string;
  error?: string; // Local-only, for failed messages
};

// Helper to format error messages from any error type
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    // Check for Supabase error structure
    if (obj.message && typeof obj.message === "string") {
      return obj.message;
    }
    if (obj.error_description && typeof obj.error_description === "string") {
      return obj.error_description;
    }
  }
  return String(error) || "Unknown error";
}

export function useChat(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const oldestMessageTimeRef = useRef<string | null>(null);

  // Fetch initial messages (paginated: 50 most recent)
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Reverse so oldest is first (chronological order for display)
    const sortedMessages = (data || []).reverse();
    setMessages(sortedMessages);
    setLoading(false);

    // Track oldest message for pagination
    if (sortedMessages.length > 0) {
      oldestMessageTimeRef.current = sortedMessages[0].created_at;
    }

    // If we got fewer than 50, there are no older messages
    if ((data || []).length < 50) {
      setHasMoreMessages(false);
    }

    // Mark messages as read (using status field)
    const unread = sortedMessages.filter(
      (m) => m.receiver_id === currentUserId && m.status !== "read",
    );
    if (unread?.length) {
      await supabase
        .from("messages")
        .update({ status: "read" })
        .in(
          "id",
          unread.map((m) => m.id),
        );
    }
  }, [conversationId, currentUserId]);

  // Subscribe to realtime messages
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Check if we already have this message locally
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);

            if (exists) {
              // Message already in state (from our insert or duplicate realtime)
              // Update it with the latest data
              return prev.map((m) => (m.id === newMessage.id ? newMessage : m));
            } else {
              // New message from other user
              return [...prev, newMessage];
            }
          });

          // Auto-mark as read if I'm the receiver (and it hasn't been read yet)
          if (
            newMessage.receiver_id === currentUserId &&
            newMessage.status !== "read"
          ) {
            supabase
              .from("messages")
              .update({ status: "read" })
              .eq("id", newMessage.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update message when status changes (sent → read)
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, fetchMessages, currentUserId]);

  // Presence channel for online/offline status.
  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: { key: currentUserId },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const ids = new Set(Object.keys(state));
        setOnlineUsers(ids);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineUsers((prev) => new Set(prev).add(key));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // Send message with optimistic UI
  const sendMessage = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "User not authenticated" };
      }

      // 1. Create temporary ID for optimistic UI
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 2. Create optimistic message
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        receiver_id: "",
        content,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // 3. Add to state immediately (UI shows it right away)
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        // 🔒 Get the undisputed auth.uid() straight from the server session
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error("Supabase auth session missing or stale");
        }
        const realAuthUid = authUser.id;

        // Look up receiver
        const { data: convo, error: convoError } = await supabase
          .from("conversations")
          .select("provider_id, customer_id")
          .eq("id", conversationId)
          .single();

        if (convoError || !convo) {
          throw new Error("Conversation not found");
        }

        let receiverId: string;
        if (realAuthUid === convo.customer_id) {
          const { data: provider } = await supabase
            .from("providers")
            .select("user_id")
            .eq("id", convo.provider_id)
            .single();
          receiverId = provider?.user_id || convo.provider_id;
        } else {
          receiverId = convo.customer_id;
        }

        // 4. Insert and get back the real message
        const { data: insertedMessages, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: realAuthUid, // ✅ Guaranteed to equal auth.uid() and pass RLS
            receiver_id: receiverId,
            content,
            status: "sent",
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error || !insertedMessages) {
          throw error || new Error("Failed to insert message");
        }

        // 5. Replace temp message with real message from DB (Safely!)
        setMessages((prev) => {
          // ✅ Check if the realtime listener already sneaked the real message in
          const realtimeBeatUs = prev.some((m) => m.id === insertedMessages.id);

          if (realtimeBeatUs) {
            // Realtime already added the DB message. Just erase the temp one.
            return prev.filter((m) => m.id !== tempId);
          }
          // Otherwise, do the normal swap
          return prev.map((m) => (m.id === tempId ? insertedMessages : m));
        });

        // 6. Update conversation
        await supabase
          .from("conversations")
          .update({
            last_message: content,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        return { success: true };
      } catch (error) {
        const errorMsg = formatError(error);
        console.error("Send error:", errorMsg);

        // On failure: mark as failed in place
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, status: "failed" as MessageStatus, error: errorMsg }
              : m,
          ),
        );

        return { success: false, error: errorMsg };
      }
    },
    [conversationId, currentUserId],
  );

  // Retry a failed message
  const retryMessage = useCallback(
    async (
      messageId: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const failedMsg = messages.find((m) => m.id === messageId);
      if (!failedMsg || failedMsg.status !== "failed") {
        return {
          success: false,
          error: "Message not found or not in failed state",
        };
      }

      try {
        // 🔒 Get the undisputed auth.uid() for retries too
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error("Supabase auth session missing or stale");
        }
        const realAuthUid = authUser.id;

        // Pre-check: Did the insert actually succeed but we got a network timeout?
        const { data: existing, error: checkError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .eq("sender_id", realAuthUid)
          .eq("content", failedMsg.content)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existing) {
          // Message already in DB; sync local state with the real message
          console.log(`Message already in DB; syncing state`);
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? existing : m)),
          );
          return { success: true };
        }

        // Not in DB; safe to retry
        // Reset to pending
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, status: "pending" as MessageStatus, error: undefined }
              : m,
          ),
        );

        // Look up receiver
        const { data: convo, error: convoError } = await supabase
          .from("conversations")
          .select("provider_id, customer_id")
          .eq("id", conversationId)
          .single();

        if (convoError || !convo) {
          throw new Error("Conversation not found");
        }

        let receiverId: string;
        if (realAuthUid === convo.customer_id) {
          const { data: provider } = await supabase
            .from("providers")
            .select("user_id")
            .eq("id", convo.provider_id)
            .single();
          receiverId = provider?.user_id || convo.provider_id;
        } else {
          receiverId = convo.customer_id;
        }

        // Retry the insert
        const { data: insertedMessage, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: realAuthUid, // ✅ Guaranteed to equal auth.uid()
            receiver_id: receiverId,
            content: failedMsg.content,
            status: "sent",
            created_at: failedMsg.created_at, // Keep original timestamp
          })
          .select()
          .single();

        if (error || !insertedMessage) {
          throw error || new Error("Failed to insert message");
        }

        // Replace temp message with real message (Safely!)
        setMessages((prev) => {
          // ✅ Check if the realtime listener already sneaked the real message in
          const realtimeBeatUs = prev.some((m) => m.id === insertedMessage.id);

          if (realtimeBeatUs) {
            return prev.filter((m) => m.id !== messageId);
          }
          return prev.map((m) => (m.id === messageId ? insertedMessage : m));
        });

        return { success: true };
      } catch (error) {
        const errorMsg = formatError(error);
        console.error("Retry error:", errorMsg);

        // Mark as failed again
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, status: "failed" as MessageStatus, error: errorMsg }
              : m,
          ),
        );

        return { success: false, error: errorMsg };
      }
    },
    [conversationId, currentUserId, messages],
  );

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async (): Promise<void> => {
    if (!oldestMessageTimeRef.current || !hasMoreMessages || isLoadingOlder) {
      return;
    }

    setIsLoadingOlder(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .lt("created_at", oldestMessageTimeRef.current)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading older messages:", error);
        return;
      }

      const olderMessages = (data || []).reverse();

      if (olderMessages.length > 0) {
        // Prepend older messages to the beginning (Safely!)
        setMessages((prev) => {
          // ✅ Filter out any older messages that might already be in our state
          const uniqueOlderMessages = olderMessages.filter(
            (oldMsg) =>
              !prev.some((existingMsg) => existingMsg.id === oldMsg.id),
          );
          return [...uniqueOlderMessages, ...prev];
        });

        oldestMessageTimeRef.current = olderMessages[0].created_at;

        // If we got fewer than 50, we've reached the end
        if ((data || []).length < 50) {
          setHasMoreMessages(false);
        }
      } else {
        setHasMoreMessages(false);
      }
    } finally {
      setIsLoadingOlder(false);
    }
  }, [conversationId, hasMoreMessages, isLoadingOlder]);

  // Typing indicator
  const setTyping = useCallback(
    (isTyping: boolean) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: currentUserId,
          conversation_id: conversationId,
          is_typing: isTyping,
        },
      });
    },
    [conversationId, currentUserId],
  );

  // Listen for typing
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, is_typing } = payload.payload;
        if (user_id === currentUserId) return;

        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (is_typing) next.add(user_id);
          else next.delete(user_id);
          return next;
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // helper so the UI can ask "is this specific other user online?"
  const isUserOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers],
  );

  return {
    messages,
    loading,
    sendMessage,
    retryMessage,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingOlder,
    setTyping,
    isTyping: typingUsers.size > 0,
    isUserOnline,
    onlineUsers,
  };
}
