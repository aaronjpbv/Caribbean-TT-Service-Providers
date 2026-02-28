import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.replace("/(auth)/sign-in");
        return;
      }

      const fullName = authUser.user_metadata?.full_name || "";
      const phoneNumber = authUser.user_metadata?.phone_number || "";

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: null,
      });

      setFormData({
        full_name: fullName,
        phone_number: phoneNumber,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name,
              phone_number: formData.phone_number,
            }
          : null,
      );

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
            return;
          }
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="person-outline" size={48} color={TEXT_MUTED} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isLoading}
        >
          <Text style={styles.editButtonText}>
            {isLoading ? "Saving..." : isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card with Avatar */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user.full_name || user.email)}
                </Text>
              </View>
            </View>

            <Text style={styles.userName}>{user.full_name || "Your Name"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={formData.full_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, full_name: text })
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={TEXT_MUTED}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user.email}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color={TEXT_MUTED} />
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={formData.phone_number}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone_number: text })
                  }
                  placeholder="Enter your phone number"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIcon, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { color: "#DC2626" }]}>
                  Logout
                </Text>
                <Text style={styles.menuSubtext}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Caribbean Services v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: TEXT_MUTED,
    fontSize: 16,
  },
  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: PRIMARY_TEAL,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_GRAY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperDisabled: {
    backgroundColor: "#F3F4F6",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
    height: "100%",
  },
  inputDisabled: {
    color: TEXT_MUTED,
  },
  helperText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});
