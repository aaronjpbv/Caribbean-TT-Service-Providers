// app/hardware/add-item.tsx
// Add / Edit Item screen for hardware store owners.
// Location is intentionally NOT collected here — it's stored once on the
// provider's profile at signup and applied to every item automatically.
//
// To add a new item:  router.push("/hardware/add-item")
// To edit an item:    router.push(`/hardware/add-item?itemId=${item.id}`)
//
// Requires: expo-image-picker
//   npx expo install expo-image-picker

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AMBER,
  BG_GRAY,
  BORDER_COLOR,
  CARD_WHITE,
  DANGER_TEXT,
  PRIMARY_TEAL,
  TEAL_LIGHT,
  TEXT_DARK,
  TEXT_MUTED,
} from "./hardware-themes";
import { CATEGORIES } from "./hardwaretypes";

const MAX_PHOTOS = 5;

export default function AddEditItemScreen() {
  const router = useRouter(); 
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const isEditing = !!itemId;

  const [name, setName]               = useState("");
  const [categoryId, setCategoryId]   = useState<string | null>(null);
  const [price, setPrice]             = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos]           = useState<string[]>([]); // local uris or remote urls

  const [loadingItem, setLoadingItem] = useState(isEditing);
  const [saving, setSaving]           = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // ── Load existing item when editing ───────────────────────────────────
  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      try {
        // 🔁 Replace with a real fetch once the "items" table is confirmed:
        // const { data, error } = await supabase
        //   .from("items")
        //   .select("*")
        //   .eq("id", itemId)
        //   .single();
        // if (error) throw error;
        // setName(data.name);
        // setCategoryId(data.category);
        // setPrice(String(data.price));
        // setStockQuantity(String(data.stock_quantity));
        // setDescription(data.description ?? "");
        // setPhotos(data.photo_urls ?? []);
      } catch (error) {
        console.error("Error loading item:", error);
        Alert.alert("Error", "Could not load this item.");
      } finally {
        setLoadingItem(false);
      }
    })();
  }, [isEditing, itemId]);

  // ── Photo picking ──────────────────────────────────────────────────────
  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Limit reached", `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to add pictures of your item.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: MAX_PHOTOS - photos.length,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const priceNum = parseFloat(price);
  const stockNum = parseInt(stockQuantity, 10);

  const errors: string[] = [];
  if (!name.trim()) errors.push("Item name is required.");
  if (!categoryId) errors.push("Choose a category.");
  if (!price || isNaN(priceNum) || priceNum < 0) errors.push("Enter a valid price.");
  if (!stockQuantity || isNaN(stockNum) || stockNum < 0) errors.push("Enter a valid stock quantity.");

  // ── Save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (errors.length > 0) {
      Alert.alert("Check the form", errors[0]);
      return;
    }

    setSaving(true);
    try {
      // ── OPTION A: no-op mock save — swap in Supabase below when ready ──
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ── OPTION B: Real Supabase save (uncomment when ready) ────────────
      // const { data: userData } = await supabase.auth.getUser();
      // const ownerId = userData?.user?.id;
      // if (!ownerId) throw new Error("Not signed in");
      //
      // // Upload any new local photos (file:// / content://) to storage;
      // // remote photo_urls (from editing) are left as-is.
      // const uploadedUrls: string[] = [];
      // for (const uri of photos) {
      //   if (uri.startsWith("http")) {
      //     uploadedUrls.push(uri);
      //     continue;
      //   }
      //   const fileExt = uri.split(".").pop();
      //   const fileName = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      //   const response = await fetch(uri);
      //   const blob = await response.blob();
      //   const { error: uploadError } = await supabase.storage
      //     .from("item-photos")               // 🔁 confirm bucket name
      //     .upload(fileName, blob, { contentType: `image/${fileExt}` });
      //   if (uploadError) throw uploadError;
      //   const { data: publicUrl } = supabase.storage.from("item-photos").getPublicUrl(fileName);
      //   uploadedUrls.push(publicUrl.publicUrl);
      // }
      //
      // const payload = {
      //   provider_id: ownerId,       // location comes from the provider row via this FK
      //   name: name.trim(),
      //   category: categoryId,
      //   price: priceNum,
      //   stock_quantity: stockNum,
      //   description: description.trim(),
      //   photo_urls: uploadedUrls,
      // };
      //
      // if (isEditing) {
      //   const { error } = await supabase.from("items").update(payload).eq("id", itemId);
      //   if (error) throw error;
      // } else {
      //   const { error } = await supabase.from("items").insert(payload);
      //   if (error) throw error;
      // }

      router.back();
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "Could not save this item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingItem) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.headerCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Item" : "Add New Item"}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.headerSave}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* ── Photos ── */}
        <Text style={styles.label}>Photos</Text>
        <View style={styles.photoRow}>
          {photos.map((uri) => (
            <View key={uri} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => handleRemovePhoto(uri)}>
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
              <Ionicons name="camera-outline" size={22} color={PRIMARY_TEAL} />
              <Text style={styles.addPhotoText}>Add Photos</Text>
              <Text style={styles.addPhotoSub}>(Up to {MAX_PHOTOS})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Item name ── */}
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Cement (50kg)"
          placeholderTextColor={TEXT_MUTED}
          value={name}
          onChangeText={setName}
        />

        {/* ── Category ── */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectInput]}
          onPress={() => setShowCategoryPicker((v) => !v)}
        >
          <Text style={selectedCategory ? styles.selectValueText : styles.selectPlaceholderText}>
            {selectedCategory ? selectedCategory.label : "Select Category"}
          </Text>
          <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={18} color={TEXT_MUTED} />
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={categoryId === cat.id ? "#fff" : PRIMARY_TEAL}
                />
                <Text style={[styles.categoryChipText, categoryId === cat.id && styles.categoryChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Price ── */}
        <Text style={styles.label}>Price (TTD)</Text>
        <View style={[styles.input, styles.prefixInput]}>
          <Text style={styles.prefixSymbol}>$</Text>
          <TextInput
            style={styles.prefixTextInput}
            placeholder="e.g. 42.00"
            placeholderTextColor={TEXT_MUTED}
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        <View style={styles.commissionNote}>
          <Ionicons name="information-circle-outline" size={14} color={TEXT_MUTED} />
          <Text style={styles.commissionNoteText}>
            A 10% commission is deducted from each sale. You'll receive ${isNaN(priceNum) ? "0.00" : (priceNum * 0.9).toFixed(2)} per unit sold at this price.
          </Text>
        </View>

        {/* ── Stock quantity ── */}
        <Text style={styles.label}>Stock Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 100"
          placeholderTextColor={TEXT_MUTED}
          keyboardType="number-pad"
          value={stockQuantity}
          onChangeText={setStockQuantity}
        />

        {/* ── Description ── */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add item description..."
          placeholderTextColor={TEXT_MUTED}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteRow}
            onPress={() =>
              Alert.alert("Remove item?", "This item will no longer be visible to buyers.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: async () => {
                    // await supabase.from("items").delete().eq("id", itemId);
                    router.back();
                  },
                },
              ])
            }
          >
            <Ionicons name="trash-outline" size={16} color={DANGER_TEXT} />
            <Text style={styles.deleteRowText}>Remove this item</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  centered:  { justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: PRIMARY_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerCancel: { color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: "500" },
  headerTitle:  { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSave:   { color: AMBER, fontSize: 15, fontWeight: "700" },

  body: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginTop: 18, marginBottom: 8 },

  input: {
    backgroundColor: CARD_WHITE,
    borderWidth: 1, borderColor: BORDER_COLOR,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: TEXT_DARK,
  },
  textArea: { height: 100, textAlignVertical: "top" },

  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectValueText: { fontSize: 14, color: TEXT_DARK },
  selectPlaceholderText: { fontSize: 14, color: TEXT_MUTED },

  prefixInput: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 0 },
  prefixSymbol: { fontSize: 14, color: TEXT_MUTED, fontWeight: "600" },
  prefixTextInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: TEXT_DARK },

  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoThumbWrap: { position: "relative" },
  photoThumb: { width: 76, height: 76, borderRadius: 12, backgroundColor: TEAL_LIGHT },
  photoRemoveBtn: {
    position: "absolute", top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: TEXT_DARK, alignItems: "center", justifyContent: "center",
  },
  addPhotoBtn: {
    width: 76, height: 76, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER_COLOR, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", backgroundColor: CARD_WHITE, gap: 2,
  },
  addPhotoText: { fontSize: 10, fontWeight: "600", color: PRIMARY_TEAL, marginTop: 2 },
  addPhotoSub: { fontSize: 9, color: TEXT_MUTED },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  categoryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: BORDER_COLOR, backgroundColor: CARD_WHITE,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
  },
  categoryChipActive: { backgroundColor: PRIMARY_TEAL, borderColor: PRIMARY_TEAL },
  categoryChipText: { fontSize: 12, fontWeight: "600", color: TEXT_DARK },
  categoryChipTextActive: { color: "#fff" },

  commissionNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    marginTop: 8, paddingHorizontal: 2,
  },
  commissionNoteText: { flex: 1, fontSize: 11.5, color: TEXT_MUTED, lineHeight: 16 },

  deleteRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 28, alignSelf: "center" },
  deleteRowText: { fontSize: 13, fontWeight: "600", color: DANGER_TEXT },
}); 