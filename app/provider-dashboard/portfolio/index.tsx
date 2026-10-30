import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Provider {
  name: string;
  yrs_experience: number;
  region: string;
  image: string;
}

export default function Portfolio() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPortfolio();
  }, []);

  async function getPortfolio() {
    setLoading(true);
    const { data, error } = await supabase
      .from('provider')
      .select('name, yrs_experience, region, image')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching portfolio:', error);
      setError(error.message);
    } else {
      setProvider(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !provider) {
    return (
      <View style={styles.centered}>
        <Text>Could not load provider.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{provider.name}</Text>
      <Text>{provider.region}</Text>
      <Text>{provider.yrs_experience} years experience</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  name: { fontSize: 20, fontWeight: '700' },
});  