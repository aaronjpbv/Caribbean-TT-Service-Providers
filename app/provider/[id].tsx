// app/provider/[id].tsx
// Worker/Provider Profile Screen
// Navigate here: router.push(`/provider/${workerId}`)

import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIMARY_TEAL = "#1d3557";
const TEAL_LIGHT = "#E6F4F6";
const TEAL_MID = "#D0ECF0";
const AMBER = "#F5A623";
const AMBER_BG = "#FFF3DC";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";
const SUCCESS_GREEN = "#34D399";
const SUCCESS_BG = "#D1FAE5";
const DANGER_RED = "#FCA5A5";
const DANGER_BG = "#FEE2E2";

// ── Types ─────────────────────────────────────────────────────────────────────
// Matches the `providers` table columns
interface Worker {
  id: string; // providers.id
  user_id: string | null; // providers.user_id (FK -> users.id)
  name: string; // providers.company_name
  trade: string; // providers.category
  location: string; // providers.region
  bio: string;
  response_time: string;
  jobs_completed: number;
  rating: number;
  review_count: number; // providers.reviews
  is_verified: boolean; // providers.verified
  avatar_url: string | null; // providers.image
  skills: string[];
}

interface PortfolioItem {
  id: string;
  title: string;
  location: string;
  image_url: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Availability {
  [day: string]: boolean;
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Helper utilities ──────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-TT", {
    month: "short",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text
          key={s}
          style={{
            fontSize: size,
            color: s <= Math.round(rating) ? AMBER : "#E0E0E0",
          }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingBadgeStar}>★</Text>
      <Text style={styles.ratingBadgeValue}>{rating}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionTitleLine} />
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "reviews">(
    "about",
  );

  useEffect(() => {
    if (id) fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // ── 1. Provider core info ──────────────────────────────────────────
      const { data: providerData, error: providerError } = await supabase
        .from("providers")
        .select("*")
        .eq("id", id)
        .single();

      if (providerError) throw providerError;

      setWorker({
        id: providerData.id,
        user_id: providerData.user_id,
        name: providerData.company_name,
        trade: providerData.category,
        location: providerData.region,
        bio: providerData.bio ?? "No bio provided yet.",
        response_time: providerData.response_time ?? "N/A",
        jobs_completed: providerData.jobs_completed ?? 0,
        rating: providerData.rating ?? 0,
        review_count: providerData.reviews ?? 0,
        is_verified: providerData.verified ?? false,
        avatar_url: providerData.image,
        skills: providerData.skills ?? [],
      });

      // ── 2. Portfolio ────────────────────────────────────────────────────
      const { data: portfolioData } = await supabase
        .from("portfolio")
        .select("*")
        .eq("provider_id", id);

      setPortfolio(
        (portfolioData ?? []).map((p) => ({
          id: p.id,
          title: p.title,
          location: p.location ?? "",
          image_url: p.image_url,
        })),
      );

      // ── 3. Reviews ──────────────────────────────────────────────────────
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("provider_id", id)
        .order("created_at", { ascending: false });

      setReviews(
        (reviewData ?? []).map((r) => ({
          id: r.id,
          reviewer_name: r.reviewer_name,
          rating: r.rating,
          comment: r.comment ?? "",
          created_at: r.created_at,
        })),
      );

      // ── 4. Availability ─────────────────────────────────────────────────
      const { data: availData } = await supabase
        .from("availability")
        .select("*")
        .eq("provider_id", id);

      const availMap: Availability = {};
      DAY_ORDER.forEach((day) => {
        const match = availData?.find(
          (a) => a.day_of_week?.slice(0, 3) === day,
        );
        availMap[day] = match?.is_available ?? false;
      });
      setAvailability(availMap);
    } catch (error) {
      console.error("Error fetching provider:", error);
      Alert.alert("Error", "Could not load provider profile.");
    } finally {
      setLoading(false);
    }
  };

