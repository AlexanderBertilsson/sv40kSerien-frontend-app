import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { colors } from '@/constants/theme';

interface Army {
  name: string;
  gamesPlayed: number;
}

interface GameInfoProps {
  role: string;
  armies: Army[];
}

export function GameInfo({ role, armies }: GameInfoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.title}>Battle History</ThemedText>
        
        <View style={styles.roleContainer}>
          <ThemedText style={styles.label}>Preferred Role:</ThemedText>
          <ThemedText style={styles.value}>{role}</ThemedText>
        </View>

        <View style={styles.armiesContainer}>
          <ThemedText style={styles.label}>Armies:</ThemedText>
          {armies.map((army, index) => (
            <View key={index} style={styles.armyItem}>
              <ThemedText style={styles.armyName}>{army.name}</ThemedText>
              <ThemedText style={styles.gamesPlayed}>
                {army.gamesPlayed} {army.gamesPlayed === 1 ? 'game' : 'games'}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.silver,
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.slate,
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: colors.silver,
    fontWeight: '500',
  },
  armiesContainer: {
    gap: 16,
  },
  armyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.darkNavy,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  armyName: {
    fontSize: 16,
    color: colors.silver,
    fontWeight: '500',
    lineHeight: 20,
  },
  gamesPlayed: {
    fontSize: 14,
    color: colors.slate,
    lineHeight: 18,
  },
});
