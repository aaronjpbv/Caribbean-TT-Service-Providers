// app/provider-dashboard/portfolio/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
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

const portfolioItems = [
  {
    id: "1",
    title: "Bathroom Renovation",
    location: "Port of Spain",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  },
  {
    id: "2",
    title: "Kitchen Plumbing",
    location: "San Fernando",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    id: "3",
    title: "Emergency Leak Fix",
    location: "Chaguanas",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400",
  },
];

export default function PortfolioManagement() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("../provider-dashboard/portfolio/add")}
      >
        <View style={styles.addIcon}>
          <Ionicons name="add" size={32} color={PRIMARY_TEAL} />
        </View>
        <View>
          <Text style={styles.addTitle}>Add New Project</Text>
          <Text style={styles.addSubtitle}>Showcase your best work</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
      </TouchableOpacity>

      {/* Portfolio Grid */}
      <View style={styles.grid}>
        {portfolioItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.gridItem,
              index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
            ]}
            onPress={() =>
              router.push(`../provider-dashboard/portfolio/${item.id}`)
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#fff" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Ionicons name="bulb-outline" size={24} color={PRIMARY_TEAL} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Pro Tip</Text>
          <Text style={styles.tipsText}>
            Add before & after photos to increase booking conversions by 40%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: PRIMARY_TEAL,
  },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: PRIMARY_TEAL + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  addSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: (width - 44) / 2,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
  },
  gridItemLeft: {
    marginRight: 6,
  },
  gridItemRight: {
    marginLeft: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  editButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipsCard: {
    flexDirection: "row",
    backgroundColor: "#E6F4F6",
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  tipsContent: {
    marginLeft: 12,
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  tipsText: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
});
