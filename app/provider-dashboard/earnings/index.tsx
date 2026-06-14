// app/provider-dashboard/earnings/index.tsx
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

export default function EarningsDashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Total Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>$3,240.00</Text>
        <View style={styles.earningsStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>$840</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>$2,400</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("../provider-dashboard/earnings/history")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#E6F4F6" }]}>
            <Ionicons name="time-outline" size={24} color={PRIMARY_TEAL} />
          </View>
          <Text style={styles.actionTitle}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("../provider-dashboard/earnings/payouts")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="card-outline" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.actionTitle}>Payouts</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() =>
              router.push("../provider-dashboard/earnings/history")
            }
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {[
          {
            id: "1",
            customer: "Sarah Johnson",
            amount: "$85.00",
            date: "Today",
            status: "completed",
          },
          {
            id: "2",
            customer: "Mike Chen",
            amount: "$120.00",
            date: "Yesterday",
            status: "completed",
          },
          {
            id: "3",
            customer: "Lisa Brown",
            amount: "$200.00",
            date: "Mar 15",
            status: "pending",
          },
        ].map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={
                  transaction.status === "completed"
                    ? "checkmark-circle"
                    : "time"
                }
                size={20}
                color={
                  transaction.status === "completed" ? "#10B981" : "#F59E0B"
                }
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.customerName}>{transaction.customer}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={styles.transactionAmount}>{transaction.amount}</Text>
          </View>
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
  earningsCard: {
    backgroundColor: PRIMARY_TEAL,
    margin: 16,
    padding: 24,
    borderRadius: 20,
  },
  earningsLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  earningsAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 8,
  },
  earningsStats: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  stat: {
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  actionsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    marginTop: 12,
  },
  transactionsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  seeAll: {
    fontSize: 14,
    color: PRIMARY_TEAL,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG_GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  transactionDate: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
});
