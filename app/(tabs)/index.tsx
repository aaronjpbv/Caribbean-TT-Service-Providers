// app/(tabs)/index.tsx

import { supabase } from "@/utils/supabase";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Link, useRouter } from "expo-router";

import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── 2. CONSTANTS ─────────────────────────────────────────────────────────────

const { width } = Dimensions.get("window");

const PRIMARY_TEAL = "#1d3557";
const PRIMARY_LIGHT = "#1A8A9C";
const ACCENT_GOLD = "#F5A623";
const BG_GRAY = "#F4F1EB";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";

// ── 3. STATIC DATA ───────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  icon: string;
  type: "ionicons" | "material";
};

const categories: Category[] = [
  { id: "all", name: "All", icon: "apps-outline", type: "ionicons" },
  { id: "plumbing", name: "Plumbing", icon: "pipe", type: "material" },
  {
    id: "electrical",
    name: "Electrical",
    icon: "flash-outline",
    type: "ionicons",
  },
  {
    id: "landscaping",
    name: "Lawn Care",
    icon: "leaf-outline",
    type: "ionicons",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "sparkles-outline",
    type: "ionicons",
  },
  {
    id: "painting",
    name: "Painting",
    icon: "color-palette-outline",
    type: "ionicons",
  },
  {
    id: "hvac",
    name: "AC Services",
    icon: "air-conditioner",
    type: "material",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: "hammer-outline",
    type: "ionicons",
  },
  {
    id: "security",
    name: "Security",
    icon: "shield-checkmark-outline",
    type: "ionicons",
  },
  { id: "legal", name: "Legal", icon: "gavel", type: "material" },
  {
    id: "admin",
    name: "Admin Services",
    icon: "document-text-outline",
    type: "ionicons",
  },
];

const regions = ["All", "North", "Central", "South", "East", "West", "Tobago"];

// ── 4. TYPE DEFINITIONS ───────────────────────────────────────────────────────

type Provider = {
  id: number;
  company_name: string;
  category: string;
  region: string;
  rating: number;
  reviews: number;
  verified: boolean;
  image: string | null;
};

