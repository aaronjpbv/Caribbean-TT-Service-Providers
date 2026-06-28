// app/provider-dashboard/reviews/_layout.tsx
import { Stack } from "expo-router";

export default function ReviewsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Customer Reviews" }} />
    </Stack>
  );
}
