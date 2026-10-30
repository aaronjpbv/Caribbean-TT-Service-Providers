// app/hardware/index.tsx
// "My Items" screen — cohesive, accessible hardware inventory management.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BG_GRAY,
  BORDER_COLOR,
  CARD_WHITE,
  DANGER_BG,
  DANGER_BORDER,
  DANGER_TEXT,
  PRIMARY_TEAL,
  SUCCESS_BG,
  SUCCESS_BORDER,
  TEAL_LIGHT,
  TEXT_DARK,
  TEXT_MUTED,
} from "./hardware-themes";
import { getCategoryLabel, HardwareItem } from "./hardwaretypes";

type TabKey = "all" | "in_stock" | "out_of_stock";

// ── Mock inventory dataset ────────────────────────────────────────────────
const MOCK_ITEMS: HardwareItem[] = [
  {
    id: "i1",
    provider_id: "mock_owner",
    name: "Steel Rebar (12mm)",
    category: "cement_concrete",
    price: 68,
    stock_quantity: 150,
    description: "Grade 60 reinforcing steel bar, 12mm diameter, 20ft lengths.",
    photo_urls: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&q=80"],
    created_at: "2025-06-01",
  },
  {
    id: "i2",
    provider_id: "mock_owner",
    name: "Plywood (4x8ft)",
    category: "hardware_misc",
    price: 110,
    stock_quantity: 80,
    description: "3/4in marine-grade plywood sheet.",
    photo_urls: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80"],
    created_at: "2025-05-20",
  },
  {
    id: "i3",
    provider_id: "mock_owner",
    name: "PVC Pipe (1\")",
    category: "plumbing",
    price: 15,
    stock_quantity: 200,
    description: "Schedule 40 PVC pipe, 1 inch diameter, 10ft length.",
    photo_urls: ["https://images.unsplash.com/photo-1580901369630-a1a1c0b64ac3?w=300&q=80"],
    created_at: "2025-05-10",
  },
  {
    id: "i4",
    provider_id: "mock_owner",
    name: "Cement (50kg)",
    category: "cement_concrete",
    price: 42,
    stock_quantity: 0,
    description: "High quality Portland cement for all construction needs.",
    photo_urls: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80"],
    created_at: "2025-04-28",
  },
];

// ── Accessible status badge component ─────────────────────────────────────
function StockPill({ inStock, count }: { inStock: boolean; count: number }) {
  return (
    <View
      style={[
        styles.stockPill,
        {
          backgroundColor: inStock ? SUCCESS_BG : DANGER_BG,
          borderColor: inStock ? SUCCESS_BORDER : DANGER_BORDER,
        },
      ]}
      accessibilityLabel={`Stock status: ${inStock ? `${count} available` : "Out of stock"}`}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: inStock ? "#059669" : DANGER_TEXT },
        ]}
      />
      <Text style={[styles.stockPillText, { color: inStock ? "#047857" : DANGER_TEXT }]}>
        {inStock ? `${count} in stock` : "Out of stock"}
      </Text>
    </View>
  );
}

