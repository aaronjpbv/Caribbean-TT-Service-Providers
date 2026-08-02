// app/provider-dashboard/quotes/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
} from "react-native";
import { supabase } from "../../../lib/supabase";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for responding
  const [finalPrice, setFinalPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchQuoteDetail();
  }, [id]);

  const fetchQuoteDetail = async () => {
    try {
      // 1. Fetch the quote without the complex join
      const { data: quoteData, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // 2. Fetch the customer's name manually
      let customerData = { full_name: "Customer" };

      if (quoteData?.customer_id) {
        const { data: userRecord } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", quoteData.customer_id)
          .maybeSingle();

        if (userRecord) {
          customerData = userRecord;
        }
      }

      // 3. Combine and set the state
      setQuote({
        ...quoteData,
        customer: customerData,
      });
    } catch (error) {
      console.error("Error fetching quote details:", error);
      Alert.alert("Error", "Could not load quote details.");

      // Safely check if we can go back, else fallback to dashboard
      router.replace("/provider-dashboard");
    } finally {
      loading && setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!finalPrice.trim()) {
      Alert.alert(
        "Required",
        "Please enter a total cost estimate for the customer.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update quote status to 'responded'
      await supabase
        .from("quotes")
        .update({ status: "responded" })
        .eq("id", quote.id);

      // 2. Find or create a chat conversation with the customer
      let conversationId = null;

      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", quote.customer_id)
        .eq("provider_id", quote.provider_id)
        .maybeSingle();

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        const { data: newConvo, error: convoError } = await supabase
          .from("conversations")
          .insert({
            customer_id: quote.customer_id,
            provider_id: quote.provider_id,
          })
          .select("id")
          .single();

        if (convoError) throw convoError;
        conversationId = newConvo.id;
      }

      // 3. Construct the automated chat message
      const automatedMessage = `Hello! I have reviewed your request for "${quote.title}".\n\n💰 Estimated Total Cost: $${finalPrice}\n\n${message ? `📝 Notes: ${message}` : "Let me know if you would like to proceed and book the job!"}`;

      // 4. Send the message to the chat
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id, // Provider sending it
        receiver_id: quote.customer_id,
        content: automatedMessage,
        status: "sent",
      });

      // 5. Navigate provider back to the dashboard index
      Alert.alert("Quote Sent!", "The customer has been notified via chat.", [
        {
          text: "OK",
          onPress: () => router.replace("/provider-dashboard"), // ✅ Changed route here
        },
      ]);
    } catch (error) {
      console.error("Error responding to quote:", error);
      Alert.alert("Error", "Could not send the response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !quote) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/provider-dashboard")
          }
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quote Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer Request Details */}
        <View style={styles.card}>
          <Text style={styles.jobTitle}>{quote.title}</Text>
          <Text style={styles.customerName}>
            Requested by: {quote.customer?.full_name || "Customer"}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{quote.description}</Text>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.sectionTitle}>Customer's Budget</Text>
              <Text style={styles.detailText}>
                {quote.budget || "Not specified"}
              </Text>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <Text style={styles.detailText}>
                {quote.timeline || "Flexible"}
              </Text>
            </View>
          </View>
        </View>

        {/* Response Form */}
        {quote.status === "pending" ? (
          <View style={styles.responseCard}>
            <Text style={styles.responseTitle}>Send Your Quote</Text>

            <Text style={styles.label}>Your Total Cost Estimate ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 150.00"
              keyboardType="numeric"
              value={finalPrice}
              onChangeText={setFinalPrice}
            />

            <Text style={styles.label}>Message / Details (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Explain what is included in this price..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleRespond}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Send Quote</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.respondedCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.respondedText}>
              You have already responded to this quote.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  scrollContent: { padding: 16, gap: 16 },

  card: { backgroundColor: CARD_WHITE, padding: 16, borderRadius: 12 },
  jobTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  customerName: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 12,
  },
  descriptionText: { fontSize: 15, color: "#374151", lineHeight: 22 },
  row: { flexDirection: "row", marginTop: 12 },
  halfCol: { flex: 1 },
  detailText: { fontSize: 15, color: "#1F2937", fontWeight: "500" },

  responseCard: {
    backgroundColor: CARD_WHITE,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY_TEAL,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_TEAL,
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 16,
  },
  textArea: { height: 100 },
  submitBtn: {
    backgroundColor: PRIMARY_TEAL,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  respondedCard: {
    backgroundColor: "#D1FAE5",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  respondedText: {
    color: "#065F46",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
