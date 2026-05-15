// app/(tabs)/index.tsx
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS
// ─────────────────────────────────────────────────────────────────────────────
// This is the Home Screen of a React Native app built with Expo Router.
// "(tabs)" means this screen lives inside a Tab Navigator — the bar at the
// bottom of the screen that lets users switch between sections of the app.
// "index.tsx" is special: Expo Router treats it as the *default* route for
// any folder, so this screen loads first when you open the app.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. IMPORTS ───────────────────────────────────────────────────────────────
// Every React Native file starts with imports. Think of these as "tools" you
// borrow from other packages before you can use them in your own code.

import { supabase } from "@/utils/supabase";
// "@/utils/supabase" is a local file (the "@" means "root of the project").
// It exports a pre-configured Supabase client so we can talk to the database
// without setting up the connection from scratch every time.

import { Ionicons } from "@expo/vector-icons";
// A library of ~1,300 icons. You reference them by name, e.g. "search" or
// "location-outline". Expo bundles this so no extra install is needed.

import AsyncStorage from "@react-native-async-storage/async-storage";
// A simple key-value storage that persists on the device — like localStorage
// in a web browser. We use it to remember whether the user is a guest.

import { Link, useRouter } from "expo-router";
// expo-router gives us two navigation tools:
//   Link      — a component that works like an <a> tag on the web.
//   useRouter — a hook that lets us navigate programmatically (e.g. after a
//               button press inside a function).

import { useEffect, useState } from "react";
// Two of React's built-in Hooks. Hooks are explained in detail below.
// useState  — stores a value that can change over time (state).
// useEffect — runs side-effects (fetching data, subscriptions) after render.

import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
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
// These are React Native's built-in UI components and utilities:
//   View          — a box / container (like <div> on the web)
//   Text          — renders text (ALL text must be inside <Text>)
//   TextInput     — a text field the user can type into
//   ScrollView    — a container that scrolls when content overflows
//   FlatList      — an optimised scrollable list (lazy-renders items)
//   TouchableOpacity — a pressable element that dims when tapped
//   Pressable     — a lower-level pressable with more control
//   Modal         — an overlay that floats above the rest of the screen
//   Image         — renders images (not used here but common)
//   Alert         — shows a native dialog box
//   Animated      — lets you animate values smoothly
//   Dimensions    — gives you the device's screen width/height
//   StatusBar     — controls the thin bar at the very top (time, battery)
//   StyleSheet    — creates an optimised style object (like CSS-in-JS)

// ── 2. CONSTANTS ─────────────────────────────────────────────────────────────
// Storing colours and dimensions as named constants means you only need to
// change them in ONE place if the design ever updates.

const { width } = Dimensions.get("window");
// Destructure just "width" from the screen dimensions. Used to calculate
// how wide the 3×3 category cards should be.

const PRIMARY_TEAL  = "#1d3557";
const PRIMARY_LIGHT = "#1A8A9C";
const ACCENT_GOLD   = "#F5A623";
const BG_GRAY       = "#F4F1EB";
const CARD_WHITE    = "#FFFFFF";
const TEXT_DARK     = "#1F2937";
const TEXT_MUTED    = "#6B7280";

// ── 3. STATIC DATA ───────────────────────────────────────────────────────────
// These arrays never change at runtime, so we define them outside the
// component. Defining them inside would recreate them on every render —
// wasteful and potentially buggy if used as dependency values in hooks.

const categories = [
  { id: "all",        name: "All",       icon: "apps-outline"            },
  { id: "plumbing",   name: "Plumbing",  icon: "water-outline"           },
  { id: "electrical", name: "Electrical",icon: "flash-outline"           },
  { id: "landscaping",name: "Lawn Care", icon: "leaf-outline"            },
  { id: "cleaning",   name: "Cleaning",  icon: "sparkles-outline"        },
  { id: "painting",   name: "Painting",  icon: "color-palette-outline"   },
  { id: "hvac",       name: "HVAC",      icon: "thermometer-outline"     },
  { id: "carpentry",  name: "Carpentry", icon: "hammer-outline"          },
  { id: "security",   name: "Security",  icon: "shield-checkmark-outline"},
];

const regions = ["All", "North", "Central", "South", "East", "West", "Tobago"];

// ── 4. TYPESCRIPT TYPE ───────────────────────────────────────────────────────
// TypeScript lets us describe the *shape* of our data with a "type" or
// "interface". This is not JavaScript — it's compile-time only. If you try
// to use a field that doesn't exist on Provider, TypeScript will warn you
// before you even run the app.

