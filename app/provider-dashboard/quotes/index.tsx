// app/provider-dashboard/quotes/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";

export default function QuotesListScreen() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!provider) return;

      // 1. Fetch the quotes without the complex join
      const { data: quotesData, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 2. Loop through and attach the customer names manually
      const quotesWithCustomers = await Promise.all(
        (quotesData || []).map(async (quote) => {
          const { data: customerData } = await supabase
            .from("users")
            .select("full_name")
            .eq("id", quote.customer_id)
            .maybeSingle();

          return {
            ...quote,
            customer: customerData || { full_name: "Customer" },
          };
        }),
      );

      setQuotes(quotesWithCustomers);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`/provider-dashboard/quotes/${item.id}` as any)
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.status === "pending" ? "#FEF3C7" : "#D1FAE5",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: item.status === "pending" ? "#D97706" : "#059669" },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.customerName}>
        From: {item.customer?.full_name || "Customer"}
      </Text>

      <View style={styles.detailsRow}>
        <Ionicons name="cash-outline" size={16} color="#6B7280" />
        <Text style={styles.detailText}>
          Budget: {item.budget ? item.budget : "Not specified"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Requested Quotes</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No quote requests yet.</Text>
        }
      />
    </View>
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
  listContainer: { padding: 16, gap: 12 },
  card: {
    backgroundColor: CARD_WHITE,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  customerName: { fontSize: 14, color: "#4B5563", marginBottom: 12 },
  detailsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#6B7280" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6B7280" },
});
