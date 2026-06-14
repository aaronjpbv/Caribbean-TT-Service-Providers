// app/provider-dashboard/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";

interface DashboardCard {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  color: string;
}

const dashboardItems: DashboardCard[] = [
  {
    title: "Bookings",
    icon: "calendar",
    route: "/provider-dashboard/bookings",
    badge: 3,
    color: "#0F6C7B",
  },
  {
    title: "Earnings",
    icon: "wallet",
    route: "/provider-dashboard/earnings",
    color: "#10B981",
  },
  {
    title: "Portfolio",
    icon: "images",
    route: "/provider-dashboard/portfolio",
    color: "#8B5CF6",
  },
  {
    title: "Availability",
    icon: "time",
    route: "/provider-dashboard/availability",
    color: "#F59E0B",
  },
  {
    title: "Reviews",
    icon: "star",
    route: "/provider-dashboard/reviews",
    badge: 12,
    color: "#EC4899",
  },
  {
    title: "Messages",
    icon: "chatbubbles",
    route: "/provider-dashboard/messages",
    badge: 5,
    color: "#3B82F6",
  },
  {
    title: "Settings",
    icon: "settings",
    route: "/provider-dashboard/settings",
    color: "#6B7280",
  },
];

export default function ProviderDashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$1,240</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.gridContainer}>
        {dashboardItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.gridItem}
            onPress={() => router.push(item.route as any)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons name={item.icon} size={28} color={item.color} />
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.gridLabel}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        </View>
        <Text style={styles.statusSubtitle}>
          You're visible to customers and can receive bookings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY_TEAL,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  gridItem: {
    width: (width - 56) / 2,
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: CARD_WHITE,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  statusCard: {
    backgroundColor: CARD_WHITE,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  statusSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
});
