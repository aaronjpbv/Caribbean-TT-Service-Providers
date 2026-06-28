// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  // This is NOT a screen users see
  // It's a CONTAINER that holds screens

  return (
    <>
      <SafeAreaProvider>
        <StatusBar style="light" />

        <Stack>
          {/* These ARE the screens */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen
            name="provider/[id]"
            options={{ title: "Details", headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </>
  );
}
