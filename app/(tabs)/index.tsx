import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText style={styles.subtitle}>Track your battles, achievements, and glory!</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002642',  // Dark blue from our palette
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray from our palette
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E59500',  // Orange from our palette
    textAlign: 'center',
  },
});