// ── 5. COMPONENT ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── 5a. STATE ──────────────────────────────────────────────────────────

  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [menuVisible, setMenuVisible] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));

  // Logo animation states - Conversational principle
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const logoYAnim = useRef(new Animated.Value(20)).current;

  // ── 5b. ROUTER ─────────────────────────────────────────────────────────

  const router = useRouter();

  // ── 5c. SIDE EFFECTS ───────────────────────────────────────────────────

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase.from("providers").select("*");
      setProviders(data ?? []);
    };

    const checkUserStatus = async () => {
      try {
        const guestStatus = await AsyncStorage.getItem("isGuest");
        if (guestStatus === "true") {
          setIsGuest(true);
          return;
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/(auth)/sign-in");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        router.replace("/(auth)/sign-in");
      }
    };

    fetchProviders();
    checkUserStatus();

    // Animate logo on mount - Conversational principle
    Animated.parallel([
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(logoYAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── 5d. DERIVED STATE ──────────────────────────────────────────────────

  const filteredProviders = providers.filter((provider) => {
    const matchesRegion =
      selectedRegion === "All" || provider.region === selectedRegion;

    const matchesSearch =
      (provider.company_name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (provider.category ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || provider.category === selectedCategory;

    return matchesRegion && matchesSearch && matchesCategory;
  });

  // ── 5e. EVENT HANDLERS ─────────────────────────────────────────────────

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const handleLogout = async () => {
    closeMenu();

    if (isGuest) {
      Alert.alert(
        "Exit Guest Mode",
        "Are you sure you want to leave? You'll need to sign in to access your account.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem("isGuest");
                router.replace("/(auth)/sign-in");
              } catch (error) {
                console.error("Guest logout error:", error);
                Alert.alert("Error", "Failed to exit guest mode");
              }
            },
          },
        ],
      );
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
              return;
            }
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleProfile = () => {
    closeMenu();
    if (isGuest) {
      Alert.alert(
        "Guest User",
        "Please sign in or create an account to access your profile.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
        ],
      );
      return;
    }
    router.push("/profile/profile");
  };

  // Logo press handler - Conversational interaction
  const handleLogoPress = () => {
    Animated.sequence([
      Animated.timing(logoScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Interpolate rotation for continuous subtle motion
  const spin = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  // ── 5f. JSX ────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            {/* Logo - Iconic & Conversational */}
            <TouchableOpacity
              onPress={handleLogoPress}
              activeOpacity={0.8}
              style={styles.logoContainer}
            >
              <Animated.View
                style={[
                  styles.logoWrapper,
                  {
                    transform: [
                      { scale: logoScaleAnim },
                      { translateY: logoYAnim },
                      { rotate: spin },
                    ],
                  },
                ]}
              >
                <Image
                  source={require("../../assets/images/logo.png")} // Update path as needed
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.brandText}>
              <Text style={styles.greeting}>JobSite</Text>
              <Text style={styles.title}>
                Find Qualified Professionals your friends Trust
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.userButton}
            onPress={openMenu}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle" size={44} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={TEXT_MUTED} />
            <TextInput
              placeholder="Search services, providers..."
              placeholderTextColor={TEXT_MUTED}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── DROPDOWN MENU MODAL ── */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Ionicons name="person-circle" size={48} color={PRIMARY_TEAL} />
              <Text style={styles.menuTitle}>
                {isGuest ? "Guest" : "My Account"}
              </Text>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Ionicons
                name={isGuest ? "log-in-outline" : "person-outline"}
                size={22}
                color={TEXT_DARK}
              />
              <Text style={styles.menuItemText}>
                {isGuest ? "Sign In" : "Profile"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                {isGuest ? "Exit Guest Mode" : "Logout"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ── SCROLLABLE BODY ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── CATEGORY GRID ── */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid3x3}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard3x3,
                  selectedCategory === category.name &&
                    styles.categoryCard3x3Active,
                ]}
                onPress={() => handleCategoryPress(category.name)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryIcon3x3,
                    selectedCategory === category.name &&
                      styles.categoryIcon3x3Active,
                  ]}
                >
                  {category.type === "material" ? (
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={28}
                      color={
                        selectedCategory === category.name
                          ? "#fff"
                          : PRIMARY_TEAL
                      }
                    />
                  ) : (
                    <Ionicons
                      name={category.icon as any}
                      size={28}
                      color={
                        selectedCategory === category.name
                          ? "#fff"
                          : PRIMARY_TEAL
                      }
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.categoryName3x3,
                    selectedCategory === category.name &&
                      styles.categoryName3x3Active,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── REGION FILTER ── */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter by Region</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                onPress={() => setSelectedRegion(region)}
                style={[
                  styles.filterPill,
                  selectedRegion === region && styles.activePill,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedRegion === region && styles.activePillText,
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── PROVIDER LIST ── */}
        <View style={styles.providersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Providers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProviders}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Link href={`/provider/${item.id}`} asChild>
                <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                  <View style={styles.cardImageContainer}>
                    <View style={styles.cardImagePlaceholder}>
                      <Text style={styles.avatarText}>
                        {(item.company_name ?? "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </Text>
                    </View>
                    {item.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={PRIMARY_TEAL}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.providerName}>
                        {item.company_name}
                      </Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={ACCENT_GOLD} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    <View style={styles.cardMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="business-outline"
                          size={14}
                          color={TEXT_MUTED}
                        />
                        <Text style={styles.metaText}>{item.category}</Text>
                      </View>
                      <View style={styles.metaDot} />
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={TEXT_MUTED}
                        />
                        <Text style={styles.metaText}>{item.region}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.reviewsText}>
                        {item.reviews} reviews
                      </Text>
                      <View style={styles.arrowContainer}>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color={PRIMARY_TEAL}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={TEXT_MUTED} />
                <Text style={styles.emptyTitle}>No providers found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your filters or search query
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedRegion("All");
                    setSelectedCategory("All");
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ── 6. STYLES ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  header: {
    backgroundColor: PRIMARY_TEAL,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  // Unified brand container
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  // Logo container - Iconic & Universal
  logoContainer: {
    marginRight: 12,
  },
  logoWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  logo: {
    width: "85%",
    height: "85%",
  },
  brandText: {
    flex: 1,
  },
  greeting: {
    color: "#FFBF00",
    fontSize: 18,
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  userButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdownMenu: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
  },
  menuTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  logoutText: {
    color: "#E74C3C",
  },
  searchContainer: {
    marginTop: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  categoriesSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  categoriesGrid3x3: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard3x3: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryCard3x3Active: {
    backgroundColor: PRIMARY_TEAL,
    shadowColor: PRIMARY_TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  categoryIcon3x3: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(15, 108, 123, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryIcon3x3Active: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  categoryName3x3: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  categoryName3x3Active: {
    color: "#fff",
  },
  filterSection: {
    marginTop: 24,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: CARD_WHITE,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activePill: {
    backgroundColor: PRIMARY_TEAL,
    shadowColor: PRIMARY_TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  pillText: {
    color: TEXT_MUTED,
    fontWeight: "600",
    fontSize: 14,
  },
  activePillText: {
    color: "#fff",
    fontWeight: "700",
  },
  providersSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: PRIMARY_TEAL,
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImageContainer: {
    position: "relative",
  },
  cardImagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(15, 108, 123, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  providerName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: ACCENT_GOLD,
    fontSize: 13,
    fontWeight: "700",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 4,
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "500",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT_MUTED,
    marginHorizontal: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  reviewsText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "500",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(15, 108, 123, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: PRIMARY_TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
