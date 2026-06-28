// app/provider-dashboard/bookings/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";

const bookings = [
  {
    id: "1",
    customer: "Sarah Johnson",
    service: "Plumbing Repair",
    date: "Today, 2:00 PM",
    status: "confirmed",
    price: "$85",
  },
  {
    id: "2",
    customer: "Mike Chen",
    service: "Leak Fix",
    date: "Tomorrow, 10:00 AM",
    status: "pending",
    price: "$120",
  },
  {
    id: "3",
    customer: "Lisa Brown",
    service: "Pipe Installation",
    date: "Mar 20, 9:00 AM",
    status: "completed",
    price: "$200",
  },
];

export default function BookingsList() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      default:
        return TEXT_MUTED;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["All", "Pending", "Confirmed", "Completed"].map((filter) => (
          <TouchableOpacity key={filter} style={styles.filterTab}>
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New Requests Banner */}
      <TouchableOpacity
        style={styles.requestsBanner}
        onPress={() =>
          router.push("../../app/provider-dashboard/bookings/requests")
        }
      >
        <View style={styles.requestsIcon}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>
        <View style={styles.requestsText}>
          <Text style={styles.requestsTitle}>3 New Booking Requests</Text>
          <Text style={styles.requestsSubtitle}>Tap to review and respond</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={PRIMARY_TEAL} />
      </TouchableOpacity>

      {/* Bookings List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Upcoming & Recent</Text>
        {bookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            style={styles.bookingCard}
            onPress={() =>
              router.push(`../../app/provider-dashboard/bookings/${booking.id}`)
            }
          >
            <View style={styles.bookingHeader}>
              <Text style={styles.customerName}>{booking.customer}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(booking.status) },
                  ]}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceName}>{booking.service}</Text>
            <View style={styles.bookingFooter}>
              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={TEXT_MUTED}
                />
                <Text style={styles.dateText}>{booking.date}</Text>
              </View>
              <Text style={styles.price}>{booking.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_DARK,
  },
  requestsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY_TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  requestsText: {
    flex: 1,
    marginLeft: 16,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  requestsSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  serviceName: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
});
