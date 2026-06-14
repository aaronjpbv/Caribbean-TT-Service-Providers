import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";

export default function BookingRequests() {
  const requests = [
    {
      id: "4",
      customer: "James Paul",
      service: "Pipe Burst",
      date: "Immediate",
      price: "$150",
    },
    {
      id: "5",
      customer: "Anna Lee",
      service: "Maintenance",
      date: "Mon, 10:00 AM",
      price: "$60",
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.header}>
              <Text style={styles.customer}>{item.customer}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <Text style={styles.service}>{item.service}</Text>
            <Text style={styles.date}>Requested for: {item.date}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.declineBtn]}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.acceptBtn]}>
                <Text style={styles.acceptText}>Accept Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  requestCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  customer: { fontSize: 16, fontWeight: "700" },
  price: { color: PRIMARY_TEAL, fontWeight: "700" },
  service: { color: "#6B7280", marginBottom: 8 },
  date: { fontSize: 13, fontWeight: "500", marginBottom: 16 },
  actionRow: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  declineBtn: { backgroundColor: "#FEE2E2" },
  acceptBtn: { backgroundColor: PRIMARY_TEAL },
  declineText: { color: "#EF4444", fontWeight: "600" },
  acceptText: { color: "#fff", fontWeight: "600" },
});
