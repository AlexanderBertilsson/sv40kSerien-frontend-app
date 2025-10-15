import { View, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '../ThemedText';
import { Colors } from '@/src/constants/Colors';

interface StatItemProps {
  value: string | number;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const statCardStyle = {
    ...styles.statCard,
    backgroundColor: theme.background,
    borderColor: theme.icon,
  };

  return (
    <View style={statCardStyle}>
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
      <ThemedText style={styles.title}>Statistics</ThemedText>
      <View style={styles.statsColumn}>
        <StatItem value={battles} label="Battles" />
        <StatItem value={`${winRate}%`} label="Win Rate" />
        <StatItem value={points} label="Points" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
});
