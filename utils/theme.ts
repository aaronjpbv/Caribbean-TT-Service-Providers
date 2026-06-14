// utils/theme.ts
import { useColorScheme } from "react-native";

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      // Backgrounds
      bg: isDark ? "#0F172A" : "#F8FAFC",
      card: isDark ? "#1E293B" : "#FFFFFF",

      // Text
      text: isDark ? "#F1F5F9" : "#1F2937",
      muted: isDark ? "#94A3B8" : "#6B7280",

      // Borders
      border: isDark ? "#334155" : "#E5E7EB",

      // Brand
      teal: "#0F6C7B",
      tealLight: isDark ? "rgba(15, 108, 123, 0.2)" : "#E6F4F6",
      amber: "#F5A623",
      amberBg: isDark ? "rgba(245, 166, 35, 0.15)" : "#FFF3DC",
    },
  };
};
