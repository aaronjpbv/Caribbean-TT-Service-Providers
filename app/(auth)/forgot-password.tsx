import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
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
    View,
} from "react-native";

const { height } = Dimensions.get("window");

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSendResetLink = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "your-app-scheme://reset-password",
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setIsSent(true);
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleBackToLogin = useCallback(() => {
    router.push("/(auth)/sign-in");
  }, [router]);

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
                <Ionicons name="lock-open" size={40} color="#0F6C7B" />
              </View>
            </View>
            <Text style={styles.titleText}>Forgot Password?</Text>
            <Text style={styles.subtitleText}>
              {isSent
                ? "Check your email for reset instructions"
                : "Enter your email to reset your password"}
            </Text>
          </View>

          {/* White Card Section */}
          <View style={styles.card}>
            {!isSent ? (
              <>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Info Text */}
                <View style={styles.infoContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#0F6C7B"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>
                    We'll send you a link to reset your password. Make sure to
                    check your spam folder if you don't see it.
                  </Text>
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    isLoading && styles.resetButtonDisabled,
                  ]}
                  onPress={handleSendResetLink}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetButtonText}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Success State */
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="mail" size={48} color="#0F6C7B" />
                </View>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  We've sent a password reset link to{"\n"}
                  <Text style={styles.successEmail}>{email}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleSendResetLink}
                  disabled={isLoading}
                >
                  <Text style={styles.resendButtonText}>
                    Didn't receive it? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Back to Login Link */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleBackToLogin}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color="#0F6C7B"
                  style={styles.backIcon}
                />
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    height: height * 0.28,
    backgroundColor: "#0F6C7B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: -20,
    marginHorizontal: 12,
    marginBottom: 16,
    minHeight: height * 0.45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 52,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 108, 123, 0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: "#0F6C7B",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F6C7B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successIconContainer: {
    width: 88,
    height: 88,
    backgroundColor: "rgba(15, 108, 123, 0.1)",
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  successEmail: {
    fontWeight: "600",
    color: "#0F6C7B",
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: "#0F6C7B",
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 24,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  backIcon: {
    marginRight: 6,
  },
  backText: {
    fontSize: 15,
    color: "#0F6C7B",
    fontWeight: "700",
  },
});

export default ForgotPasswordScreen;
