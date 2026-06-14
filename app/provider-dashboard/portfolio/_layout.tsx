// app/provider-dashboard/portfolio/_layout.tsx
import { Stack } from "expo-router";

export default function PortfolioLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "My Portfolio" }} />
      <Stack.Screen name="add" options={{ title: "Add Project" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit Project" }} />
    </Stack>
  );
}
