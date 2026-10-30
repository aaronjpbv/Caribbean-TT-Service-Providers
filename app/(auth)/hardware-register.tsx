// app/(auth)/hardware-register.tsx
//
// NOTE ON IMPORT PATHS: this file lives in app/(auth)/, while the shared
// theme/types/CommissionDisclaimer files live in app/(tabs)/hardware/
// under their current names (hardware-themes.tsx, hardwaretypes.tsx,
// comissiondisclaimer.tsx). That's why the imports below go up one level
// and back down: "../(tabs)/hardware/...".
//
// Requires: expo-location
//   npx expo install expo-location

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CommissionDisclaimer from "../(tabs)/hardware/comissiondisclaimer";
import {
  BG_GRAY,
  BORDER_COLOR,
  CARD_WHITE,
  PRIMARY_TEAL,
  TEAL_LIGHT,
  TEXT_DARK,
  TEXT_MUTED,
} from "../(tabs)/hardware/hardware-themes";
import { CATEGORIES } from "../(tabs)/hardware/hardwaretypes";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export default function HardwareSignupScreen() {
  const router = useRouter();

  const [storeName, setStoreName]   = useState("");
  const [ownerName, setOwnerName]   = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [location, setLocation]     = useState<LocationState>({ latitude: null, longitude: null, address: "" });
  const [locating, setLocating]     = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow location access so buyers can find your store, or enter your address manually below.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const formatted = place
        ? [place.street, place.city, place.region].filter(Boolean).join(", ")
        : `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: formatted,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Couldn't get your location", "Please enter your store address manually below.");
    } finally {
      setLocating(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const errors: string[] = [];
  if (!storeName.trim()) errors.push("Store name is required.");
  if (!ownerName.trim()) errors.push("Owner name is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Enter a valid email address.");
  if (!phone.trim()) errors.push("Phone number is required.");
  if (password.length < 8) errors.push("Password must be at least 8 characters.");
  if (password !== confirmPassword) errors.push("Passwords do not match.");
  if (!location.address.trim()) errors.push("Store location is required.");
  if (selectedCategories.length === 0) errors.push("Select at least one category.");
  if (!agreedToTerms) errors.push("You must agree to the terms and commission structure.");

  const handleCreateAccount = async () => {
    if (errors.length > 0) {
      Alert.alert("Check the form", errors[0]);
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ── OPTION B: Real Supabase signup (uncomment when ready) ───────────
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email: email.trim(),
      //   password,
      // });
      // if (authError) throw authError;
      // const ownerId = authData.user?.id;
      // if (!ownerId) throw new Error("Signup did not return a user id");
      //
      // const { error: profileError } = await supabase
      //   .from("provider_profiles")
      //   .insert({
      //     id: ownerId,
      //     store_name: storeName.trim(),
      //     owner_name: ownerName.trim(),
      //     phone: phone.trim(),
      //     latitude: location.latitude,
      //     longitude: location.longitude,
      //     address: location.address.trim(),
      //     categories: selectedCategories,
      //     commission_accepted_at: new Date().toISOString(),
      //     role: "hardware_owner",
      //   });
      // if (profileError) throw profileError;

      Alert.alert("Welcome aboard!", "Your hardware store account has been created.", [
        { text: "OK", onPress: () => router.replace("/hardware") },
      ]);
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hardware Store Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <Ionicons name="storefront-outline" size={24} color={PRIMARY_TEAL} />
          </View>
          <Text style={styles.introTitle}>List your products, reach more customers</Text>
          <Text style={styles.introBody}>
            Set up your store once — your location carries over to every item you list.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Account Info</Text>

        <Text style={styles.label}>Store Name</Text>
        <TextInput style={styles.input} placeholder="e.g. BuildRight Ltd." placeholderTextColor={TEXT_MUTED} value={storeName} onChangeText={setStoreName} />

        <Text style={styles.label}>Owner Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Marcus Holt" placeholderTextColor={TEXT_MUTED} value={ownerName} onChangeText={setOwnerName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="you@store.com" placeholderTextColor={TEXT_MUTED} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="e.g. (868) 123-4567" placeholderTextColor={TEXT_MUTED} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Password</Text>
        <View style={[styles.input, styles.passwordRow]}>
          <TextInput style={styles.passwordInput} placeholder="At least 8 characters" placeholderTextColor={TEXT_MUTED} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor={TEXT_MUTED} secureTextEntry={!showPassword} value={confirmPassword} onChangeText={setConfirmPassword} />

        <Text style={styles.sectionLabel}>Store Location</Text>

        <TouchableOpacity style={styles.locationBtn} onPress={handleUseCurrentLocation} disabled={locating}>
          {locating ? <ActivityIndicator size="small" color={PRIMARY_TEAL} /> : <Ionicons name="locate-outline" size={18} color={PRIMARY_TEAL} />}
          <Text style={styles.locationBtnText}>{locating ? "Getting your location..." : "Use My Current Location"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Store Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Street, city, region"
          placeholderTextColor={TEXT_MUTED}
          multiline
          numberOfLines={2}
          value={location.address}
          onChangeText={(text) => setLocation((prev) => ({ ...prev, address: text }))}
        />
        {location.latitude !== null && (
          <View style={styles.coordsRow}>
            <Ionicons name="checkmark-circle" size={14} color={PRIMARY_TEAL} />
            <Text style={styles.coordsText}>Precise location captured</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>What Do You Sell?</Text>
        <Text style={styles.sectionSubLabel}>Select all categories that apply.</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity key={cat.id} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => toggleCategory(cat.id)}>
                <Ionicons name={cat.icon as any} size={16} color={active ? "#fff" : PRIMARY_TEAL} />
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Terms</Text>
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms((v) => !v)}>
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            I agree to the Terms of Service and understand a <Text style={styles.termsBold}>10% commission</Text> applies to each sale.{" "}
            <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>View details</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.submitBar}>
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleCreateAccount} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={showTermsModal} animationType="slide" onRequestClose={() => setShowTermsModal(false)}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowTermsModal(false)}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Commission & Payouts</Text>
            <View style={{ width: 40 }} />
          </View>
          <CommissionDisclaimer
            onAgree={() => {
              setAgreedToTerms(true);
              setShowTermsModal(false);
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20,
  },
  headerIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  body: { padding: 16, paddingBottom: 40 },
  introCard: {
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  introIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  introTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK, textAlign: "center", marginBottom: 6 },
  introBody: { fontSize: 13, color: TEXT_MUTED, textAlign: "center", lineHeight: 19 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: PRIMARY_TEAL, marginTop: 22, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 },
  sectionSubLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: CARD_WHITE, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: TEXT_DARK },
  textArea: { height: 70, textAlignVertical: "top" },
  passwordRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 0 },
  passwordInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: TEXT_DARK },
  locationBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: TEAL_LIGHT, borderRadius: 12, paddingVertical: 13, marginTop: 4, marginBottom: 4 },
  locationBtnText: { fontSize: 13.5, fontWeight: "700", color: PRIMARY_TEAL },
  coordsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  coordsText: { fontSize: 12, color: PRIMARY_TEAL, fontWeight: "600" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: BORDER_COLOR, backgroundColor: CARD_WHITE, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  categoryChipActive: { backgroundColor: PRIMARY_TEAL, borderColor: PRIMARY_TEAL },
  categoryChipText: { fontSize: 12, fontWeight: "600", color: TEXT_DARK },
  categoryChipTextActive: { color: "#fff" },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: BORDER_COLOR, alignItems: "center", justifyContent: "center", marginTop: 1, backgroundColor: CARD_WHITE },
  checkboxChecked: { backgroundColor: PRIMARY_TEAL, borderColor: PRIMARY_TEAL },
  termsText: { flex: 1, fontSize: 12.5, color: TEXT_MUTED, lineHeight: 18 },
  termsBold: { fontWeight: "700", color: TEXT_DARK },
  termsLink: { fontWeight: "700", color: PRIMARY_TEAL },
  submitBar: {
    backgroundColor: CARD_WHITE, borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  submitBtn: { backgroundColor: PRIMARY_TEAL, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
}); 