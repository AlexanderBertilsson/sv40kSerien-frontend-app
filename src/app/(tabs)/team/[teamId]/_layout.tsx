import { Stack } from "expo-router";
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';

export default function TeamLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return <Stack
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
          title: 'Team',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamMembers"
        options={{
          title: 'Team Members',
        }}
      />
      <Stack.Screen
        name="matchHistory"
        options={{
          title: 'Match History',
        }}
      />
    </Stack>;
}