import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText style={[styles.title, { color: theme.text }]}>About</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText style={[styles.text, { color: theme.text }]}>
        Welcome to the Warhammer 40k Series app. Track your battles, manage your teams,
        and climb the ranks in the grim darkness of the far future.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    lineHeight: 24,
  },
});
