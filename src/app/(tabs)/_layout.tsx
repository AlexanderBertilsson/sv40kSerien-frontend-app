import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { useUserContext } from '@/src/contexts/ProfileContext';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const { isAuthenticated } = useAuthContext();
  const { profile } = useUserContext();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
          href: isAuthenticated && profile?.id ? `/user/${profile?.id}` : null,
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team/[teamId]"
        options={{
          href: isAuthenticated && profile?.team?.id ? `/team/${profile?.team?.id}` : null,
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
    </Tabs>
  );
}