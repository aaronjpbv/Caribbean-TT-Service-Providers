// app/provider/[id].tsx
// Worker/Provider Profile Screen
// To navigate here from home screen:
//   router.push(`/provider/${workerId}`)

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
<<<<<<< HEAD
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
=======
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
} from "react-native";

const { width } = Dimensions.get("window");

// ── Design tokens (matched to your app) ──────────────────────────────────────
const PRIMARY_TEAL  = "#0F6C7B";
const TEAL_LIGHT    = "#E6F4F6";
const AMBER         = "#F5A623";
const AMBER_BG      = "#FFF3DC";
const BG_GRAY       = "#F8FAFC";
const CARD_WHITE    = "#FFFFFF";
const TEXT_DARK     = "#1F2937";
const TEXT_MUTED    = "#6B7280";
const BORDER_COLOR  = "#E5E7EB";

// ── Types ─────────────────────────────────────────────────────────────────────
<<<<<<< HEAD
=======
// Update these fields to match your friend's exact Supabase column names
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
interface Worker {
  id: string;
  name: string;
  trade: string;
  location: string;
  bio: string;
<<<<<<< HEAD
  // hourly_rate: number;  // ❌ REMOVED - jobs are project-based
=======
  hourly_rate: number;
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
  response_time: string;
  jobs_completed: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  avatar_url: string | null;
  skills: string[];           // e.g. ["Rewiring", "Panel Upgrades"]
<<<<<<< HEAD
  starting_price?: number;    // ✅ ADDED - optional minimum project price
=======
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
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
  [day: string]: boolean;     // e.g. { Mon: true, Tue: false }
}

<<<<<<< HEAD
// ── Mock data (updated without hourly_rate) ──────────────────────────────────
=======
// ── Mock data (used until Supabase tables are confirmed) ──────────────────────
// 🔁 DELETE this block and uncomment the Supabase fetch in useEffect below
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
const MOCK_WORKER: Worker = {
  id: "mock_001",
  name: "Marcus Holt",
  trade: "Electrician",
  location: "North",
  bio: "Specialising in residential rewiring, panel upgrades, and smart home installations. I take pride in clean, code-compliant work and always leave the job site tidier than I found it.",
<<<<<<< HEAD
  // hourly_rate: 85,  // ❌ REMOVED
=======
  hourly_rate: 85,
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
  response_time: "~30 min",
  jobs_completed: 340,
  rating: 4.8,
  review_count: 127,
  is_verified: true,
  avatar_url: null,
  skills: ["Rewiring", "Panel Upgrades", "Smart Home", "EV Chargers", "Lighting"],
<<<<<<< HEAD
  starting_price: 150,  // ✅ ADDED - minimum project price
=======
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
};

