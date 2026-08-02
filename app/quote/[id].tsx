// app/quote/[id].tsx
// Request a Quote Screen
// Navigate here: router.push(`/quote/${workerId}`)

import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ── Design tokens (matching profile screen) ───────────────────────────────────
const PRIMARY_TEAL = "#1d3557";
const TEAL_LIGHT = "#E6F4F6";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

export default function RequestQuoteScreen() {
  const { id: providerId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Missing Information",
        "Please provide a job title and description so the provider understands your needs.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Ensure user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "You need to be signed in to request a quote.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
          ],
        );
        return;
      }

      // 2. Insert quote request into Supabase
      const { error } = await supabase.from("quotes").insert({
        provider_id: providerId,
        customer_id: user.id,
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() || null,
        timeline: timeline.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      Alert.alert(
        "Quote Requested!",
        "Your request has been sent to the provider. They will review it and get back to you shortly.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Quote submission error:", error);
      Alert.alert(
        "Error",
        "Could not send your quote request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Quote</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={PRIMARY_TEAL} />
          <Text style={styles.infoText}>
            Provide as much detail as possible. This helps the professional give
            you an accurate estimate and timeline.
          </Text>
        </View>

        <View style={styles.formCard}>
          {/* Job Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fix leaking kitchen sink"
              placeholderTextColor={TEXT_MUTED}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Job Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detailed Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what needs to be done, the current state, and any specific materials required..."
              placeholderTextColor={TEXT_MUTED}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Budget (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $200 - $300"
              placeholderTextColor={TEXT_MUTED}
              value={budget}
              onChangeText={setBudget}
              keyboardType="default"
            />
          </View>

          {/* Timeline */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Timeline (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., This weekend, Next week"
              placeholderTextColor={TEXT_MUTED}
              value={timeline}
              onChangeText={setTimeline}
            />
          </View>
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Send Quote Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── Info Box ────────────────────────────────────────────────────────────
  infoBox: {
    flexDirection: "row",
    backgroundColor: TEAL_LIGHT,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D0ECF0",
  },
  infoText: {
    flex: 1,
    color: PRIMARY_TEAL,
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Form ────────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT_DARK,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34, // Safe area for newer iPhones
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  submitBtn: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: TEXT_MUTED,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
