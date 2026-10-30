// app/review/[id].tsx
// "Leave a Review" screen for clients reviewing a service provider.
// Route param "id" is the provider being reviewed.
//
// To get here: router.push(`/review/${providerId}`)
//
// NOTE ON STYLING: colors are defined locally in this file rather than
// imported from a shared theme, since this feature isn't part of the
// hardware module and we've had several import-path breakages recently
// from cross-folder relative imports. If you already have a stable,
// app-wide theme file (e.g. constants/theme.ts) that these values match,
// feel free to swap these local constants for an import from there.

import { useUserRole } from "@/hooks/ role-selection";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

// ── Local design tokens (matched to the rest of the app) ────────────────
const PRIMARY_TEAL = "#0F6C7B";
const TEAL_LIGHT   = "#E6F4F6";
const AMBER        = "#F5A623";
const BG_GRAY      = "#F8FAFC";
const CARD_WHITE   = "#FFFFFF";
const TEXT_DARK    = "#1F2937";
const TEXT_MUTED   = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

const MAX_COMMENT_LENGTH = 500;

export default function LeaveReviewScreen() {
  const router = useRouter();
  const { id: providerId } = useLocalSearchParams<{ id: string }>();
  const { role, loading: loadingRole } = useUserRole();

  const [providerName, setProviderName] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Guard: only clients can leave reviews ───────────────────────────
  useEffect(() => {
    if (!loadingRole && role === "provider") {
      Alert.alert("Not available", "Provider accounts can't leave reviews.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [loadingRole, role, router]);

  // ── Load the provider's name for context in the header ──────────────
  useEffect(() => {
    (async () => {
      try {
        // ── OPTION A: mock — remove once the providers table is confirmed ──
        setProviderName("this provider");

        // ── OPTION B: real fetch (uncomment when ready) ──────────────────
        // const { data, error } = await supabase
        //   .from("service_providers")        // 🔁 confirm table name
        //   .select("name")
        //   .eq("id", providerId)
        //   .single();
        // if (error) throw error;
        // setProviderName(data?.name ?? "this provider");
      } catch (error) {
        console.error("Error loading provider name:", error);
        setProviderName("this provider");
      } finally {
        setLoadingProvider(false);
      }
    })();
  }, [providerId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Add a rating", "Tap a star to rate your experience before submitting.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Add a comment", "Let others know a bit about your experience.");
      return;
    }

    setSubmitting(true);
    try {
      // ── OPTION A: no-op mock submit — swap in Supabase below when ready ──
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ── OPTION B: Real Supabase insert (uncomment when ready) ───────────
      // const { data: userData, error: userError } = await supabase.auth.getUser();
      // if (userError) throw userError;
      // const reviewer = userData.user;
      // if (!reviewer) throw new Error("Not signed in");
      //
      // const { error: insertError } = await supabase
      //   .from("reviews")                    // 🔁 confirm table name
      //   .insert({
      //     provider_id: providerId,
      //     reviewer_id: reviewer.id,
      //     reviewer_name: reviewer.user_metadata?.full_name ?? "Anonymous",
      //     rating,
      //     comment: comment.trim(),
      //   });
      // if (insertError) throw insertError;

      Alert.alert("Thank you!", "Your review has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRole || loadingProvider) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* ── Intro ── */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>How was your experience with {providerName}?</Text>
          <Text style={styles.introBody}>Your review helps other customers choose with confidence.</Text>
        </View>

        {/* ── Star rating ── */}
        <Text style={styles.label}>Your Rating</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={36}
                color={star <= rating ? AMBER : "#D1D5DB"}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </Text>
        )}

        {/* ── Comment ── */}
        <Text style={styles.label}>Your Review</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share details about the quality, communication, and value..."
          placeholderTextColor={TEXT_MUTED}
          multiline
          numberOfLines={6}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChangeText={setComment}
        />
        <Text style={styles.charCount}>{comment.length}/{MAX_COMMENT_LENGTH}</Text>
      </ScrollView>

      {/* ── Sticky submit bar ── */}
      <View style={styles.submitBar}>
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  centered:  { justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  body: { padding: 16, paddingBottom: 40 },

  introCard: {
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 18, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  introTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK, marginBottom: 6 },
  introBody: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19 },

  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginTop: 8, marginBottom: 10 },

  starRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: "center", fontSize: 13, fontWeight: "700", color: AMBER, marginTop: 8 },

  textArea: {
    backgroundColor: CARD_WHITE,
    borderWidth: 1, borderColor: BORDER_COLOR,
    borderRadius: 12, padding: 14,
    fontSize: 14, color: TEXT_DARK,
    height: 140, textAlignVertical: "top",
  },
  charCount: { fontSize: 11, color: TEXT_MUTED, textAlign: "right", marginTop: 6 },

  submitBar: {
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  submitBtn: { backgroundColor: PRIMARY_TEAL, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});  