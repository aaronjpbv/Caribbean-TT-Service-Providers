// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#006994",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // No header for home screen
        }}
      />
      <Stack.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