const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: "p1", title: "Kitchen Rewire",   location: "Port of Spain", image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" },
  { id: "p2", title: "Panel Upgrade",    location: "San Fernando",  image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80" },
  { id: "p3", title: "Smart Home Setup", location: "Chaguanas",     image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
];

const MOCK_REVIEWS: Review[] = [
  { id: "r1", reviewer_name: "Sarah K.", rating: 5, comment: "Marcus was punctual, professional and explained everything clearly.", created_at: "2025-03-01" },
  { id: "r2", reviewer_name: "David L.", rating: 5, comment: "Excellent work on our panel upgrade. Would 100% hire again.",         created_at: "2025-02-15" },
  { id: "r3", reviewer_name: "Priya M.", rating: 4, comment: "Great job on the EV charger installation. Clean work, fair price.",   created_at: "2025-01-20" },
];

const MOCK_AVAILABILITY: Availability = {
  Mon: true, Tue: false, Wed: true, Thu: true, Fri: false, Sat: true, Sun: false,
};

// ── Small components ──────────────────────────────────────────────────────────

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? AMBER : "#DDDDDD" }}>
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
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-TT", { month: "short", year: "numeric" });
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [worker, setWorker]               = useState<Worker | null>(null);
  const [portfolio, setPortfolio]         = useState<PortfolioItem[]>([]);
  const [reviews, setReviews]             = useState<Review[]>([]);
  const [availability, setAvailability]   = useState<Availability>({});
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<"about" | "portfolio" | "reviews">("about");

  useEffect(() => {
    fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // ── OPTION A: Mock data (use this until Supabase tables are ready) ──────
      setWorker(MOCK_WORKER);
      setPortfolio(MOCK_PORTFOLIO);
      setReviews(MOCK_REVIEWS);
      setAvailability(MOCK_AVAILABILITY);

      // ── OPTION B: Real Supabase fetch (uncomment when ready) ─────────────
      // Ask your friend for the exact table names and column names first!
      //
      // const { data: workerData, error: workerError } = await supabase
      //   .from("service_providers")       // 🔁 confirm table name with friend
      //   .select("*")
      //   .eq("id", id)
      //   .single();
      // if (workerError) throw workerError;
      // setWorker(workerData);
      //
      // const { data: portfolioData } = await supabase
      //   .from("portfolio")               // 🔁 confirm table name with friend
      //   .select("*")
      //   .eq("provider_id", id);
      // setPortfolio(portfolioData ?? []);
      //
      // const { data: reviewData } = await supabase
      //   .from("reviews")                 // 🔁 confirm table name with friend
      //   .select("*")
      //   .eq("provider_id", id)
      //   .order("created_at", { ascending: false });
      // setReviews(reviewData ?? []);
      //
      // const { data: availData } = await supabase
      //   .from("availability")            // 🔁 confirm table name with friend
      //   .select("*")
      //   .eq("provider_id", id)
      //   .single();
      // setAvailability(availData ?? {});

    } catch (error) {
      console.error("Error fetching provider:", error);
      Alert.alert("Error", "Could not load provider profile.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
        <Text style={styles.loadingText}>Loading profile...</Text>
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

      {/* ── Teal header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>

            {/* Avatar — initials style matching your home screen cards */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatarBox}>
                {worker.avatar_url
                  ? <Image source={{ uri: worker.avatar_url }} style={styles.avatarImage} />
                  : <Text style={styles.avatarInitials}>{getInitials(worker.name)}</Text>
                }
              </View>
              {worker.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <RatingBadge rating={worker.rating} />
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="business-outline" size={13} color={TEXT_MUTED} />
                <Text style={styles.metaText}> {worker.trade}</Text>
                <Text style={styles.metaDot}> • </Text>
                <Ionicons name="location-outline" size={13} color={TEXT_MUTED} />
                <Text style={styles.metaText}> {worker.location}</Text>
              </View>
              <Text style={styles.reviewCountText}>{worker.review_count} reviews</Text>
            </View>
          </View>

<<<<<<< HEAD
          {/* Stats strip - HOURLY RATE REMOVED */}
=======
          {/* Stats strip */}
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.jobs_completed}+</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.response_time}</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
<<<<<<< HEAD
            {/* HOURLY RATE STAT REMOVED - No longer showing $/hr */}
            {worker.starting_price && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${worker.starting_price}</Text>
                  <Text style={styles.statLabel}>Starting From</Text>
                </View>
              </>
            )}
=======
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${worker.hourly_rate}</Text>
              <Text style={styles.statLabel}>Per Hour</Text>
            </View>
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
          </View>
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {(["about", "portfolio", "reviews"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.body}>

          {/* ══ ABOUT TAB ══ */}
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
                          <View style={[styles.dayDot, avail ? styles.dotGreen : styles.dotRed]} />
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

          {/* ══ PORTFOLIO TAB ══ */}
          {activeTab === "portfolio" && (
            <>
              <SectionTitle title="Past Work" />
              {portfolio.length === 0
                ? <View style={styles.card}><Text style={styles.emptyText}>No portfolio items yet.</Text></View>
                : portfolio.map((item) => (
                  <View key={item.id} style={styles.portfolioCard}>
                    <Image source={{ uri: item.image_url }} style={styles.portfolioImage} />
                    <View style={styles.portfolioFooter}>
                      <Text style={styles.portfolioTitle}>{item.title}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={13} color={TEXT_MUTED} />
                        <Text style={styles.metaText}> {item.location}</Text>
                      </View>
                    </View>
                  </View>
                ))
              }
            </>
          )}

          {/* ══ REVIEWS TAB ══ */}
          {activeTab === "reviews" && (
            <>
              {/* Summary */}
              <View style={[styles.card, styles.reviewSummaryCard]}>
                <Text style={styles.bigRating}>{worker.rating}</Text>
                <StarRating rating={worker.rating} size={24} />
                <Text style={styles.reviewSummaryText}>
                  Based on {worker.review_count} reviews
                </Text>
              </View>

              <SectionTitle title="Recent Reviews" />
              {reviews.length === 0
                ? <View style={styles.card}><Text style={styles.emptyText}>No reviews yet.</Text></View>
                : reviews.map((r) => (
                  <View key={r.id} style={styles.card}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{r.reviewer_name[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewerName}>{r.reviewer_name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <StarRating rating={r.rating} />
                          <Text style={styles.reviewDate}>{formatDate(r.created_at)}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))
              }
            </>
          )}

        </View>
      </ScrollView>

<<<<<<< HEAD
      {/* ── Sticky booking bar (UPDATED without hourly rate) ── */}
      <View style={styles.bookingBar}>
        <View>
          {worker.starting_price ? (
            <>
              <Text style={styles.bookingRate}>
                ${worker.starting_price}
                <Text style={styles.bookingRateSub}> starting</Text>
              </Text>
              <Text style={styles.bookingAvail}>Free estimates • Get quote</Text>
            </>
          ) : (
            <>
              <Text style={styles.bookingRate}>
                Get Quote
                <Text style={styles.bookingRateSub}> • Project-based</Text>
              </Text>
              <Text style={styles.bookingAvail}>Responds in {worker.response_time}</Text>
            </>
          )}
=======
      {/* ── Sticky booking bar ── */}
      <View style={styles.bookingBar}>
        <View>
          <Text style={styles.bookingRate}>
            ${worker.hourly_rate}
            <Text style={styles.bookingRateSub}> / hr</Text>
          </Text>
          <Text style={styles.bookingAvail}>Responds in {worker.response_time}</Text>
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.85}
          onPress={() => {
<<<<<<< HEAD
            // 🔁 Navigate to quote request screen
            router.push(`/request-quote/${worker.id}`);
          }}
        >    
          <Text style={styles.bookBtnText}>Request a Quote</Text>
=======
            // 🔁 router.push(`/booking/${worker.id}`) when booking screen is ready
            Alert.alert("Coming Soon", "Booking will be available shortly!");
          }}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
          <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

<<<<<<< HEAD
// ── Styles (updated for project-based pricing) ────────────────────────────────
=======
// ── Styles ────────────────────────────────────────────────────────────────────
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: BG_GRAY },
  centered:   { justifyContent: "center", alignItems: "center" },
  scroll:     { flex: 1 },
  loadingText:{ marginTop: 12, color: TEXT_MUTED, fontSize: 15 },

  // Header — matches profile.tsx exactly
  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  // Hero card
  heroCard: {
    backgroundColor: CARD_WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroRow:    { flexDirection: "row", gap: 14, marginBottom: 16 },
  avatarWrap: { position: "relative" },
  avatarBox: {
    width: 72, height: 72, borderRadius: 14,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  avatarImage:    { width: 72, height: 72, borderRadius: 14 },
  avatarInitials: { fontSize: 22, fontWeight: "700", color: PRIMARY_TEAL },
  verifiedBadge: {
    position: "absolute", bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: PRIMARY_TEAL,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: CARD_WHITE,
  },

  heroInfo:       { flex: 1, justifyContent: "center", gap: 5 },
  nameRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  workerName:     { fontSize: 18, fontWeight: "700", color: TEXT_DARK, flex: 1 },
  ratingBadge:    { flexDirection: "row", alignItems: "center", backgroundColor: AMBER_BG, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 3 },
  ratingBadgeStar:  { fontSize: 13, color: AMBER },
  ratingBadgeValue: { fontSize: 13, fontWeight: "700", color: AMBER },
  metaRow:        { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaText:       { fontSize: 13, color: TEXT_MUTED },
  metaDot:        { fontSize: 13, color: TEXT_MUTED },
  reviewCountText:{ fontSize: 12, color: TEXT_MUTED },

  statsStrip: {
    flexDirection: "row", backgroundColor: BG_GRAY,
    borderRadius: 12, paddingVertical: 12, alignItems: "center",
  },
  statItem:    { flex: 1, alignItems: "center" },
  statValue:   { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  statLabel:   { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: BORDER_COLOR },

  // Tab bar
  tabBar: {
    flexDirection: "row", backgroundColor: CARD_WHITE,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  tab:           { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 9 },
  tabActive:     { backgroundColor: PRIMARY_TEAL },
  tabText:       { fontSize: 14, fontWeight: "600", color: TEXT_MUTED },
  tabTextActive: { color: "#fff" },

  // Body
  body:         { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK, marginTop: 20, marginBottom: 10 },

  // Card
  card: {
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 16, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  bioText:   { fontSize: 14, color: TEXT_DARK, lineHeight: 22 },
  emptyText: { fontSize: 14, color: TEXT_MUTED, textAlign: "center", paddingVertical: 8 },

  // Skills chips
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:     { backgroundColor: TEAL_LIGHT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 13, color: PRIMARY_TEAL, fontWeight: "600" },

  // Availability
  availRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  dayCol:     { alignItems: "center", gap: 6 },
  dayDot:     { width: 34, height: 34, borderRadius: 17 },
  dotGreen:   { backgroundColor: "#D1FAE5", borderWidth: 2, borderColor: "#34D399" },
  dotRed:     { backgroundColor: "#FEE2E2", borderWidth: 2, borderColor: "#FCA5A5" },
  dayText:    { fontSize: 11, fontWeight: "600", color: TEXT_MUTED },
  legendRow:  { flexDirection: "row", gap: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: TEXT_MUTED },

  // Portfolio
  portfolioCard: {
    backgroundColor: CARD_WHITE, borderRadius: 14,
    overflow: "hidden", marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  portfolioImage:  { width: "100%", height: 180 },
  portfolioFooter: { padding: 14, gap: 4 },
  portfolioTitle:  { fontSize: 15, fontWeight: "700", color: TEXT_DARK },

  // Reviews
  reviewSummaryCard: { alignItems: "center", gap: 8, paddingVertical: 20 },
  bigRating:         { fontSize: 52, fontWeight: "800", color: TEXT_DARK, lineHeight: 56 },
  reviewSummaryText: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
  reviewHeader:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  reviewAvatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center" },
  reviewAvatarText:  { fontSize: 16, fontWeight: "700", color: PRIMARY_TEAL },
  reviewerName:      { fontSize: 14, fontWeight: "600", color: TEXT_DARK, marginBottom: 3 },
  reviewDate:        { fontSize: 12, color: TEXT_MUTED },
  reviewComment:     { fontSize: 14, color: TEXT_DARK, lineHeight: 21 },

<<<<<<< HEAD
  // Booking bar (UPDATED for project-based pricing)
=======
  // Booking bar
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
  bookingBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
<<<<<<< HEAD
  bookingRate:    { fontSize: 20, fontWeight: "800", color: TEXT_DARK },  // Slightly smaller
  bookingRateSub: { fontSize: 13, fontWeight: "400", color: TEXT_MUTED },
=======
  bookingRate:    { fontSize: 22, fontWeight: "800", color: TEXT_DARK },
  bookingRateSub: { fontSize: 14, fontWeight: "400", color: TEXT_MUTED },
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
  bookingAvail:   { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  bookBtn: {
    backgroundColor: PRIMARY_TEAL, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14,
    flexDirection: "row", alignItems: "center",
  },
  bookBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
<<<<<<< HEAD
}); 
=======
});
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