// ── Main Screen Component ─────────────────────────────────────────────────
export default function MyItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { checking: checkingAgreement, accepted, accept } = usecommissionagreement(); 

  const [agreeing, setAgreeing] = useState(false);
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const handleAgree = async () => {
    setAgreeing(true);
    await accept();
    setAgreeing(false);
  };

  const fetchItems = useCallback(async () => {
    try {
      setItems(MOCK_ITEMS);
    } catch (error) {
      console.error("Error fetching items:", error);
      Alert.alert("Unable to load items", "Please check your network connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (accepted) {
        fetchItems();
      }
    }, [accepted, fetchItems])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleDelete = (item: HardwareItem) => {
    Alert.alert(
      "Remove Item?",
      `Are you sure you want to remove "${item.name}" from your catalog? Buyers will no longer see this listing.`,
      [
        { text: "Keep Item", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "in_stock") return item.stock_quantity > 0;
    if (activeTab === "out_of_stock") return item.stock_quantity === 0;
    return true;
  });

  const counts = {
    all: items.length,
    in_stock: items.filter((i) => i.stock_quantity > 0).length,
    out_of_stock: items.filter((i) => i.stock_quantity === 0).length,
  };

  if (checkingAgreement) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* Hero Navigation Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 44) }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push("/hardware/add-item")}
            accessibilityLabel="Add new item"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="add-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>
            {accepted ? "STORE INVENTORY" : "TERMS & AGREEMENTS"}
          </Text>
          <Text style={styles.headerTitle}>
            {accepted ? "Inventory" : "Payout Terms"}
          </Text>
          {accepted && (
            <Text style={styles.headerMeta}>
              {counts.all} {counts.all === 1 ? "item listed" : "items listed"} · {counts.in_stock} available now
            </Text>
          )}
        </View>
      </View>

      {!accepted ? (
        <CommissionDisclaimer onAgree={handleAgree} agreeing={agreeing} />
      ) : loading ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={PRIMARY_TEAL} />
          <Text style={styles.loadingText}>Gathering your inventory...</Text>
        </View>
      ) : (
        <>
          {/* Conversational / Iconic Filter Bar */}
          <View style={styles.filterSection}>
            <View style={styles.tabContainer}>
              {([
                { key: "all", label: "All Items", count: counts.all },
                { key: "in_stock", label: "In Stock", count: counts.in_stock },
                { key: "out_of_stock", label: "Out of Stock", count: counts.out_of_stock },
              ] as { key: TabKey; label: string; count: number }[]).map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabChip, isActive && styles.tabChipActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.8}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                      {tab.label}
                    </Text>
                    <View style={[styles.badgePill, isActive && styles.badgePillActive]}>
                      <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                        {tab.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Unified Card List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom + 100, 120) },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY_TEAL}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name={activeTab === "out_of_stock" ? "checkmark-circle-outline" : "cube-outline"}
                    size={36}
                    color={PRIMARY_TEAL}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  {activeTab === "all"
                    ? "No items added yet"
                    : activeTab === "in_stock"
                    ? "No items currently in stock"
                    : "No out-of-stock items"}
                </Text>
                <Text style={styles.emptyStateBody}>
                  {activeTab === "all"
                    ? "List your hardware, tools, or supplies so local buyers can discover and purchase them easily."
                    : activeTab === "in_stock"
                    ? "Items will appear here as soon as you update their stock quantities above zero."
                    : "Great job! All your catalog items currently have available stock."}
                </Text>
                {activeTab === "all" && (
                  <TouchableOpacity
                    style={styles.emptyStateBtn}
                    onPress={() => router.push("/hardware/add-item")}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.emptyStateBtnText}>Add Your First Item</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/hardware/add-item?itemId=${item.id}`)}
                accessibilityHint="Navigates to edit this hardware item"
              >
                <View style={styles.cardImageContainer}>
                  {item.photo_urls?.[0] ? (
                    <Image source={{ uri: item.photo_urls[0] }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="hardware-chip-outline" size={24} color={TEXT_MUTED} />
                    </View>
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.categoryTag}>
                    {getCategoryLabel(item.category).toUpperCase()}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardPrice}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <View style={styles.cardFooter}>
                    <StockPill
                      inStock={item.stock_quantity > 0}
                      count={item.stock_quantity}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() =>
                    Alert.alert(item.name, "Choose an action for this listing:", [
                      {
                        text: "Edit Details",
                        onPress: () => router.push(`/hardware/add-item?itemId=${item.id}`),
                      },
                      {
                        text: "Remove Listing",
                        style: "destructive",
                        onPress: () => handleDelete(item),
                      },
                      { text: "Cancel", style: "cancel" },
                    ])
                  }
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel={`More options for ${item.name}`}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color={TEXT_MUTED} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />

          {/* Sticky Floating CTA */}
          <View style={[styles.floatingBar, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
            <TouchableOpacity
              style={styles.primaryCta}
              activeOpacity={0.88}
              onPress={() => router.push("/hardware/add-item")}
              accessibilityRole="button"
              accessibilityLabel="Add new inventory item"
            >
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.primaryCtaText}>Add Item to Catalog</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ── Unified Styles Design System ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: "500",
  },

  // Hero Header Structure
  header: {
    backgroundColor: PRIMARY_TEAL,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerMeta: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 4,
    fontWeight: "500",
  },

  // Segmented Tab System
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  tabChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: PRIMARY_TEAL,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  tabChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  badgePill: {
    backgroundColor: BG_GRAY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },

  // Item List & Card Architecture
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  cardImageContainer: {
    marginRight: 14,
  },
  cardImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: TEAL_LIGHT,
  },
  cardImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: PRIMARY_TEAL,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  // Status Badge
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: "700",
  },

  cardActionBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 8,
  },

  // Conversational Empty State
  emptyStateContainer: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 28,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateBody: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: PRIMARY_TEAL,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Sticky Action Dock
  floatingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  primaryCta: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
}); 