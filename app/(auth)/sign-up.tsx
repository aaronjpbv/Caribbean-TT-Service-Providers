<<<<<<< HEAD
// app/(auth)/sign-up.tsx
=======
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
<<<<<<< HEAD
  Animated,
=======
  Alert,
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
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
<<<<<<< HEAD
  View
} from "react-native";

const { width } = Dimensions.get("window");

// ✅ UNIFIED: Single source of truth for theme & spacing
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
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CONVERSATIONAL: Animated feedback
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
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const {  authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: selectedRole } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
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
  }, [email, password, fullName, selectedRole, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          {/* ✅ ICONIC: Focused header, clear hierarchy */}
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join a trusted network of local services</Text>
          </View>

          <View style={styles.card}>
            {/* ✅ UNIVERSAL + ICONIC: Accessible, bold role selector */}
            <Text style={styles.label}>I'm joining as</Text>
            <View style={styles.roleRow}>
              {(["client", "provider"] as Role[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  accessibilityRole="button"
                  accessibilityLabel={`Sign up as a ${role}`}
                  accessibilityState={{ selected: selectedRole === role }}
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

            {/* ✅ UNIFIED: Consistent input structure */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={THEME.textMuted}
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError(); }}
                accessibilityLabel="Full name input"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={THEME.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t.toLowerCase()); clearError(); }}
                accessibilityLabel="Email input"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={THEME.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); clearError(); }}
                accessibilityLabel="Password input"
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            {/* ✅ CONVERSATIONAL: Animated error feedback */}
            <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}>
              <Ionicons name="alert-circle" size={16} color={THEME.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>

            {/* ✅ ICONIC + CONVERSATIONAL: Bold CTA with press animation */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleSignUp}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={loading ? "Creating account" : "Create account"}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Creating account..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")} accessibilityRole="link">
                <Text style={styles.footerLink}>Sign in</Text>
=======
  View,
} from "react-native";

const { height } = Dimensions.get("window");

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (
      !phoneRegex.test(formData.phoneNumber) ||
      formData.phoneNumber.replace(/\D/g, "").length < 10
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
          },
        },
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      if (data.user) {
        Alert.alert(
          "Success",
          "Account created successfully! Please check your email to verify your account.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(auth)/sign-in"),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, router]);

  const handleLogin = useCallback(() => {
    router.push("/(auth)/sign-in");
  }, [router]);

  const renderInput = (
    label: string,
    field: keyof FormData,
    placeholder: string,
    icon: string,
    options: {
      keyboardType?: "default" | "email-address" | "phone-pad";
      secureTextEntry?: boolean;
      showToggle?: boolean;
      toggleValue?: boolean;
      onToggle?: () => void;
    } = {},
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrapper, errors[field] && styles.inputWrapperError]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={errors[field] ? "#E74C3C" : "#666"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={options.keyboardType || "default"}
          autoCapitalize={field === "email" ? "none" : "words"}
          autoCorrect={false}
          secureTextEntry={options.secureTextEntry}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
        />
        {options.showToggle && (
          <TouchableOpacity
            onPress={options.onToggle}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={options.toggleValue ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F6C7B" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="person-add" size={40} color="#0F6C7B" />
              </View>
            </View>
            <Text style={styles.titleText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join our service marketplace
            </Text>
          </View>

          {/* White Card Section */}
          <View style={styles.card}>
            {renderInput(
              "Full Name",
              "fullName",
              "Enter your full name",
              "person-outline",
              { keyboardType: "default" },
            )}

            {renderInput(
              "Email",
              "email",
              "Enter your email address",
              "mail-outline",
              { keyboardType: "email-address" },
            )}

            {renderInput(
              "Phone Number",
              "phoneNumber",
              "Enter your phone number",
              "call-outline",
              { keyboardType: "phone-pad" },
            )}

            {renderInput(
              "Password",
              "password",
              "Create a password (min. 8 chars)",
              "lock-closed-outline",
              {
                secureTextEntry: !showPassword,
                showToggle: true,
                toggleValue: showPassword,
                onToggle: () => setShowPassword(!showPassword),
              },
            )}

            {renderInput(
              "Confirm Password",
              "confirmPassword",
              "Confirm your password",
              "shield-checkmark-outline",
              {
                secureTextEntry: !showConfirmPassword,
                showToggle: true,
                toggleValue: showConfirmPassword,
                onToggle: () => setShowConfirmPassword(!showConfirmPassword),
              },
            )}

            {/* Create Account Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isLoading && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={handleLogin}
                hitSlop={{ top: 10, bottom: 10 }}
              >
                <Text style={styles.loginText}>Login</Text>
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
<<<<<<< HEAD
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
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF2F2", padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: "#FECACA" },
  errorText: { fontSize: 13, color: THEME.error, fontWeight: "500" },
  primaryBtn: { backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: THEME.textMuted, fontSize: 14 },
  footerLink: { color: THEME.primary, fontWeight: "600", fontSize: 14 },
});
=======
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F6C7B",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    height: height * 0.24,
    backgroundColor: "#0F6C7B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  card: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    marginTop: -20,
    marginHorizontal: 12,
    marginBottom: 16,
    minHeight: height * 0.62,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    height: 48,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#E74C3C",
    backgroundColor: "#FFF5F5",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    color: "#E74C3C",
    marginTop: 2,
    marginLeft: 4,
    fontWeight: "500",
  },
  signUpButton: {
    backgroundColor: "#0F6C7B",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#0F6C7B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  loginText: {
    fontSize: 14,
    color: "#0F6C7B",
    fontWeight: "700",
  },
});

export default SignUpScreen;
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
