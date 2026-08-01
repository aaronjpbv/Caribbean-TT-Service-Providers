// app/provider-dashboard/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const PRIMARY_TEAL = "#0F6C7B";

export default function ProviderDashboardLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PRIMARY_TEAL },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Provider Dashboard",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen name="bookings" options={{ headerShown: false }} />
      <Stack.Screen name="earnings" options={{ headerShown: false }} />
      <Stack.Screen name="portfolio" options={{ headerShown: false }} />
      <Stack.Screen
        name="availability"
        options={{ title: "My Availability" }}
      />
      <Stack.Screen name="reviews" options={{ title: "Customer Reviews" }} />
      {/* ✅ title added so it doesn't fall back to the raw route name */}
      <Stack.Screen name="messages" options={{ title: "Messages" }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
