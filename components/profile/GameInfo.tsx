import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

interface Army {
  name: string;
  gamesPlayed: number;
}

interface GameInfoProps {
  armies: Army[];
  role: string;
}

export function GameInfo({ armies, role }: GameInfoProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Gaming Profile</ThemedText>
      
      <View style={styles.card}>
        <View style={styles.roleSection}>
          <ThemedText style={styles.label}>Preferred Role</ThemedText>
          <ThemedText style={styles.roleText}>{role}</ThemedText>
        </View>

        <View style={styles.armiesSection}>
          <ThemedText style={styles.label}>Most Played Armies</ThemedText>
          {armies.map((army, index) => (
            <View key={index} style={styles.armyRow}>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5DADA',  
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#02040F',  
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#840032',  
  },
  roleSection: {
    marginBottom: 16,
  },
  armiesSection: {
    borderTopWidth: 1,
    borderTopColor: '#840032',  
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#E5DADA',  
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E59500',  
  },
  armyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  armyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E5DADA',  
  },
  gamesPlayed: {
    fontSize: 14,
    color: '#E59500',  
  },
});
