// components/ChatBubble.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type MessageStatus = "pending" | "sent" | "read" | "failed";

interface Message {
  id?: string | number;
  content: string;
  created_at: string | number | Date;
  status?: MessageStatus;
  is_read?: boolean; // Backward compat
  error?: string;
  [key: string]: any;
}

interface ChatBubbleProps {
  message: Message;
  isMe: boolean;
  onRetry?: (messageId: string) => void;
  showAvatar?: boolean;
}

export default function ChatBubble({
  message,
  isMe,
  onRetry,
  showAvatar = false,
}: ChatBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Determine status icon and color
  const getStatusIcon = () => {
    const status = message.status || (message.is_read ? "read" : "sent");

    switch (status) {
      case "pending":
        return { icon: "⏳", color: "#8E8E93" }; // Gray clock
      case "sent":
        return { icon: "✓", color: "#8E8E93" }; // Gray checkmark
      case "read":
        return { icon: "✓✓", color: "#34B7F1" }; // Blue double checkmark
      case "failed":
        return { icon: "✗", color: "#FF3B30" }; // Red X
      default:
        return { icon: "✓", color: "#8E8E93" };
    }
  };

  const { icon, color } = getStatusIcon();
  const status = message.status || (message.is_read ? "read" : "sent");

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.myContainer : styles.theirContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
          status === "failed" && styles.bubbleFailed,
        ]}
      >
        <Text style={[styles.text, isMe ? styles.myText : styles.theirText]}>
          {message.content}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
            {time}
          </Text>
          {isMe && <Text style={[styles.status, { color }]}>{icon}</Text>}
        </View>
      </View>

      {/* Retry button for failed messages */}
      {isMe && status === "failed" && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => onRetry(String(message.id))}
        >
          <Ionicons name="refresh" size={14} color="#FF3B30" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  myContainer: {
    justifyContent: "flex-end",
  },
  theirContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: "#DCF8C6", // WhatsApp green
    borderBottomRightRadius: 4,
  },
  bubbleFailed: {
    opacity: 0.7, // Slightly faded for failed messages
  },
  theirBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: "#1A1A1A",
  },
  myText: {
    color: "#1A1A1A",
  },
  theirText: {
    color: "#1A1A1A",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: "#8E8E93",
  },
  myTime: {
    color: "#6BAF5A",
  },
  theirTime: {
    color: "#8E8E93",
  },
  status: {
    fontSize: 12,
    letterSpacing: -2,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
  },
  retryText: {
    fontSize: 11,
    color: "#FF3B30",
    fontWeight: "500",
  },
});
