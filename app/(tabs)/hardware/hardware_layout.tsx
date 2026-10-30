// app/hardware/_layout.tsx
// Every hardware screen draws its own header (teal bar + back button),
// so we turn off the default stack header here to avoid a doubled-up look.

import { Stack } from "expo-router";

export default function HardwareLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-item" />
    </Stack>
  );
}  