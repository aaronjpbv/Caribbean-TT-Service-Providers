// components/ChatHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
}

export default function ChatHeader({
  name,
  avatar,
  status,
  isOnline,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <Image
          source={
            avatar
              ? { uri: avatar }
              : require("@/assets/images/default-avatar.png")
          }
          style={styles.avatar}
        />
        {/* ✅ Real online status dot — only shows when isOnline is true */}
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {/* ✅ status reflects typing / online / offline, passed in from parent */}
        <Text style={styles.status} numberOfLines={1}>
          {status || (isOnline ? "online" : "offline")}
        </Text>
      </View>

      {/* ✅ REMOVED — video call and phone call icons/buttons */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#F6F6F6",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C9C9CC",
  },
  backBtn: {
    padding: 4,
    marginRight: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#F6F6F6",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  status: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 1,
  },
});
