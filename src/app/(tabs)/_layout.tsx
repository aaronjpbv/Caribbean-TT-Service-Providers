// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Star, User } from 'lucide-react-native';

export default function TabLayout() {
  // This is NOT a screen
  // It's a TAB BAR CONTAINER
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#006994',
      }}
    >
      {/* These ARE the screens inside tabs */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen 
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Star color={color} />,
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  );
}