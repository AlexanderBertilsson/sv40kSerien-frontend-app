import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText style={[styles.title, { color: theme.text }]}>Home</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText style={[styles.text, { color: theme.text }]}>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText style={[styles.text, { color: theme.text }]}>Track your battles, achievements, and glory!</ThemedText>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 24,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
