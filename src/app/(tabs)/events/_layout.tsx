import { Stack } from "expo-router";
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function EventLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return <Stack
    screenOptions={{
        headerShown: true,
        headerTitle: 'Events',
        headerStatusBarHeight: insets.top + 36,
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

      } as NativeStackNavigationOptions & { headerStatusBarHeight: number }}>
    <Stack.Screen
      name="index"
      options={{
        title: 'Events'
      }}/>
    <Stack.Screen
      name="[eventId]/pairings/[matchId]"
      options={{
        headerShown: false,
        title: 'Pairings',
      }}/>
    </Stack>
}