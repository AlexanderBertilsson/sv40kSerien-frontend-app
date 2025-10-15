import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';

export default function UserLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          color: theme.text,
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: 'Statistics',
          headerShown: true,
        }}
      />
    </Stack>
  );
}