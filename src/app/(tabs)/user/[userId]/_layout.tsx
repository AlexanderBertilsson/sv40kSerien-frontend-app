import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export default function UserLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStatusBarHeight: insets.top + 56,
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
      } as NativeStackNavigationOptions & { headerStatusBarHeight: number }}
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