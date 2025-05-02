import { View, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
export default function EventScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const {eventId} = useLocalSearchParams();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type='title'>Event {eventId}</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText>View the event info</ThemedText>
      <ThemedText>Edit the event if you are the organizer</ThemedText>
      <ThemedText>Join the event if you are a team or player</ThemedText>
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
