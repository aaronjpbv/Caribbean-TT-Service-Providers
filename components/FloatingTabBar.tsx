// components/FloatingTabBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  {
    name: "index",
    route: "/(tabs)/",
    icon: "home-outline",
    activeIcon: "home",
    label: "Home",
  },
  {
    name: "bookings",
    route: "/(tabs)/bookings",
    icon: "briefcase-outline",
    activeIcon: "briefcase",
    label: "Bookings",
  },
  {
    name: "messages",
    route: "/(tabs)/messages",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
    label: "Messages",
  },
  {
    name: "profile",
    route: "/(tabs)/profile",
    icon: "person-outline",
    activeIcon: "person",
    label: "Profile",
  },
];

export default function FloatingTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.pill}>
        {/* Left two tabs */}
        {TABS.slice(0, 2).map((tab) => {
          const isActive =
            pathname === tab.route ||
            (tab.name === "index" && pathname === "/");
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={24}
                color={isActive ? "#E98260" : "#555"}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Center logo button — Post a Job */}
        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => router.push("/(tabs)/index.tsx" as any)}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right two tabs */}
        {TABS.slice(2, 4).map((tab) => {
          const isActive = pathname === tab.route;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={24}
                color={isActive ? "#E98260" : "#555"}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  labelActive: {
    color: "#E98260",
    fontWeight: "700",
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16, // lifts it above the pill
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
