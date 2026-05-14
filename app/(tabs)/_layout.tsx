// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
<<<<<<< HEAD
          backgroundColor: "#E98260",  
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold", 
=======
          backgroundColor: "#006994",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
>>>>>>> 0be7f1d3e1e684fceaa17a929c348ef7b5495a78
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // No header for home screen
        }}
      />
      <Stack.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
