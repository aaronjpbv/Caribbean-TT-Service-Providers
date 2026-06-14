import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const ROLES = [
  {
    id: "customer",
    title: "I need a Service",
    subtitle: "Find and book local professionals",
    icon: "search-outline",
    color: "#0F6C7B",
  },
  {
    id: "provider",
    title: "I am a Provider",
    subtitle: "List your business and get bookings",
    icon: "briefcase-outline",
    color: "#F5A623",
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "customer" | "provider" | null
  >(null);
  const isDark = useColorScheme() === "dark";

  const handleContinue = () => {
    if (selectedRole === "provider") {
      router.push("../../(auth)/provider-register");
    } else {
      router.push("/(auth)/sign-up");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? "#F1F5F9" : "#1F2937" }]}>
          Welcome!
        </Text>
        <Text style={styles.subtitle}>
          How would you like to use the platform?
        </Text>

        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            activeOpacity={0.7}
            onPress={() => setSelectedRole(role.id as any)}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor:
                  selectedRole === role.id ? role.color : "transparent",
                borderWidth: 2,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: role.color + "20" },
              ]}
            >
              <Ionicons name={role.icon as any} size={28} color={role.color} />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.roleTitle,
                  { color: isDark ? "#F1F5F9" : "#1F2937" },
                ]}
              >
                {role.title}
              </Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            </View>
            {selectedRole === role.id && (
              <Ionicons name="checkmark-circle" size={24} color={role.color} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedRole}
          style={[
            styles.btn,
            { backgroundColor: selectedRole ? "#0F6C7B" : "#94A3B8" },
          ]}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, justifyContent: "center", flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748B", marginBottom: 32 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: { padding: 12, borderRadius: 12, marginRight: 16 },
  textContainer: { flex: 1 },
  roleTitle: { fontSize: 18, fontWeight: "700" },
  roleSubtitle: { fontSize: 14, color: "#64748B" },
  btn: { padding: 18, borderRadius: 12, alignItems: "center", marginTop: 20 },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
