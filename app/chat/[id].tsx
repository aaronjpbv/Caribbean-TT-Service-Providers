import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("Chat");
  const flatListRef = useRef<FlatList>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    muted: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E5E7EB",
    teal: "#0F6C7B",
    myMessage: "#0F6C7B",
    theirMessage: isDark ? "#334155" : "#E5E7EB",
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Please sign in to chat");
      router.back();
      return;
    }
    setUserId(user.id);
    fetchConversationDetails(user.id);
    fetchMessages();
    subscribeToMessages();
    markMessagesAsRead(user.id);
  };

  const fetchConversationDetails = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        provider:providers(name),
        customer:users(full_name)
      `,
      )
      .eq("id", conversationId)
      .single();

    if (!error && data) {
      const otherName =
        data.provider_id === currentUserId
          ? data.customer?.full_name
          : data.provider?.name;
      setOtherUserName(otherName || "Chat");
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
  };

  const subscribeToMessages = () => {
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
          setMessages((prev) => [...prev, newMessage]);
          if (newMessage.receiver_id === userId) {
            markMessagesAsRead(userId!);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async (currentUserId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !userId) return;

    // Get receiver_id from conversation
    const { data: conv } = await supabase
      .from("conversations")
      .select("provider_id, customer_id")
      .eq("id", conversationId)
      .single();

    if (!conv) return;

    const receiverId =
      conv.provider_id === userId ? conv.customer_id : conv.provider_id;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      receiver_id: receiverId,
      content: inputText.trim(),
    });

    if (!error) {
      setInputText("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === userId;

    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
          { backgroundColor: isMe ? colors.myMessage : colors.theirMessage },
        ]}
      >
        <Text
          style={[styles.messageText, { color: isMe ? "#fff" : colors.text }]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: isMe ? "rgba(255,255,255,0.7)" : colors.muted },
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.bg }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.teal }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.bg, color: colors.text },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.teal }]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerInfo: { flex: 1, alignItems: "center" },
  headerName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerStatus: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  messagesList: { padding: 16, paddingBottom: 20 },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 11, marginTop: 4, alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
