// app/provider-dashboard/reviews/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const PRIMARY_TEAL = "#0F6C7B";
const BG_GRAY = "#F8FAFC";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const AMBER = "#F5A623";

const reviews = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 5,
    comment: "Excellent work! Very professional and punctual.",
    date: "Mar 15, 2025",
  },
  {
    id: "2",
    name: "Mike Chen",
    rating: 5,
    comment: "Fixed my plumbing issue quickly. Highly recommend!",
    date: "Mar 10, 2025",
  },
  {
    id: "3",
    name: "Lisa Brown",
    rating: 4,
    comment: "Good service, fair pricing. Would hire again.",
    date: "Mar 5, 2025",
  },
  {
    id: "4",
    name: "David Wilson",
    rating: 5,
    comment: "Amazing attention to detail. My go-to electrician!",
    date: "Feb 28, 2025",
  },
];

export default function ReviewsList() {
  const averageRating = 4.8;
  const totalReviews = 127;

  return (
    <ScrollView style={styles.container}>
      {/* Rating Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.ratingCircle}>
          <Text style={styles.ratingNumber}>{averageRating}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= Math.round(averageRating) ? AMBER : "#DDDDDD"}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((stars) => (
            <View key={stars} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{stars}</Text>
              <Ionicons name="star" size={12} color={AMBER} />
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: stars === 5 ? "80%" : stars === 4 ? "15%" : "5%" },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>{totalReviews} Reviews</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{review.name[0]}</Text>
              </View>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={star <= review.rating ? AMBER : "#DDDDDD"}
                    />
                  ))}
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
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
  summaryCard: {
    flexDirection: "row",
    backgroundColor: CARD_WHITE,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  ratingCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  ratingBreakdown: {
    flex: 1,
    marginLeft: 20,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    width: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginLeft: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: AMBER,
    borderRadius: 3,
  },
  reviewsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_TEAL + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_TEAL,
  },
  reviewMeta: {
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 20,
  },
});
