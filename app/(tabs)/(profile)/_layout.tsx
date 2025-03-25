import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#002642',  // Dark blue from our palette
        },
        headerTintColor: '#E5DADA',  // Light gray from our palette
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,  // Hide header on main profile
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: "Statistics",
          headerStyle: {
            backgroundColor: '#002642',  // Dark blue from our palette
          },
          headerTintColor: '#E5DADA',  // Light gray from our palette
        }}
      />
    </Stack>
  );
}