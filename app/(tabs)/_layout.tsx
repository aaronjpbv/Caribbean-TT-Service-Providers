// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
screenOptions={{
  headerShown: true,
  headerStyle: {
    backgroundColor: "#E98260",
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
        name="index"
        options={{
          title: "profile", 
          headerShown: true,
        }}
      />
    </Stack>
  );
}
