// components/MessageInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

export default function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    onTyping?.(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="happy-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#8E8E93"
            value={text}
            onChangeText={(val) => {
              setText(val);
              onTyping?.(val.length > 0);
            }}
            onSubmitEditing={handleSend}
            multiline
            maxLength={2000}
          />
          {/* ✅ REMOVED — attach (paperclip) and camera icons */}
        </View>

        {/* ✅ Send button now always shows the send icon — mic option removed
            since voice messages weren't requested/implemented */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            text.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
          ]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#F6F6F6",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    maxHeight: 120,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
    color: "#1A1A1A",
  },
  iconBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnActive: {
    backgroundColor: "#007AFF",
  },
  sendBtnInactive: {
    backgroundColor: "#B0C4DE",
  },
});
