// app/provider-dashboard/bookings/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";

const SUCCESS_GREEN = "#10B981";

// Standard regex to validate UUIDs before sending them to Supabase
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type BookingDetail = {
  id: string;
  customer: string;
  client_id: string;
  provider_id: string;
  service: string;
  date: string;
  status: string;
  address: string;
  notes: string;
};

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id || !UUID_REGEX.test(id)) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Removed 'address' from this select query since it doesn't exist on the table
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            id,
            status,
            scheduled_date,
            scheduled_time,
            notes,
            client_name,
            service,
            client_id,
            provider_id
          `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const dateString = new Date(data.scheduled_date).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
            },
          );

          setBooking({
            id: data.id,
            customer: data.client_name || "Unknown Client",
            client_id: data.client_id,
            provider_id: data.provider_id,
            service: data.service || "Standard Service",
            date: `${dateString} at ${data.scheduled_time}`,
            status: data.status,
            address: "Address not available in booking", // Hardcoded fallback for now
            notes: data.notes || "No additional notes from the customer.",
          });
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleApproveBooking = async () => {
    if (!booking?.id) return;

    try {
      setIsUpdating(true);

      // 1. Get the current authenticated user's ID (Sender ID)
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user)
        throw new Error("Could not authenticate user");

      const senderId = authData.user.id;

      // 2. Update the booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // 3. Find if a conversation already exists between this provider and client
      let conversationId = null;

      const { data: existingConvo, error: convoError } = await supabase
        .from("conversations")
        .select("id")
        .eq("provider_id", booking.provider_id)
        .eq("customer_id", booking.client_id)
        .maybeSingle();

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        // Create a new conversation if one doesn't exist
        const { data: newConvo, error: createConvoError } = await supabase
          .from("conversations")
          .insert({
            provider_id: booking.provider_id,
            customer_id: booking.client_id,
            booking_id: booking.id, // Linking it to the booking for reference
          })
          .select("id")
          .single();

        if (createConvoError) throw createConvoError;
        conversationId = newConvo.id;
      }

      const messageContent = `Hello ${booking.customer}, your booking for ${booking.service} has been approved!`;

      // 4. Send the actual automated chat message
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId, // Uses auth.users ID
        receiver_id: booking.client_id, // Uses auth.users ID
        content: messageContent,
      });

      if (messageError) throw messageError;

      // 5. Update the conversation table with the latest message snippet
      await supabase
        .from("conversations")
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      // 6. Update local state
      setBooking((prev) => (prev ? { ...prev, status: "confirmed" } : null));

      Alert.alert(
        "Booking Approved",
        "The booking has been approved. The customer has been notified via chat.",
      );
    } catch (error: any) {
      console.error("Error updating status:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Could not update the booking status. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: TEXT_MUTED }}>Booking not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Header */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Service Type</Text>
              <Text style={styles.title}>{booking.service}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    booking.status.toLowerCase() === "confirmed"
                      ? SUCCESS_GREEN + "20"
                      : "#F59E0B20",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      booking.status.toLowerCase() === "confirmed"
                        ? SUCCESS_GREEN
                        : "#F59E0B",
                  },
                ]}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>{booking.date}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {booking.customer.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.value}>{booking.customer}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 16 }]}>
            <Ionicons name="location-outline" size={20} color={TEXT_MUTED} />
            <Text style={styles.addressText}>{booking.address}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Notes</Text>
          <Text style={styles.notesText}>{booking.notes}</Text>
        </View>

        {/* Action Buttons (Only show if pending) */}
        {booking.status.toLowerCase() === "pending" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={handleApproveBooking}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.approveBtnText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  content: { padding: 16 },
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: { fontSize: 20, fontWeight: "700", color: TEXT_DARK, marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: { fontSize: 16, fontWeight: "600", color: TEXT_DARK },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  addressText: { flex: 1, marginLeft: 8, color: TEXT_DARK, fontSize: 14 },
  notesText: { color: TEXT_MUTED, lineHeight: 20 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: {
    backgroundColor: SUCCESS_GREEN,
  },
  approveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
