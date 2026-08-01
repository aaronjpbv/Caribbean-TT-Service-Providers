// app/provider-dashboard/settings/index.tsx

import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route?: string;
  hasSwitch?: boolean;
  danger?: boolean;
}

const settingsSections: SettingItem[][] = [
  [
    {
      icon: "person-outline",
      title: "Edit Public Profile",
      subtitle: "Name, bio, photos",
      route: "/provider-dashboard/settings/profile-edit",
    },
    {
      icon: "briefcase-outline",
      title: "Services & Pricing",
      subtitle: "What you offer",
      route: "/provider-dashboard/settings/services",
    },
    {
      icon: "location-outline",
      title: "Service Areas",
      subtitle: "North, South, etc.",
    },
  ],
  [
    {
      icon: "notifications-outline",
      title: "Notifications",
      hasSwitch: true,
    },
    {
      icon: "moon-outline",
      title: "Dark Mode",
      hasSwitch: true,
    },
  ],
  [
    {
      icon: "help-circle-outline",
      title: "Help & Support",
    },
    {
      icon: "document-text-outline",
      title: "Terms of Service",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Privacy Policy",
    },
  ],
  [
    {
      icon: "log-out-outline",
      title: "Logout",
      subtitle: "Sign out of your provider account",
      danger: true,
    },
  ],
];

export default function ProviderSettings() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
              Alert.alert("Logout Failed", error.message);
              return;
            }

            // Remove this if your root auth listener already redirects users.
            router.replace("/(auth)/sign-in");
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handlePress = (item: SettingItem) => {
    if (item.title === "Logout") {
      handleLogout();
      return;
    }

    if (item.route) {
      router.push(item.route as any);
      return;
    }

    Alert.alert("Coming Soon", `${item.title} isn't available yet.`);
  };

  return (
    <ScrollView style={styles.container}>
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.settingItem,
                index === section.length - 1 && styles.lastItem,
              ]}
              onPress={() => handlePress(item)}
              disabled={item.hasSwitch}
            >
              <View
                style={[styles.iconContainer, item.danger && styles.dangerIcon]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.danger ? "#EF4444" : PRIMARY_TEAL}
                />
              </View>

              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingTitle,
                    item.danger && styles.dangerText,
                  ]}
                >
                  {item.title}
                </Text>

                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>

              {item.hasSwitch ? (
                <Switch value={false} />
              ) : item.danger ? (
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },

  section: {
    backgroundColor: CARD_WHITE,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: PRIMARY_TEAL + "10",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FEE2E2",
  },

  settingContent: {
    flex: 1,
    marginLeft: 12,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
  },

  dangerText: {
    color: "#EF4444",
  },

  settingSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    color: TEXT_MUTED,
    marginVertical: 24,
  },
});
