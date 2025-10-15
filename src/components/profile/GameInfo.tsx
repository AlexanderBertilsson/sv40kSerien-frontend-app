import { View, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '../ThemedText';
import { Colors } from '@/src/constants/Colors';

interface GameInfoProps {
  role?: string;
  armies: { name: string, gamesPlayed: number }[];
}

export function GameInfo({ role, armies }: GameInfoProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.secondary,
  };

  const labelStyle = {
    ...styles.label,
    color: theme.icon,
  };

  const valueStyle = {
    ...styles.value,
    color: theme.text,
  };

  const armyNameStyle = {
    ...styles.armyName,
    color: theme.text,
  };

  const gamesPlayedStyle = {
    ...styles.gamesPlayed,
    color: theme.icon,
  };

  return (
    <View style={styles.container}>
      <View style={cardStyle}>
        <ThemedText style={styles.title}>Battle History</ThemedText>
        
        <View style={styles.roleContainer}>
          <ThemedText style={labelStyle}>Preferred Role:</ThemedText>
          <ThemedText style={valueStyle}>{role ?? "Not specified"}</ThemedText>
        </View>

        <View style={styles.armiesContainer}>
          <ThemedText style={labelStyle}>Armies:</ThemedText>
          {armies.map((army, index) => (
            <View key={index} style={styles.armyItem}>
              <ThemedText style={armyNameStyle}>{army.name}</ThemedText>
              <ThemedText style={gamesPlayedStyle}>
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
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  armiesContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  armyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  armyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gamesPlayed: {
    fontSize: 14,
  },
});
