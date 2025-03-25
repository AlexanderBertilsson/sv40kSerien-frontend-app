import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { colors } from '@/constants/theme';

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
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.title}>Statistics</ThemedText>
        <View style={styles.statsColumn}>
          <StatItem value={battles} label="Battles" />
          <StatItem value={`${winRate}%`} label="Win Rate" />
          <StatItem value={points} label="Points" />
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
  statsColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.darkNavy,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.silver,
    marginBottom: 8,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 14,
    color: colors.slate,
    lineHeight: 18,
  },
});
