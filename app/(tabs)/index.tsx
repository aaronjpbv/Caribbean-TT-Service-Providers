// app/(tabs)/index.tsx
import { Link } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // This IS a screen users see
  // This IS a route: "/"
  
  const providers = [
    { id: '1', name: 'JJ Plumbing' },
    { id: '2', name: 'Cool Breeze AC' },
  ];
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Find Service Providers
      </Text>
      
      <FlatList
        data={providers}
        renderItem={({ item }) => (
          <Link href={`/provider/${item.id}`} asChild>
            <TouchableOpacity style={{ padding: 16, backgroundColor: '#fff' }}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
