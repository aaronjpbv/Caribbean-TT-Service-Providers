// app/provider-dashboard/bookings/_layout.tsx
import { Stack } from "expo-router";

export default function BookingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "My Bookings" }} />
      <Stack.Screen name="[id]" options={{ title: "Booking Details" }} />
      <Stack.Screen name="requests" options={{ title: "New Requests" }} />
    </Stack>
  );
}
