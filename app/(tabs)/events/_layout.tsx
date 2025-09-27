import { Stack } from "expo-router";
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function EventLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return <Stack
    screenOptions={{
        headerShown: true,
        headerTitle: 'Events',
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
        
      }}>
    <Stack.Screen
      name="index"
      options={{
        headerShown: false,
        title: 'Events' 
      }}/>
    </Stack>
}