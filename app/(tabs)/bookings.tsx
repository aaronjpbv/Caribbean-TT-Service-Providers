// app/(tabs)/bookings.tsx (or your current path)
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatBookingDateTime,
  getBookingPhase,
  PHASE_COLORS,
  PHASE_LABELS,
} from "../../utils/booking";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

const filterOptions = ["All", "Quote", "Confirmed", "Completed"] as const;

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<(typeof filterOptions)[number]>("All");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Adjust the table name and relations based on your exact Supabase schema
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          providers ( company_name )
        `,
        )
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  const visibleBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const phase = getBookingPhase(booking);

      if (activeFilter === "All") return true;
      if (activeFilter === "Quote") {
        return phase === "awaiting_quote" || phase === "quote_received";
      }
      if (activeFilter === "Confirmed") return phase === "confirmed";
      return phase === "completed";
    });
  }, [activeFilter, bookings]);

  const upcomingCount = bookings.filter((booking) => {
    const phase = getBookingPhase(booking);
    return (
      phase === "awaiting_quote" ||
      phase === "quote_received" ||
      phase === "confirmed"
    );
  }).length;

  const spendTotal = bookings
    .filter((booking) => booking.quoted_price)
    .reduce((sum, booking) => sum + Number(booking.quoted_price), 0);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
        <Text style={{ marginTop: 12, color: TEXT_MUTED }}>
          Loading bookings...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>My bookings</Text>
        <Text style={styles.heroSubtitle}>
          Track quotes, confirmations, and past service appointments.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${spendTotal}</Text>
            <Text style={styles.statLabel}>Spend</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterWrap}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.activeFilterChip,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent appointments</Text>
        <Text style={styles.sectionHint}>{visibleBookings.length} records</Text>
      </View>

      {visibleBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No bookings found for this filter.
          </Text>
        </View>
      ) : (
        visibleBookings.map((booking) => {
          const phase = getBookingPhase(booking);
          const statusColor = PHASE_COLORS[phase];
          const providerName =
            booking.providers?.company_name || "Unknown Provider";

          return (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}` as any)}
            >
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.providerName} numberOfLines={1}>
                    {providerName}
                  </Text>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {booking.service}
                  </Text>
                </View>
                <View
                  style={[
                    styles.phaseBadge,
                    { backgroundColor: `${statusColor}20` },
                  ]}
                >
                  <Text style={[styles.phaseText, { color: statusColor }]}>
                    {PHASE_LABELS[phase]}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={TEXT_MUTED}
                />
                <Text style={styles.metaText}>
                  {formatBookingDateTime(booking.date, booking.time)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={TEXT_MUTED}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {booking.address}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.bookingId}>
                  Booking #{booking.id.toString().slice(0, 8).toUpperCase()}
                </Text>
                <Text style={styles.priceText}>
                  {booking.quoted_price
                    ? `$${booking.quoted_price}`
                    : "Quote pending"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  contentContainer: { padding: 16, paddingBottom: 36 },
  heroCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  heroSubtitle: { marginTop: 4, color: TEXT_MUTED, fontSize: 13 },
  statsRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_GRAY,
    borderRadius: 14,
    paddingVertical: 14,
  },
  statValue: { fontSize: 17, fontWeight: "800", color: PRIMARY_TEAL },
  statLabel: { marginTop: 3, fontSize: 11, color: TEXT_MUTED },
  filterWrap: { marginTop: 16, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: CARD_WHITE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  activeFilterChip: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  filterText: { color: TEXT_DARK, fontSize: 12, fontWeight: "700" },
  activeFilterText: { color: "#fff" },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: TEXT_DARK },
  sectionHint: { fontSize: 12, color: TEXT_MUTED },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyStateText: { color: TEXT_MUTED, fontSize: 14 },
  bookingCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  providerName: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  serviceName: { marginTop: 4, fontSize: 13, color: TEXT_MUTED },
  phaseBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  phaseText: { fontSize: 11, fontWeight: "800" },
  metaRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: { flex: 1, color: TEXT_MUTED, fontSize: 13 },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingId: { color: TEXT_MUTED, fontSize: 12, fontWeight: "600" },
  priceText: { color: PRIMARY_TEAL, fontSize: 15, fontWeight: "800" },
});
