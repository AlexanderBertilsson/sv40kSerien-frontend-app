import { Tabs, useSegments } from 'expo-router';
import { Colors } from '@/src/constants/Colors';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DeviceTabs() {
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
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user/[userId]"
        options={{
          href: isAuthenticated && authUser?.id ? `/user/${authUser?.id}` : null,
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team/create"
        options={{
          href: isAuthenticated && !authUser?.teamId ? `/team/create` : null,
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="flag-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team/[teamId]"
        options={{
          href: isAuthenticated && authUser?.teamId ? `/team/${authUser?.teamId}` : null,
          title: '',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="flag-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ladder"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pairings"
        options={{
          title: '',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}