  // ── Chat handler — auth-gated ─────────────────────────────────────────────
  const handleChatPress = async () => {
    if (!worker) return;

    if (!worker.user_id) {
      Alert.alert(
        "Unavailable",
        "This provider hasn't finished setting up their account yet, so chat isn't available.",
      );
      return;
    }

    try {
      setChatLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          "Sign In Required",
          "You need to be signed in to chat with providers.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
          ],
        );
        return;
      }

      if (user.id === worker.user_id) {
        Alert.alert("Oops", "You can't chat with yourself.");
        return;
      }

      // ✅ Use worker.id (providers.id) — NOT worker.user_id (auth UUID)
      const { data: existing, error: existingError } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("provider_id", worker.id) // ✅ fixed
        .maybeSingle();

      if (existingError) {
        console.error("Lookup error:", existingError);
      }

      if (existing) {
        router.push(`/chat/${existing.id}` as any);
        return;
      }

      const { data: newConvo, error: createError } = await supabase
        .from("conversations")
        .insert({
          customer_id: user.id,
          provider_id: worker.id, // ✅ fixed
        })
        .select("id")
        .single();

      if (createError || !newConvo) {
        console.error("Create conversation error:", createError);
        Alert.alert("Error", "Could not start conversation. Please try again.");
        return;
      }

      router.push(`/chat/${newConvo.id}` as any);
    } catch (error) {
      console.error("Chat error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="person-outline" size={48} color={TEXT_MUTED} />
        <Text style={styles.loadingText}>Provider not found</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          {/* Avatar + core info */}
          <View style={styles.heroRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarBox}>
                {worker.avatar_url ? (
                  <Image
                    source={{ uri: worker.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {getInitials(worker.name)}
                  </Text>
                )}
              </View>
              {worker.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName} numberOfLines={1}>
                  {worker.name}
                </Text>
                <RatingBadge rating={worker.rating} />
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name="construct-outline"
                  size={13}
                  color={TEXT_MUTED}
                />
                <Text style={styles.metaText}> {worker.trade}</Text>
                <Text style={styles.metaDot}> · </Text>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={TEXT_MUTED}
                />
                <Text style={styles.metaText}> {worker.location}</Text>
              </View>

              <Text style={styles.reviewCountText}>
                {worker.review_count} verified reviews
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.heroDivider} />

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <StatItem value={`${worker.jobs_completed}+`} label="Jobs Done" />
            <View style={styles.statDivider} />
            <StatItem value={worker.response_time} label="Avg Response" />
            <View style={styles.statDivider} />
            <StatItem value={`${worker.rating} ★`} label="Rating" />
          </View>
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {(["about", "portfolio", "reviews"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        <View style={styles.body}>
          {/* ══ ABOUT ══ */}
          {activeTab === "about" && (
            <>
              <SectionTitle title="About" />
              <View style={styles.card}>
                <Text style={styles.bioText}>{worker.bio}</Text>
              </View>

              {worker.skills?.length > 0 && (
                <>
                  <SectionTitle title="Specialisations" />
                  <View style={styles.chipsRow}>
                    {worker.skills.map((s) => (
                      <View key={s} style={styles.chip}>
                        <Text style={styles.chipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {Object.keys(availability).length > 0 && (
                <>
                  <SectionTitle title="Availability This Week" />
                  <View style={styles.card}>
                    <View style={styles.availRow}>
                      {Object.entries(availability).map(([day, avail]) => (
                        <View key={day} style={styles.dayCol}>
                          <View
                            style={[
                              styles.dayDot,
                              avail ? styles.dotGreen : styles.dotRed,
                            ]}
                          />
                          <Text style={styles.dayText}>{day.slice(0, 2)}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.dotGreen]} />
                        <Text style={styles.legendText}>Available</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.dotRed]} />
                        <Text style={styles.legendText}>Booked</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </>
          )}

          {/* ══ PORTFOLIO ══ */}
          {activeTab === "portfolio" && (
            <>
              <SectionTitle title="Past Work" />
              {portfolio.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="images-outline"
                    size={32}
                    color={TEXT_MUTED}
                  />
                  <Text style={styles.emptyText}>No portfolio items yet.</Text>
                </View>
              ) : (
                portfolio.map((item) => (
                  <View key={item.id} style={styles.portfolioCard}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.portfolioImage}
                    />
                    <View style={styles.portfolioFooter}>
                      <Text style={styles.portfolioTitle}>{item.title}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color={TEXT_MUTED}
                        />
                        <Text style={styles.metaText}> {item.location}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* ══ REVIEWS ══ */}
          {activeTab === "reviews" && (
            <>
              <View style={[styles.card, styles.reviewSummaryCard]}>
                <Text style={styles.bigRating}>{worker.rating}</Text>
                <StarRating rating={worker.rating} size={22} />
                <Text style={styles.reviewSummaryText}>
                  Based on {worker.review_count} reviews
                </Text>
              </View>

              <SectionTitle title="Recent Reviews" />

              {reviews.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={32}
                    color={TEXT_MUTED}
                  />
                  <Text style={styles.emptyText}>No reviews yet.</Text>
                </View>
              ) : (
                reviews.map((r) => (
                  <View key={r.id} style={styles.card}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {r.reviewer_name[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewerName}>
                          {r.reviewer_name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <StarRating rating={r.rating} />
                          <Text style={styles.reviewDate}>
                            {formatDate(r.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky booking bar ── */}
      <View style={styles.bookingBar}>
        {/* Chat button */}
        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.85}
          onPress={handleChatPress}
          disabled={chatLoading}
        >
          {chatLoading ? (
            <ActivityIndicator size="small" color={PRIMARY_TEAL} />
          ) : (
            <>
              <Ionicons
                name="chatbubble-ellipses"
                size={18}
                color={PRIMARY_TEAL}
              />
              <Text style={styles.chatBtnText}>Chat</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Request a Quote button */}
        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "The quote request feature will be available soon. For now, you can chat with the provider to discuss your project.",
            )
          }
        >
          <Text style={styles.bookBtnText}>Request a Quote</Text>
          <Ionicons
            name="arrow-forward"
            size={15}
            color="#fff"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  loadingText: { marginTop: 12, color: TEXT_MUTED, fontSize: 15 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── Hero card ────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: CARD_WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  heroRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: TEAL_MID,
  },
  avatarImage: { width: 68, height: 68, borderRadius: 14 },
  avatarInitials: { fontSize: 22, fontWeight: "700", color: PRIMARY_TEAL },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY_TEAL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: CARD_WHITE,
  },

  heroInfo: { flex: 1, gap: 5, paddingTop: 2 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  workerName: { fontSize: 17, fontWeight: "700", color: TEXT_DARK, flex: 1 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AMBER_BG,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  ratingBadgeStar: { fontSize: 12, color: AMBER },
  ratingBadgeValue: { fontSize: 12, fontWeight: "700", color: AMBER },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaText: { fontSize: 13, color: TEXT_MUTED },
  metaDot: { fontSize: 13, color: BORDER_COLOR },
  reviewCountText: { fontSize: 12, color: TEXT_MUTED },

  heroDivider: { height: 1, backgroundColor: BG_GRAY, marginVertical: 16 },

  statsStrip: {
    flexDirection: "row",
    backgroundColor: BG_GRAY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  statLabel: { fontSize: 11, color: TEXT_MUTED },
  statDivider: { width: 1, height: 26, backgroundColor: BORDER_COLOR },

  // ── Tab bar ──────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: "row",
    backgroundColor: CARD_WHITE,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: PRIMARY_TEAL },
  tabText: { fontSize: 14, fontWeight: "600", color: TEXT_MUTED },
  tabTextActive: { color: "#fff" },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 16, paddingTop: 4 },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  sectionTitleLine: { flex: 1, height: 1, backgroundColor: BORDER_COLOR },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bioText: { fontSize: 14, color: TEXT_DARK, lineHeight: 23 },

  emptyCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  emptyText: { fontSize: 14, color: TEXT_MUTED },

  // ── Skills chips ──────────────────────────────────────────────────────────
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: TEAL_MID,
  },
  chipText: { fontSize: 13, color: PRIMARY_TEAL, fontWeight: "600" },

  // ── Availability ─────────────────────────────────────────────────────────
  availRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayCol: { alignItems: "center", gap: 6 },
  dayDot: { width: 36, height: 36, borderRadius: 18 },
  dotGreen: {
    backgroundColor: SUCCESS_BG,
    borderWidth: 2,
    borderColor: SUCCESS_GREEN,
  },
  dotRed: {
    backgroundColor: DANGER_BG,
    borderWidth: 2,
    borderColor: DANGER_RED,
  },
  dayText: { fontSize: 11, fontWeight: "600", color: TEXT_MUTED },
  legendRow: { flexDirection: "row", gap: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: TEXT_MUTED },

  // ── Portfolio ─────────────────────────────────────────────────────────────
  portfolioCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  portfolioImage: { width: "100%", height: 190 },
  portfolioFooter: { padding: 14, gap: 5 },
  portfolioTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },

  // ── Reviews ───────────────────────────────────────────────────────────────
  reviewSummaryCard: { alignItems: "center", gap: 8, paddingVertical: 20 },
  bigRating: {
    fontSize: 52,
    fontWeight: "800",
    color: TEXT_DARK,
    lineHeight: 56,
  },
  reviewSummaryText: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 16, fontWeight: "700", color: PRIMARY_TEAL },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 3,
  },
  reviewDate: { fontSize: 12, color: TEXT_MUTED },
  reviewComment: { fontSize: 14, color: TEXT_DARK, lineHeight: 21 },

  // ── Booking bar ───────────────────────────────────────────────────────────
  bookingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 12,
  },
  // ── Chat button ───────────────────────────────────────────────────────────
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: PRIMARY_TEAL,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 13,
    minWidth: 90,
    backgroundColor: TEAL_LIGHT,
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  bookBtn: {
    flex: 1,
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
