import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function BookingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // In a real app, fetch this from Supabase using the 'id'
  const booking = {
    id,
    customer: "Sarah Johnson",
    service: "Plumbing Repair",
    date: "Today, 2:00 PM",
    status: "confirmed",
    price: "$85",
    address: "123 Maracas Bay Rd, Port of Spain",
    notes: "Kitchen sink is leaking from the main pipe. Need urgent fix.",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Header */}
        <View style={styles.card}>
          <Text style={styles.label}>Service Type</Text>
          <Text style={styles.title}>{booking.service}</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>{booking.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Price</Text>
              <Text style={styles.priceText}>{booking.price}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{booking.customer[0]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.value}>{booking.customer}</Text>
              <TouchableOpacity
                onPress={() => {
                  /* Add Call Logic */
                }}
              >
                <Text style={{ color: PRIMARY_TEAL }}>View Profile</Text>
              </TouchableOpacity>
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

        {/* Actions */}
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => router.push(`../chat/${booking.id}`)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <Text style={styles.messageBtnText}>Message Customer</Text>
        </TouchableOpacity>
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
  priceText: { fontSize: 18, fontWeight: "700", color: PRIMARY_TEAL },
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
  messageBtn: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  messageBtnText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});
