// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_BLUE = '#006994';
const LIGHT_GRAY = '#f4f4f4';

export default function HomeScreen() {
  const [selectedRegion, setSelectedRegion] = useState('All');

  const categories = ['All', 'Plumbing', 'AC', 'Electrical', 'Landscaping', 'Tiling'];
  const regions = ['All', 'North', 'South', 'East', 'West', 'Tobago'];

  const providers = [
    { id: '1', name: 'JJ Plumbing', category: 'Plumbing', region: 'North', rating: 4.8 },
    { id: '2', name: 'Cool Breeze AC', category: 'AC', region: 'South', rating: 4.9 },
    { id: '3', name: 'Harry Landscaping', category: 'Landscaping', region: 'East', rating: 4.5 },
    { id: '4', name: 'Sparky Electrical', category: 'Electrical', region: 'West', rating: 4.7 },
  ];

  const filteredProviders = selectedRegion === 'All' 
    ? providers 
    : providers.filter(p => p.region === selectedRegion);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Trusted Services</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput placeholder="Search services..." style={styles.searchInput} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Region Filter - New Feature */}
        <Text style={styles.sectionLabel}>Filter by Region</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {regions.map((region) => (
            <TouchableOpacity 
              key={region} 
              onPress={() => setSelectedRegion(region)}
              style={[styles.filterPill, selectedRegion === region && styles.activePill]}
            >
              <Text style={[styles.pillText, selectedRegion === region && styles.activePillText]}>{region}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Providers List */}
        <Text style={styles.sectionLabel}>Featured Portfolios</Text>
        <FlatList
          data={filteredProviders}
          scrollEnabled={false} // Since it's inside a ScrollView
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/provider/${item.id}`} asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="construct-outline" size={40} color={PRIMARY_BLUE} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.providerName}>{item.name}</Text>
                  <Text style={styles.providerDetails}>{item.category} • {item.region}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating} (View Portfolio)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </Link>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: PRIMARY_BLUE, marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GRAY,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchInput: { marginLeft: 10, fontSize: 16, flex: 1 },
  sectionLabel: { fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginVertical: 10 },
  filterScroll: { paddingLeft: 20, marginBottom: 20 },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LIGHT_GRAY,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activePill: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  pillText: { color: '#666', fontWeight: '600' },
  activePillText: { color: '#fff' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E6F0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  providerName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  providerDetails: { color: '#777', marginVertical: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: PRIMARY_BLUE, marginLeft: 4, fontWeight: '600' },
});