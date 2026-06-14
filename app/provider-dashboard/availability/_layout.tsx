// app/provider-dashboard/availability/_layout.tsx
import { Stack } from "expo-router";

export default function AvailabilityLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Set Availability" }} />
    </Stack>
  );
}
