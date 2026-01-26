import { View, StyleSheet } from 'react-native';
import ThemedText from '@/src/components/ThemedText';

export default function PlacingsView() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Placings</ThemedText>
      <ThemedText style={styles.emptyText}>
        Final placings will be available after the event concludes.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 12,
  },
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
