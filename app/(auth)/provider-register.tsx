// app/(auth)/provider-register.tsx
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Cleaning",
  "Landscaping",
  "Painting",
  "Carpentry",
  "Security",
];
const REGIONS = ["North", "South", "East", "West", "Tobago"];

export default function ProviderRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    category: "",
    region: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const isDark = useColorScheme() === "dark";
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    muted: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E5E7EB",
    teal: "#0F6C7B",
    tealLight: isDark ? "rgba(15, 108, 123, 0.2)" : "#E6F4F6",
  };

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.fullName ||
      !formData.companyName ||
      !formData.category ||
      !formData.region
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth User with "provider" role in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            user_type: "provider", // CRITICAL: Tagging as provider
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      const userId = authData.user.id;

      // 2. Create provider record in your "providers" table
      const { error: pError } = await supabase.from("providers").insert({
        user_id: userId,
        name: formData.companyName,
        category: formData.category,
        region: formData.region,
        verified: false,
        rating: 0,
      });

      if (pError) throw pError;

      // 3. Initialize availability slots
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const availabilityData = days.map((day) => ({
        provider_id: userId,
        day_of_week: day,
        is_available: false,
        time_slots: [],
      }));

      await supabase.from("availability").insert(availabilityData);

      Alert.alert("Success", "Account created! Please verify your email.", [
        { text: "OK", onPress: () => router.replace("/(auth)/sign-in") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (
    visible: boolean,
    setVisible: (v: boolean) => void,
    options: string[],
    selected: string,
    onSelect: (val: string) => void,
    title: string,
  ) => {
    if (!visible) return null;
    return (
      <View style={styles.pickerOverlay}>
        <View
          style={[styles.pickerContainer, { backgroundColor: colors.card }]}
        >
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                selected === option && { backgroundColor: colors.tealLight },
              ]}
              onPress={() => {
                onSelect(option);
                setVisible(false);
              }}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  { color: selected === option ? colors.teal : colors.text },
                ]}
              >
                {option}
              </Text>
              {selected === option && (
                <Ionicons name="checkmark" size={20} color={colors.teal} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Provider Sign Up
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="John Doe"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
              />
            </View>
          </View>

          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business/Company Name *</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons
                name="business-outline"
                size={20}
                color={colors.muted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="ABC Services"
                value={formData.companyName}
                onChangeText={(text) =>
                  setFormData({ ...formData, companyName: text })
                }
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
              />
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Category *</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { borderColor: colors.border }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Ionicons name="grid-outline" size={20} color={colors.muted} />
              <Text
                style={{
                  flex: 1,
                  color: formData.category ? colors.text : colors.muted,
                }}
              >
                {formData.category || "Select Category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Region Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Region *</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { borderColor: colors.border }]}
              onPress={() => setShowRegionPicker(true)}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.muted}
              />
              <Text
                style={{
                  flex: 1,
                  color: formData.region ? colors.text : colors.muted,
                }}
              >
                {formData.region || "Select Region"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.muted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: colors.teal }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPicker(
        showCategoryPicker,
        setShowCategoryPicker,
        CATEGORIES,
        formData.category,
        (val) => setFormData({ ...formData, category: val }),
        "Select Category",
      )}
      {renderPicker(
        showRegionPicker,
        setShowRegionPicker,
        REGIONS,
        formData.region,
        (val) => setFormData({ ...formData, region: val }),
        "Select Region",
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  formCard: { borderRadius: 20, padding: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, color: "#64748B" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, fontSize: 15, height: "100%", marginLeft: 10 },
  registerBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerTitle: { fontSize: 18, fontWeight: "700" },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pickerOptionText: { fontSize: 16 },
});
