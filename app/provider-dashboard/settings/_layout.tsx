// app/provider-dashboard/settings/_layout.tsx
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="profile-edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="services" options={{ title: "My Services" }} />
    </Stack>
  );
}
