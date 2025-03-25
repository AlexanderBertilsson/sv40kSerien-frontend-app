import { View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '../ThemedText';
import { colors } from '@/constants/theme';

interface Achievement {
  icon: string;
  title: string;
  description: string;
}

interface AchievementsPreviewProps {
  achievements: Achievement[];
}

export function AchievementsPreview({ achievements }: AchievementsPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Battle Honors</ThemedText>
          <Link href="/(tabs)/(profile)/stats" style={styles.viewAll}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </Link>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <ThemedText style={styles.achievementIcon}>{achievement.icon}</ThemedText>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>{achievement.title}</ThemedText>
                <ThemedText style={styles.achievementDesc}>{achievement.description}</ThemedText>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.silver,
  },
  viewAll: {
    padding: 8,
  },
  viewAllText: {
    color: colors.slate,
    fontSize: 14,
  },
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.darkNavy,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.silver,
    marginBottom: 4,
    lineHeight: 20,
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.slate,
    lineHeight: 18,
  },
});
