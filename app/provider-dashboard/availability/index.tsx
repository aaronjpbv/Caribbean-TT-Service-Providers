// app/provider-dashboard/availability/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function AvailabilityManager() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    "9:00 AM",
    "10:00 AM",
    "2:00 PM",
  ]);

  const toggleSlot = (slot: string) => {
    if (availableSlots.includes(slot)) {
      setAvailableSlots(availableSlots.filter((s) => s !== slot));
    } else {
      setAvailableSlots([...availableSlots, slot]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayContainer}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === day && styles.dayTextActive,
              ]}
            >
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Slots */}
      <View style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>Select Available Times</Text>
        <View style={styles.slotsGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotButton,
                availableSlots.includes(slot) && styles.slotButtonActive,
              ]}
              onPress={() => toggleSlot(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  availableSlots.includes(slot) && styles.slotTextActive,
                ]}
              >
                {slot}
              </Text>
              {availableSlots.includes(slot) && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#fff"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="copy-outline" size={20} color={PRIMARY_TEAL} />
          <Text style={styles.actionText}>Copy to All Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={[styles.actionText, { color: "#EF4444" }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  dayScroll: {
    backgroundColor: CARD_WHITE,
    paddingVertical: 16,
  },
  dayContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: BG_GRAY,
  },
  dayButtonActive: {
    backgroundColor: PRIMARY_TEAL,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  dayTextActive: {
    color: "#fff",
  },
  slotsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 16,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotButton: {
    width: "30%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: CARD_WHITE,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  slotButtonActive: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  slotText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_DARK,
  },
  slotTextActive: {
    color: "#fff",
  },
  checkIcon: {
    marginLeft: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_TEAL,
  },
  saveButton: {
    backgroundColor: PRIMARY_TEAL,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
