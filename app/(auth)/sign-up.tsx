// app/(auth)/sign-up.tsx
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#0F6C7B",
  primaryLight: "#E8F4F4",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  text: "#111827",
  textMuted: "#6B7280",
  error: "#DC2626",
  success: "#059669",
  radius: 16,
  spacing: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 },
};

type Role = "client" | "provider";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scaleAnim] = useState(new Animated.Value(1));
  const [errorOpacity] = useState(new Animated.Value(0));

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  const showError = (msg: string) => {
    setError(msg);
    Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const clearError = () => {
    if (error) {
      Animated.timing(errorOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setError(null));
    }
  };

  const handleSignUp = useCallback(async () => {
    clearError();
    
    if (!email.trim() || !password || !fullName.trim()) {
      showError("Please fill in all required fields.");
      return;
    }
    if (selectedRole === "provider" && !phoneNumber.trim()) {
      showError("Phone number is required for service providers.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole,
            phone_number: phoneNumber || null,
          },
        },
      });
      
      if (authError) throw authError;
      if (!authData?.user) throw new Error("No user created");

      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber || null,
        role: selectedRole,
        profile_completed: selectedRole === "client",
      });
      if (insertError) throw insertError;

      router.replace(selectedRole === "provider" ? "/(auth)/complete-provider-profile" : "/(tabs)/index");
    } catch (err: any) {
      showError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }, [email, password, fullName, phoneNumber, selectedRole, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join a trusted network of local services</Text>
          </View>

          <View style={styles.card}>
            {/* Role Selector */}
            <Text style={styles.label}>I'm joining as</Text>
            <View style={styles.roleRow}>
              {(["client", "provider"] as Role[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleBtn, selectedRole === role && styles.roleBtnActive]}
                  onPress={() => { setSelectedRole(role); clearError(); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={role === "client" ? "person" : "briefcase"} size={22} color={selectedRole === role ? "#fff" : THEME.primary} />
                  <Text style={[styles.roleText, selectedRole === role && styles.roleTextActive]}>
                    {role === "client" ? "Client" : "Provider"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={THEME.textMuted}
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError(); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={THEME.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t.toLowerCase()); clearError(); }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* Phone Number - REQUIRED FOR PROVIDERS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number {selectedRole === "provider" && <Text style={styles.required}>*</Text>}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={selectedRole === "provider" ? "Required for providers" : "Optional (e.g., 868-123-4567)"}
                placeholderTextColor={THEME.textMuted}
                value={phoneNumber}
                onChangeText={(t) => { setPhoneNumber(t); clearError(); }}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={THEME.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); clearError(); }}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            {/* Error Display */}
            <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}>
              <Ionicons name="alert-circle" size={16} color={THEME.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleSignUp}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Creating account..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scroll: { padding: THEME.spacing.md, paddingBottom: 40 },
  header: { marginBottom: THEME.spacing.lg },
  title: { fontSize: 28, fontWeight: "800", color: THEME.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: THEME.textMuted, marginTop: 4 },
  card: { backgroundColor: THEME.surface, borderRadius: THEME.radius, padding: THEME.spacing.md, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  label: { fontSize: 13, fontWeight: "600", color: THEME.text, marginBottom: 6 },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.primaryLight, borderWidth: 1.5, borderColor: "transparent" },
  roleBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  roleText: { fontSize: 15, fontWeight: "600", color: THEME.primary },
  roleTextActive: { color: "#fff" },
  inputGroup: { marginBottom: 16 },
  input: { backgroundColor: THEME.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: THEME.text, borderWidth: 1, borderColor: "#E5E7EB" },
  required: { color: THEME.error, fontWeight: "700" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF2F2", padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: "#FECACA" },
  errorText: { fontSize: 13, color: THEME.error, fontWeight: "500" },
  primaryBtn: { backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: THEME.textMuted, fontSize: 14 },
  footerLink: { color: THEME.primary, fontWeight: "600", fontSize: 14 },
}); 