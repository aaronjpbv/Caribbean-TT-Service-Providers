// app/book/[provider_id].tsx
import { supabase } from "@/utils/supabase";
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

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function BookingFormScreen() {
  const { provider_id } = useLocalSearchParams<{ provider_id: string }>();
  const router = useRouter();

  const [providerName, setProviderName] = useState("the provider");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Availability State
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, string[]>
  >({});
  const [upcomingDates, setUpcomingDates] = useState<Date[]>([]);

  // Form State
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Generate the next 14 days for the date picker
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    setUpcomingDates(dates);

    if (provider_id) {
      fetchProviderDetails();
    }
  }, [provider_id]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);

      // 1. Fetch Provider Name
      const { data: providerData, error: providerError } = await supabase
        .from("providers")
        .select("company_name")
        .eq("id", provider_id)
        .single();

      if (!providerError && providerData) {
        setProviderName(providerData.company_name);
      }

      // 2. Fetch Provider Availability
      const { data: availData, error: availError } = await supabase
        .from("availability")
        .select("day_of_week, time_slots")
        .eq("provider_id", provider_id)
        .eq("is_available", true);

      if (!availError && availData) {
        const map: Record<string, string[]> = {};
        availData.forEach((item) => {
          map[item.day_of_week] = item.time_slots || [];
        });
        setAvailabilityMap(map);
      }
    } catch (error) {
      console.log("Error fetching provider details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleBooking = async () => {
    if (!clientName || !service || !selectedDate || !selectedTime || !address) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in to book.");

      const combinedNotes = `Service Address: ${address}\n\nAdditional Notes: ${notes}`;

      // Format date as YYYY-MM-DD for the database
      const formattedDate = selectedDate.toISOString().split("T")[0];

      const { error: insertError } = await supabase.from("bookings").insert({
        provider_id: provider_id,
        client_id: user.id,
        client_name: clientName,
        service: service,
        scheduled_date: formattedDate,
        scheduled_time: selectedTime,
        notes: combinedNotes,
        status: "pending",
      });

      if (insertError) throw insertError;

      Alert.alert(
        "Request Sent!",
        `Your booking request has been sent to ${providerName}.`,
        [{ text: "OK", onPress: () => router.replace("/bookings") }],
      );
    } catch (error: any) {
      console.error("Booking submission error:", error);
      Alert.alert(
        "Submission Failed",
        error.message || "An error occurred while booking.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get time slots for the currently selected date
  const getAvailableTimesForSelectedDate = () => {
    if (!selectedDate) return [];
    const dayShort = DAY_NAMES[selectedDate.getDay()]; // e.g. "Mon"
    return availabilityMap[dayShort] || [];
  };

  const availableTimeSlots = getAvailableTimesForSelectedDate();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Service</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={PRIMARY_TEAL}
            style={{ marginBottom: 20 }}
          />
        ) : (
          <Text style={styles.introText}>
            Fill out the details below to request a service from{" "}
            <Text style={styles.boldText}>{providerName}</Text>.
          </Text>
        )}

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={TEXT_MUTED}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Needed *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ceiling Fan Installation"
              placeholderTextColor={TEXT_MUTED}
              value={service}
              onChangeText={setService}
            />
          </View>

          {/* Date Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Date *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScroll}
            >
              {upcomingDates.map((date, index) => {
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();
                const dayShort = DAY_NAMES[date.getDay()];
                const dayNum = date.getDate();
                const monthShort = MONTH_NAMES[date.getMonth()];

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardActive,
                    ]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text
                      style={[styles.dateDay, isSelected && styles.textActive]}
                    >
                      {dayShort}
                    </Text>
                    <Text
                      style={[styles.dateNum, isSelected && styles.textActive]}
                    >
                      {dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        isSelected && styles.textActive,
                      ]}
                    >
                      {monthShort}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Time *</Text>
            {!selectedDate ? (
              <Text style={styles.mutedText}>Please select a date first</Text>
            ) : availableTimeSlots.length === 0 ? (
              <Text style={styles.mutedText}>No availability on this day.</Text>
            ) : (
              <View style={styles.timeGrid}>
                {availableTimeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotActive,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          isSelected && styles.textActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St, Parish"
              placeholderTextColor={TEXT_MUTED}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what needs to be done..."
              placeholderTextColor={TEXT_MUTED}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Send Booking Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
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
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introText: {
    fontSize: 15,
    color: TEXT_DARK,
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  boldText: {
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_DARK,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  dateCard: {
    width: 65,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardActive: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  dateDay: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  dateNum: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlot: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: "center",
  },
  timeSlotActive: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_DARK,
  },
  textActive: {
    color: "#fff",
  },
  mutedText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
