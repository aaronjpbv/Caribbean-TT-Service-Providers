// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PRIMARY_BLUE = '#006994';
const LIGHT_GRAY = '#f4f4f4';

export default function HomeScreen() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const regions = ['All', 'North', 'South', 'East', 'West', 'Tobago'];

  const providers = [
    { id: '1', name: 'JJ Plumbing', category: 'Plumbing', region: 'North', rating: 4.8 },
    { id: '2', name: 'Cool Breeze AC', category: 'AC', region: 'South', rating: 4.9 },
    { id: '3', name: 'Harry Landscaping', category: 'Landscaping', region: 'East', rating: 4.5 },
    { id: '4', name: 'Sparky Electrical', category: 'Electrical', region: 'West', rating: 4.7 },
  ];

  const filteredProviders = providers.filter((provider) => {
    const matchesRegion =
      selectedRegion === 'All' || provider.region === selectedRegion;

    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.region.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Trusted Services</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search services..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          
            />


        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Region Filter */}
        <Text style={styles.sectionLabel}>Filter by Region</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              onPress={() => setSelectedRegion(region)}
              style={[
                styles.filterPill,
                selectedRegion === region && styles.activePill,
              ]}
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

        {/* Providers List */}
        <Text style={styles.sectionLabel}>Featured Portfolios</Text>
        <FlatList
          data={filteredProviders}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/provider/${item.id}`} asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons
                    name="construct-outline"
                    size={40}
                    color={PRIMARY_BLUE}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.providerName}>{item.name}</Text>
                  <Text style={styles.providerDetails}>
                    {item.category} • {item.region}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {item.rating} (View Portfolio)
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </Link>
          )}
        />

        {/* No Results Message */}
        {filteredProviders.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No providers found.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#006994', padding: 20, paddingTop: 50 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', margin: 15 },
  filterScroll: { paddingLeft: 15, marginBottom: 5 },
  filterPill: { borderWidth: 1, borderColor: '#006994', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  activePill: { backgroundColor: '#006994' },
  pillText: { color: '#006994' },
  activePillText: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 12, padding: 12, backgroundColor: '#f4f4f4', borderRadius: 12 },
  cardImagePlaceholder: { width: 60, height: 60, backgroundColor: '#dce8f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 16, fontWeight: '600' },
  providerDetails: { color: '#666', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 4, color: '#444', fontSize: 13 },
});