type Provider = {
  id:       string;
  name:     string;
  category: string;
  region:   string;
  rating:   number;
  reviews:  number;
  verified: boolean;
  image:    string | null; // "string | null" means it can be a URL or nothing
};

// ── 5. THE COMPONENT ─────────────────────────────────────────────────────────
// A React Native screen is just a JavaScript function that returns JSX.
// JSX looks like HTML but it actually compiles to React.createElement() calls.
// "export default" makes this the file's main export so Expo Router can
// find and render it automatically.

export default function HomeScreen() {

  // ── 5a. STATE (useState Hook) ───────────────────────────────────────────
  // useState is the most fundamental Hook. It lets a component "remember"
  // a value between renders.
  //
  // Syntax:  const [value, setValue] = useState(initialValue)
  //   • "value"    — the current state (read-only; never mutate directly)
  //   • "setValue" — a function that updates the state AND triggers a re-render
  //   • useState() — call with the starting value
  //
  // Every time setValue is called React re-runs this function from the top
  // and redraws only the parts of the UI that changed. This is the core idea
  // behind React: UI = f(state).

  const [providers, setProviders]           = useState<Provider[]>([]);
  // providers starts as an empty array. When Supabase returns data we call
  // setProviders(data) and the list re-renders with real items.

  const [searchQuery, setSearchQuery]       = useState("");
  // Mirrors whatever the user types in the search bar. Updated on every
  // keystroke via onChangeText={setSearchQuery}.

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  // Tracks which category pill is active. Starts on "All".

  const [selectedRegion, setSelectedRegion] = useState("All");
  // ⚠️ THIS WAS MISSING — it caused your second crash. The variable was used
  // all over the JSX but never declared, so the app would throw a
  // ReferenceError as soon as the syntax error was fixed.

  const [menuVisible, setMenuVisible]       = useState(false);
  // Controls whether the dropdown profile menu is shown.

  const [isGuest, setIsGuest]               = useState(false);
  // True when the user skipped sign-in and is browsing as a guest.

  // Animated values are also "state", but managed by React Native's
  // Animated API instead of useState. They live outside the render cycle
  // so animations run on the native thread — smoother than JS-driven state.
  const [scaleAnim]   = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  // We destructure only the value (no setter) because Animated drives these
  // internally — we never call setScaleAnim ourselves.

  // ── 5b. ROUTER ─────────────────────────────────────────────────────────
  const router = useRouter();
  // useRouter gives us an object with methods like:
  //   router.push("/some/path")    — navigate forward
  //   router.replace("/path")      — navigate and remove current from history
  //   router.back()                — go back one screen
  // Use it inside event handlers where you can't use the <Link> component.

  // ── 5c. SIDE EFFECTS (useEffect Hook) ──────────────────────────────────
  // useEffect runs *after* the component renders. It's the right place for:
  //   • Fetching data from an API
  //   • Setting up subscriptions / event listeners
  //   • Reading from AsyncStorage or other async sources
  //
  // Syntax:  useEffect(callback, dependencyArray)
  //   • callback        — the function to run
  //   • dependencyArray — React watches these values; if any change it re-runs
  //                       the callback. An empty array [] means "run once,
  //                       right after the first render" — equivalent to
  //                       componentDidMount in class components.

  useEffect(() => {

    // Inner async function because useEffect's callback cannot be async itself
    // (async functions return Promises, but useEffect expects void or a
    // cleanup function).
    const fetchProviders = async () => {
      const { data } = await supabase
        .from("providers")
        .select("*");
      // .from()   — picks the table
      // .select() — chooses columns ("*" means all of them)
      // Supabase returns { data, error }. We only destructure data here;
      // add error handling in production.
      setProviders(data as Provider[] ?? []);
      // "as Provider[]" is a TypeScript cast — we're telling the compiler
      // "trust me, this data matches our type".
      // "?? []" is the nullish coalescing operator — if data is null/undefined
      // use an empty array instead so the app doesn't crash.
    };

    const checkUserStatus = async () => {
      try {
        const guestStatus = await AsyncStorage.getItem("isGuest");
        // AsyncStorage.getItem returns the stored string or null.
        if (guestStatus === "true") {
          setIsGuest(true);
          return; // Early return — no need to check Supabase auth
        }

        const { data: { user } } = await supabase.auth.getUser();
        // Nested destructuring: get data.user from the response.
        if (!user) {
          router.replace("/(auth)/sign-in");
          // No authenticated user and not a guest → send to sign-in.
          // replace() instead of push() so the user can't press Back to
          // return to this screen without being logged in.
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        router.replace("/(auth)/sign-in");
      }
    };

    fetchProviders();
    checkUserStatus();

  }, []);
  // [] — runs once on mount. If you put [selectedRegion] here instead, the
  // effect would re-run every time the region changes (useful for server-side
  // filtering; here we filter client-side so once is enough).

  // ── 5d. DERIVED STATE ───────────────────────────────────────────────────
  // This is NOT a hook — it's just a variable calculated from existing state.
  // React re-renders the component whenever state changes, so this recalculates
  // automatically. No need for useState or useEffect here.

  const filteredProviders = providers.filter((provider) => {
    const matchesRegion =
      selectedRegion === "All" || provider.region === selectedRegion;

    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || provider.category === selectedCategory;

    return matchesRegion && matchesSearch && matchesCategory;
    // All three conditions must be true for a provider to appear.
  });

  // ── 5e. EVENT HANDLERS ──────────────────────────────────────────────────
  // Plain functions defined inside the component so they close over state
  // and setters. Arrow functions are the idiomatic React style.

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // Calling any setter causes a re-render → filteredProviders recalculates
    // → the list updates. No manual DOM manipulation needed.
  };

  const openMenu = () => {
    setMenuVisible(true);
    // Animated.parallel runs multiple animations simultaneously.
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,        // animate to full size
        duration: 200,     // milliseconds
        useNativeDriver: true,
        // useNativeDriver:true offloads the animation to the native thread.
        // Always use it when animating transform/opacity — it's much smoother.
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    // .start() kicks off the animation. You can pass a callback:
    // .start(() => console.log("animation done"))
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0,    duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setMenuVisible(false);
      // Hide the Modal AFTER the animation finishes so the user sees the
      // closing animation rather than an abrupt disappearance.
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
            if (error) { Alert.alert("Error", error.message); return; }
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

  // ── 5f. JSX (the UI) ────────────────────────────────────────────────────
  // Everything inside "return ()" is JSX. Rules to remember:
  //   • Components start with a capital letter (View, Text, FlatList…)
  //   • There must be a single root element — wrap siblings in <View> or <>.
  //   • JavaScript expressions go inside {curly braces}.
  //   • Styles are objects, not strings: style={{ color: "red" }}
  //     or references to StyleSheet entries: style={styles.header}
  //   • Self-closing tags need a slash: <View /> not <View>

  return (
    <View style={styles.container}>
      {/* StatusBar controls the device's top system bar */}
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_TEAL} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Blue Color</Text>
            <Text style={styles.title}>Find Trusted Services</Text>
          </View>

          {/* Profile button — opens the dropdown menu */}
          <TouchableOpacity
            style={styles.userButton}
            onPress={openMenu}
            activeOpacity={0.8}
            // activeOpacity dims the button to 80% opacity when pressed.
            // 0 = fully transparent, 1 = no change. 0.8 is a subtle dim.
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
              // "Controlled input" pattern:
              //   value={searchQuery}          — display what's in state
              //   onChangeText={setSearchQuery} — update state on each keystroke
              // This keeps the UI in sync with state at all times.
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              // Conditional rendering: the clear button only appears when
              // there is text. "&&" is the short-circuit pattern — if the
              // left side is falsy, nothing renders.
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── DROPDOWN MENU MODAL ── */}
      {/* Modal floats above everything else. transparent={true} lets us see
          the screen behind the overlay. */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        // animationType="none" because we handle the animation ourselves
        // with Animated above. If you used "fade" here AND Animated, you'd
        // see two competing animations.
        onRequestClose={closeMenu}
        // onRequestClose fires on Android when the hardware back button is
        // pressed. Always handle it so the modal can be dismissed.
      >
        {/* Pressable backdrop — tap outside the menu to close it */}
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View
            // Animated.View is the animated version of View. Wrap any element
            // you want to animate with Animated.View (or Animated.Text, etc.)
            style={[
              styles.dropdownMenu,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                // Animated values are passed directly as style props.
                // React Native reads them on the native thread each frame.
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Ionicons name="person-circle" size={48} color={PRIMARY_TEAL} />
              <Text style={styles.menuTitle}>
                {isGuest ? "Guest" : "My Account"}
                {/* Ternary expression: condition ? ifTrue : ifFalse */}
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
                {/* Passing an array to style merges the objects left-to-right.
                    logoutText overrides the colour set in menuItemText. */}
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
              // .map() transforms an array into an array of JSX elements.
              // Each element needs a unique "key" prop so React can track
              // which items changed, were added, or removed efficiently.
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard3x3,
                  selectedCategory === category.name && styles.categoryCard3x3Active,
                  // Conditional style: add the active style only when this
                  // card's name matches selectedCategory.
                ]}
                onPress={() => handleCategoryPress(category.name)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryIcon3x3,
                    selectedCategory === category.name && styles.categoryIcon3x3Active,
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    // "as any" silences a TypeScript error — Ionicons expects
                    // a specific union type for icon names; casting to any
                    // is acceptable here since we know the names are valid.
                    size={28}
                    color={selectedCategory === category.name ? "#fff" : PRIMARY_TEAL}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryName3x3,
                    selectedCategory === category.name && styles.categoryName3x3Active,
                  ]}
                  numberOfLines={1}
                  // Truncate text to 1 line with "…" if it overflows.
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
            // horizontal={true} makes this scroll left-right instead of up-down
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

          {/* FlatList vs ScrollView:
              ScrollView renders ALL children at once — fine for small lists.
              FlatList only renders items currently visible on screen
              (plus a small buffer), making it far more efficient for long lists.
              scrollEnabled={false} here because FlatList is already inside
              a ScrollView; we let the outer ScrollView handle scrolling. */}
          <FlatList
            data={filteredProviders}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            // keyExtractor tells FlatList which field to use as the unique key.
            // It's the FlatList equivalent of the key={} prop in .map().
            renderItem={({ item }) => (
              // renderItem receives an object; we destructure "item" from it.
              // <Link> from expo-router wraps a Touchable with a navigation
              // target. "asChild" passes the href down to the child instead
              // of rendering its own element.
              <Link href={`/provider/${item.id}`} asChild>
                <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                  <View style={styles.cardImageContainer}>
                    <View style={styles.cardImagePlaceholder}>
                      <Text style={styles.avatarText}>
                        {item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        {/* Split the name on spaces, take the first letter of
                            each word, join them: "Marcus Holt" → "MH" */}
                      </Text>
                    </View>
                    {item.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={18} color={PRIMARY_TEAL} />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.providerName}>{item.name}</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={ACCENT_GOLD} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    <View style={styles.cardMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="business-outline" size={14} color={TEXT_MUTED} />
                        <Text style={styles.metaText}>{item.category}</Text>
                      </View>
                      <View style={styles.metaDot} />
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
                        <Text style={styles.metaText}>{item.region}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.reviewsText}>{item.reviews} reviews</Text>
                      <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={18} color={PRIMARY_TEAL} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
            // ListEmptyComponent renders when data is an empty array.
            // Cleaner than putting an if/else around the whole FlatList.
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
// StyleSheet.create() validates style properties at dev time and (on older RN
// versions) serialises styles to native IDs once, rather than on every render.
// Think of it as React Native's equivalent of a CSS file.
//
// Key differences from CSS:
//   • camelCase instead of kebab-case (backgroundColor not background-color)
//   • Numbers for pixel values, not strings ("16" not "16px")
//   • No cascading — each component gets exactly the styles you give it
//   • Flexbox is the ONLY layout system (and it defaults to column, not row)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flex:1 tells this View to fill all available space. On the root View
    // this means the full screen.
    backgroundColor: BG_GRAY,
  },
  header: {
    backgroundColor: PRIMARY_TEAL,
    paddingTop: 50,       // clears the status bar on most phones
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    // elevation is Android's equivalent of box-shadow.
    // shadowColor/Offset/Opacity/Radius work on iOS.
    // You need both to get shadows on both platforms.
  },
  headerTop: {
    flexDirection: "row",
    // Default flexDirection is "column" (top-to-bottom).
    // "row" arranges children left-to-right.
    justifyContent: "space-between",
    // Pushes children to opposite ends of the main axis (row here).
    alignItems: "flex-start",
    // Aligns children to the top on the cross axis (column here).
    marginBottom: 20,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  userButton: {
    width: 48,
    height: 48,
    borderRadius: 24,         // half of width/height = circle
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
    // flex:1 inside a row makes this input take up ALL remaining space
    // after the icons on each side have taken their fixed width.
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
    // flexWrap:"wrap" lets children spill onto a new row when the row is full.
    // Combined with the calculated width below, this creates the 3×3 grid.
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard3x3: {
    width: (width - 64) / 3,
    // screen width minus (20px left pad + 20px right pad + 2×12px gaps) ÷ 3
    // = exactly one-third of usable width.
    aspectRatio: 1, // height = width, making perfect squares
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
    // transform takes an array of transform objects. scale:1.02 makes the
    // active card 2% larger — a subtle "pop" effect.
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
    // position:"absolute" takes the element out of the normal flow.
    // It's positioned relative to its nearest ancestor with
    // position:"relative" (cardImageContainer above).
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