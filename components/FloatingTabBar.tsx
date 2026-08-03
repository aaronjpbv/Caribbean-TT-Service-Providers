// components/FloatingTabBar.tsx
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

// ✅ Role is now one of these three states instead of a plain boolean.
// "loading" prevents a flash of the wrong bar (or the bar disappearing/
// reappearing) while we wait on the auth + profile lookup.
type Role = "guest" | "customer" | "provider" | "loading";

export default function FloatingTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<Role>("loading");

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // ✅ No logged-in user = guest
        setRole("guest");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setRole(profile?.role === "provider" ? "provider" : "customer");
    };

    checkRole();
  }, []);

  // ✅ Home tab still needs to be role-aware for customers, but since
  // providers never see this bar at all, this only really matters
  // for the guest/customer branches now.
  const handleHomePress = () => {
    router.push("/(tabs)/" as any);
  };

  // ✅ Guests can't chat at all — block navigation to Messages and
  // send them to login instead.
  const handleMessagesPress = () => {
    if (role === "guest") {
      router.push("/sign-in" as any);
      return;
    }
    router.push("/(tabs)/messages" as any);
  };

  // ✅ Providers don't get the floating tab bar at all. Also render
  // nothing while we're still resolving the role, so it doesn't
  // flash in for a provider before disappearing.
  if (role === "provider" || role === "loading") {
    return null;
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.pill}>
        {/* Left two tabs */}
        {TABS.slice(0, 2).map((tab) => {
          const isActive =
            pathname === tab.route ||
            (tab.name === "index" && pathname === "/");

          const onPress =
            tab.name === "index"
              ? handleHomePress
              : () => router.push(tab.route as any);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={onPress}
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

        {/* Center logo button */}
        <TouchableOpacity style={styles.centerBtn} onPress={handleHomePress}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right two tabs — Messages is intercepted for guests */}
        {TABS.slice(2, 4).map((tab) => {
          const isActive = pathname === tab.route;
          const onPress =
            tab.name === "messages"
              ? handleMessagesPress
              : () => router.push(tab.route as any);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={onPress}
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
