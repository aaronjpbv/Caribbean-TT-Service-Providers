// app/hardware/_components/CommissionDisclaimer.tsx
// Presentational-only — NOT a route. Files/folders prefixed with "_" are
// ignored by expo-router, so this stays a plain component you can render
// inline wherever it's needed (currently: inside app/hardware/index.tsx).

import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AMBER,
  AMBER_BG,
  BORDER_COLOR,
  CARD_WHITE,
  PRIMARY_TEAL,
  TEAL_LIGHT,
  TEXT_DARK,
  TEXT_MUTED,
} from "./hardware-themes";

type TermRow = { icon: keyof typeof Ionicons.glyphMap; title: string; body: string };

const TERMS: TermRow[] = [
  {
    icon: "pricetag-outline",
    title: "10% commission per sale",
    body: "When a buyer purchases an item you've listed, we deduct a 10% commission from the sale price before your payout.",
  },
  {
    icon: "card-outline",
    title: "Deducted automatically",
    body: "You don't need to do anything — the commission is calculated and withheld at checkout, and your payout reflects the remaining 90%.",
  },
  {
    icon: "list-outline",
    title: "Free to list",
    body: "There's no charge to list items or manage your store. The commission only applies to completed sales.",
  },
  {
    icon: "time-outline",
    title: "Payouts on your schedule",
    body: "Net proceeds are paid out according to your store's payout settings, which you can review any time.",
  },
];

export default function CommissionDisclaimer({
  onAgree,
  agreeing,
}: {
  onAgree: () => void;
  agreeing?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* ── Headline card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="pricetag" size={26} color={PRIMARY_TEAL} />
          </View>
          <Text style={styles.heroTitle}>We take a 10% commission on every sale</Text>
          <Text style={styles.heroBody}>
            Before you start listing items, here's exactly how selling on the platform works.
          </Text>
        </View>

        {/* ── Terms list ── */}
        {TERMS.map((term) => (
          <View key={term.title} style={styles.termCard}>
            <View style={styles.termIconWrap}>
              <Ionicons name={term.icon} size={18} color={PRIMARY_TEAL} />
            </View>
            <View style={styles.termTextWrap}>
              <Text style={styles.termTitle}>{term.title}</Text>
              <Text style={styles.termBody}>{term.body}</Text>
            </View>
          </View>
        ))}

        {/* ── Example ── */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleLabel}>Example</Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleText}>Item sells for</Text>
            <Text style={styles.exampleValue}>$100.00</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleText}>Commission (10%)</Text>
            <Text style={[styles.exampleValue, styles.exampleValueMuted]}>-$10.00</Text>
          </View>
          <View style={styles.exampleDivider} />
          <View style={styles.exampleRow}>
            <Text style={styles.exampleTotalLabel}>You receive</Text>
            <Text style={styles.exampleTotalValue}>$90.00</Text>
          </View>
        </View>

        <Text style={styles.footnote}>
          By continuing, you agree that a 10% commission applies to all sales made through your
          store listings. You can review these terms again any time from your store settings.
        </Text>
      </ScrollView>

      {/* ── Sticky agree bar ── */}
      <View style={styles.agreeBar}>
        <TouchableOpacity
          style={styles.agreeBtn}
          activeOpacity={0.85}
          onPress={onAgree}
          disabled={agreeing}
        >
          <Text style={styles.agreeBtnText}>
            {agreeing ? "Saving..." : "I Understand & Agree"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  body: { padding: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 20,
    alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: TEAL_LIGHT,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  heroTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK, textAlign: "center", marginBottom: 8 },
  heroBody: { fontSize: 13, color: TEXT_MUTED, textAlign: "center", lineHeight: 19 },

  termCard: {
    flexDirection: "row", gap: 12,
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  termIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: TEAL_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  termTextWrap: { flex: 1 },
  termTitle: { fontSize: 14, fontWeight: "700", color: TEXT_DARK, marginBottom: 3 },
  termBody: { fontSize: 12.5, color: TEXT_MUTED, lineHeight: 18 },

  exampleCard: {
    backgroundColor: AMBER_BG, borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 16,
  },
  exampleLabel: { fontSize: 11, fontWeight: "700", color: AMBER, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  exampleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  exampleText: { fontSize: 13, color: TEXT_DARK },
  exampleValue: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
  exampleValueMuted: { color: TEXT_MUTED },
  exampleDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 4 },
  exampleTotalLabel: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  exampleTotalValue: { fontSize: 16, fontWeight: "800", color: PRIMARY_TEAL },

  footnote: { fontSize: 11.5, color: TEXT_MUTED, lineHeight: 17, textAlign: "center", paddingHorizontal: 8 },

  agreeBar: {
    backgroundColor: CARD_WHITE,
    borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  agreeBtn: { backgroundColor: PRIMARY_TEAL, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  agreeBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});  