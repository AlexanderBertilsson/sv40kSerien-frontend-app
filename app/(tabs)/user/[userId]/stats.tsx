import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.background,
  };

  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.secondary,
  };

  const sectionTitleStyle = {
    ...styles.sectionTitle,
    color: theme.text,
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

  const armyStatsStyle = {
    ...styles.armyStats,
    color: theme.icon,
  };

  const pointsStyle = {
    ...styles.points,
    color: theme.tint,
  };

  const separatorStyle = {
    ...styles.separator,
    backgroundColor: theme.icon,
  };

  return (
    <ScrollView style={containerStyle}>
      <View style={styles.section}>
        <ThemedText style={sectionTitleStyle}>Battle Statistics</ThemedText>
        <View style={cardStyle}>
          <View style={styles.statRow}>
            <ThemedText style={labelStyle}>Total Battles</ThemedText>
            <ThemedText style={valueStyle}>127</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={labelStyle}>Wins</ThemedText>
            <ThemedText style={valueStyle}>96</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={labelStyle}>Losses</ThemedText>
            <ThemedText style={valueStyle}>31</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={labelStyle}>Win Rate</ThemedText>
            <ThemedText style={valueStyle}>76%</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={sectionTitleStyle}>Army Performance</ThemedText>
        <View style={cardStyle}>
          <View style={styles.armyRow}>
            <View>
              <ThemedText style={armyNameStyle}>Adeptus Mechanicus</ThemedText>
              <ThemedText style={armyStatsStyle}>85 battles • 72% win rate</ThemedText>
            </View>
            <ThemedText style={pointsStyle}>2187 pts</ThemedText>
          </View>
          <View style={separatorStyle} />
          <View style={styles.armyRow}>
            <View>
              <ThemedText style={armyNameStyle}>Imperial Knights</ThemedText>
              <ThemedText style={armyStatsStyle}>32 battles • 81% win rate</ThemedText>
            </View>
            <ThemedText style={pointsStyle}>1876 pts</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  armyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  armyName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  armyStats: {
    fontSize: 14,
  },
  points: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
});