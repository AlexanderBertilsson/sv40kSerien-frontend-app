import { View, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type='title'>Events</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText>View all upcoming events</ThemedText>
      <ThemedText>Create new event</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 24,
  }
});
