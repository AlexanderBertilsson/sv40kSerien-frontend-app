import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

interface StatItemProps {
  value: string | number;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

interface StatsOverviewProps {
  battles: number;
  winRate: number;
  points: number;
}

export function StatsOverview({ battles, winRate, points }: StatsOverviewProps) {
  return (
    <View style={styles.statsGrid}>
      <StatItem value={battles} label="Battles" />
      <StatItem value={`${winRate}%`} label="Win Rate" />
      <StatItem value={points} label="Points" />
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#02040F',  
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#840032',  
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E59500',  
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#E5DADA',  
  },
});
