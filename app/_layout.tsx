// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  // This is NOT a screen users see
  // It's a CONTAINER that holds screens
  
  return (
    <>
      <StatusBar style="light" />
      
      <Stack>
        {/* These ARE the screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="provider/[id]" options={{ title: 'Details' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}