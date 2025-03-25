import { View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '../ThemedText';

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
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Battle Honors</ThemedText>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray from our palette
  },
  viewAll: {
    textDecorationLine: 'none',
  },
  viewAllText: {
    fontSize: 16,
    color: '#E59500',  // Orange from our palette
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#02040F',  // Nearly black from our palette
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#840032',  // Deep red from our palette
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray from our palette
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#E5DADA',  // Light gray from our palette
    opacity: 0.8,
  },
});
