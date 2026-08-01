import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        // This completely hides the default Expo Router header
        // for all screens inside the app/chat/ directory.
        headerShown: false,
      }}
    />
  );
}
