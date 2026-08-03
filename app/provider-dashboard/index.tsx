// app/provider-dashboard/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase"; // Ensure this path matches your project structure

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

export default function ProviderDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({
    earnings: 0,
    jobsDone: 0,
    rating: 0,
  });
  const [badges, setBadges] = useState({
    bookings: 0,
    messages: 0,
    reviews: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get Provider Profile Details
      const { data: provider, error: providerError } = await supabase
        .from("providers")
        .select("id, is_available")
        .eq("user_id", user.id)
        .single();

      if (providerError || !provider) {
        console.error("Provider profile not found", providerError);
        return;
      }

      setIsAvailable(provider.is_available);

      // 3. Fetch Completed Bookings for Earnings & Jobs Done
      // Tip: You can chain .gte('created_at', startOfMonth) to get strictly "This Month"
      const { data: completedBookings } = await supabase
        .from("bookings")
        .select("price")
        .eq("provider_id", provider.id)
        .eq("status", "completed");

      let totalEarnings = 0;
      let completedJobsCount = 0;

      if (completedBookings) {
        completedJobsCount = completedBookings.length;
        totalEarnings = completedBookings.reduce(
          (sum, job) => sum + (Number(job.price) || 0),
          0,
        );
      }

      // 4. Fetch Rating Average
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("provider_id", provider.id);

      let avgRating = 0;
      if (reviews && reviews.length > 0) {
        const sum = reviews.reduce(
          (acc, curr) => acc + (Number(curr.rating) || 0),
          0,
        );
        avgRating = sum / reviews.length;
      }

      setStats({
        earnings: totalEarnings,
        jobsDone: completedJobsCount,
        rating: Number(avgRating.toFixed(1)), // Keep it to 1 decimal place
      });

      // 5. Fetch Badges (Counts for pending items)
      const { count: pendingBookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", provider.id)
        .eq("status", "pending");

      const { count: unreadMessagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("status", "sent"); // Assuming "sent" means delivered but unread

      setBadges({
        bookings: pendingBookingsCount || 0,
        messages: unreadMessagesCount || 0,
        reviews: 0, // Add logic here if you have a way to track 'unread' reviews
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move the config inside the component so it can use the dynamic `badges` state
  const dashboardItems: DashboardCard[] = [
    {
      title: "Bookings",
      icon: "calendar",
      route: "/provider-dashboard/bookings",
      badge: badges.bookings,
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
      badge: badges.reviews,
      color: "#EC4899",
    },
    {
      title: "Messages",
      icon: "chatbubbles",
      route: "/provider-dashboard/messages",
      badge: badges.messages,
      color: "#3B82F6",
    },
    {
      title: "Settings",
      icon: "settings",
      route: "/provider-dashboard/settings",
      color: "#6B7280",
    },
  ];

  if (loading) {
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

  return (
    <ScrollView style={styles.container}>
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${stats.earnings.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.jobsDone}</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats.rating > 0 ? stats.rating : "-"}
          </Text>
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
              {item.badge && item.badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.gridLabel}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isAvailable ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAvailable ? "#10B981" : "#EF4444" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAvailable ? "#059669" : "#B91C1C" },
              ]}
            >
              {isAvailable ? "Available" : "Offline"}
            </Text>
          </View>
        </View>
        <Text style={styles.statusSubtitle}>
          {isAvailable
            ? "You're visible to customers and can receive bookings."
            : "You are currently hidden from search results."}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
});
