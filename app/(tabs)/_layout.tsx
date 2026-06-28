// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import FloatingTabBar from "../../components/FloatingTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <FloatingTabBar />}
      screenOptions={{
        headerStyle: { backgroundColor: "#1B2B4B" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // No header for home screen
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
