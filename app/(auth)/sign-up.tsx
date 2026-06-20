// app/(auth)/sign-up.tsx
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { SafeAreaView } from "react-native-safe-area-context";

// ── Design tokens ─────────────────────────────────────────────────────────────
const THEME = {
  primary:      "#0F6C7B",
  primaryLight: "#E8F4F4",
  surface:      "#FFFFFF",
  background:   "#F8FAFC",
  text:         "#111827",
  textMuted:    "#6B7280",
  error:        "#DC2626",
  border:       "#E5E7EB",
  radius:       16,
  spacing:      { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 },
} as const;

type Role = "client" | "provider";

interface FormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  showPassword: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  general?: string;
}

// ── Reusable Components ──────────────────────────────────────────────────────

const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: React.NativeSyntheticEvent["keyboardType"];
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  error?: string;
  required?: boolean;
  testID?: string;
}> = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  rightIcon,
  error,
  required = false,
  testID,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <View style={[
      styles.inputContainer,
      error && styles.inputError,
    ]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={THEME.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        returnKeyType="next"
        testID={testID}
        accessibilityLabel={label}
      />
      {rightIcon && (
        <TouchableOpacity 
          style={styles.inputIcon} 
          onPress={() => {}}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

const RoleSelector: React.FC<{
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}> = ({ selectedRole, onRoleChange }) => {
  const roles: { value: Role; label: string; icon: keyof typeof Ionicons.glyphMap }[] = useMemo(() => [
    { value: "client", label: "Client", icon: "person" },
    { value: "provider", label: "Provider", icon: "briefcase" },
  ], []);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>I'm joining as</Text>
      <View style={styles.roleRow}>
        {roles.map((role) => {
          const isActive = selectedRole === role.value;
          return (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleBtn,
                isActive && styles.roleBtnActive,
              ]}
              onPress={() => onRoleChange(role.value)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              testID={`role-${role.value}`}
            >
              <Ionicons
                name={role.icon}
                size={22}
                color={isActive ? "#fff" : THEME.primary}
              />
              <Text style={[
                styles.roleText,
                isActive && styles.roleTextActive,
              ]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    showPassword: false,
  });
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [errorOpacity] = useState(new Animated.Value(0));

  // Animation handlers
  const [scaleAnim] = useState(new Animated.Value(1));
  const handlePressIn = useCallback(() => 
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start(), 
  [scaleAnim]);
  
  const handlePressOut = useCallback(() => 
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start(), 
  [scaleAnim]);

  // Helpers
  const updateField = useCallback(<K extends keyof FormState>(
    field: K, 
    value: FormState[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const showError = useCallback((message: string, field?: keyof FormErrors) => {
    if (field) {
      setErrors(prev => ({ ...prev, [field]: message, general: undefined }));
    } else {
      setErrors(prev => ({ ...prev, general: message }));
      Animated.timing(errorOpacity, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: true 
      }).start();
    }
  }, [errorOpacity]);

  const clearGeneralError = useCallback(() => {
    if (!errors.general) return;
    Animated.timing(errorOpacity, { 
      toValue: 0, 
      duration: 150, 
      useNativeDriver: true 
    }).start(() => setErrors(prev => ({ ...prev, general: undefined })));
  }, [errorOpacity, errors.general]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (selectedRole === "provider" && !form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required for providers";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, selectedRole]);

  // Sign-up handler
  const handleSignUp = useCallback(async () => {
    clearGeneralError();
    
    if (!validateForm()) {
      // Focus first error field (optional enhancement)
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            role: selectedRole,
            phone: form.phoneNumber.trim() || null,
          },
          // Prevent auto-redirect if using email confirmation
          emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (authError) {
        // Handle common Supabase errors
        if (authError.message.includes("already registered")) {
          showError("An account with this email already exists.", "email");
        } else if (authError.message.includes("weak password")) {
          showError("Password is too weak. Use at least 8 characters.", "password");
        } else {
          throw authError;
        }
        return;
      }

      if (!authData?.user) {
        throw new Error("Failed to create account. Please try again.");
      }

      // Step 2: Insert into public.users table
      // Note: If using Supabase trigger, this step may be optional
      const { error: insertError } = await supabase
        .from("users")
        .upsert({ // upsert handles both insert and update safely
          id: authData.user.id,
          email: form.email.trim().toLowerCase(),
          full_name: form.fullName.trim(),
          phone: form.phoneNumber.trim() || null,
          role: selectedRole,
          created_at: new Date().toISOString(),
        }, { 
          onConflict: "id", // Handle potential duplicate auth/user sync
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error("Users table insert error:", insertError);
        // Don't fail signup if profile insert fails - auth user exists
        // Could queue retry or notify admin
      }

      // Step 3: Navigate based on role
      router.replace(
        selectedRole === "provider"
          ? "/(auth)/complete-provider-sign-up"
          : "/(tabs)" 
      );

    } catch (err: any) {
      console.error("SignUp error:", err);
      showError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form, selectedRole, router, validateForm, clearGeneralError, showError]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} testID="sign-up-screen">
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID="sign-up-scroll"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Create your account
            </Text>
            <Text style={styles.subtitle}>
              Join a trusted network of local services
            </Text>
          </View>

          <View style={styles.card}>
            {/* Role selector */}
            <RoleSelector 
              selectedRole={selectedRole} 
              onRoleChange={(role) => {
                setSelectedRole(role);
                clearGeneralError();
              }} 
            />

            {/* Full name */}
            <InputField
              label="Full name"
              placeholder="Jane Doe"
              value={form.fullName}
              onChangeText={(text) => updateField("fullName", text)}
              autoCapitalize="words"
              error={errors.fullName}
              required
              testID="input-full-name"
            />

            {/* Email */}
            <InputField
              label="Email"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(text) => updateField("email", text.toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
              testID="input-email"
            />

            {/* Phone number */}
            <InputField
              label="Phone Number"
              placeholder={
                selectedRole === "provider"
                  ? "Required for providers"
                  : "Optional (e.g. 868-123-4567)"
              }
              value={form.phoneNumber}
              onChangeText={(text) => updateField("phoneNumber", text)}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              required={selectedRole === "provider"}
              testID="input-phone"
            />

            {/* Password */}
            <InputField
              label="Password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChangeText={(text) => updateField("password", text)}
              secureTextEntry={!form.showPassword}
              error={errors.password}
              required
              rightIcon={
                <Ionicons
                  name={form.showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={THEME.textMuted}
                  onPress={() => updateField("showPassword", !form.showPassword)}
                />
              }
              testID="input-password"
            />

            {/* General Error banner */}
            {errors.general && (
              <Animated.View 
                style={[styles.errorBox, { opacity: errorOpacity }]}
                accessibilityLiveRegion="polite"
              >
                <Ionicons name="alert-circle" size={16} color={THEME.error} />
                <Text style={styles.errorText} testID="error-message">
                  {errors.general}
                </Text>
                <TouchableOpacity 
                  onPress={clearGeneralError}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={16} color={THEME.error} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Submit button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn, 
                  loading && styles.primaryBtnDisabled,
                ]}
                onPress={handleSignUp}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                testID="btn-signup"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Continue</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Sign-in link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push("/(auth)/sign-in")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" "}&{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: THEME.background 
  },
  scroll: { 
    padding: THEME.spacing.md, 
    paddingBottom: THEME.spacing.xl 
  },
  header: { 
    marginBottom: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: THEME.text, 
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: THEME.textMuted, 
    marginTop: 4 
  },
  card: { 
    backgroundColor: THEME.surface, 
    borderRadius: THEME.radius, 
    padding: THEME.spacing.md, 
    shadowColor: "#000", 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
  },
  
  // Input styles
  inputGroup: { 
    marginBottom: THEME.spacing.sm 
  },
  label: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: THEME.text, 
    marginBottom: 6,
    marginLeft: 2,
  },
  required: { 
    color: THEME.error, 
    fontWeight: "700" 
  },
  inputContainer: {
    position: "relative",
  },
  input: { 
    backgroundColor: THEME.background, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: THEME.text, 
    borderWidth: 1, 
    borderColor: THEME.border,
    paddingRight: 40, // Space for icon
  },
  inputError: {
    borderColor: THEME.error,
    borderWidth: 1.5,
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  fieldError: {
    fontSize: 12,
    color: THEME.error,
    marginTop: 4,
    marginLeft: 2,
  },
  
  // Role selector
  roleRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: THEME.spacing.sm 
  },
  roleBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    paddingVertical: 14, 
    borderRadius: 12, 
    backgroundColor: THEME.primaryLight, 
    borderWidth: 1.5, 
    borderColor: "transparent" 
  },
  roleBtnActive: { 
    backgroundColor: THEME.primary, 
    borderColor: THEME.primary 
  },
  roleText: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: THEME.primary 
  },
  roleTextActive: { 
    color: "#fff" 
  },
  
  // Error banner
  errorBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    backgroundColor: "#FEF2F2", 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: "#FECACA" 
  },
  errorText: { 
    fontSize: 13, 
    color: THEME.error, 
    fontWeight: "500", 
    flex: 1 
  },
  
  // Primary button
  primaryBtn: { 
    backgroundColor: THEME.primary, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: THEME.spacing.xs,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
  },
  primaryBtnDisabled: { 
    opacity: 0.7 
  },
  primaryBtnText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
  },
  
  // Footer
  footer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 20,
    paddingBottom: 8,
  },
  footerText: { 
    color: THEME.textMuted, 
    fontSize: 14 
  },
  footerLink: { 
    color: THEME.primary, 
    fontWeight: "600", 
    fontSize: 14 
  },
  
  // Terms
  terms: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  termsText: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.primary,
    fontWeight: "600",
  },
}); 