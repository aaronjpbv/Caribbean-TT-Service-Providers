// app/provider-dashboard/earnings/_layout.tsx
import { Stack } from "expo-router";

export default function EarningsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Earnings" }} />
      <Stack.Screen name="history" options={{ title: "Payment History" }} />
      <Stack.Screen name="payouts" options={{ title: "Payout Settings" }} />
    </Stack>
  );
}
