import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useAuthContext } from '@/src/contexts/AuthContext';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'dark';
    const { isAuthenticated, authUser } = useAuthContext();
    const segments = useSegments();

    // Hide tab bar when on pairings game screens
    const isPairingsGame = segments.includes('pairings');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: isPairingsGame ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user/[userId]"
        options={{
          href: isAuthenticated && authUser?.id ? `/user/${authUser?.id}` : null,
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team/[teamId]"
        options={{
          href: isAuthenticated && authUser?.teamId ? `/team/${authUser?.teamId}` : null,
          title: 'Team',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="flag-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ladder"
        options={{
          title: 'Ladder',
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pairings"
        options={{
          href: null,
          title: 'Pairings',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}