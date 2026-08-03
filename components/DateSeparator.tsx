//components/DateSeparator.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
  },
  pill: {
    backgroundColor: "#E1F2FE",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    color: "#54656F",
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
