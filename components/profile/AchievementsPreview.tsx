import { View, StyleSheet, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import ThemedText from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface Achievement {
  icon: string;
  title: string;
  description: string;
}

interface AchievementsPreviewProps {
  achievements: Achievement[];
}

export function AchievementsPreview({ achievements }: AchievementsPreviewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.secondary,
  };

  const viewAllStyle = {
    ...styles.viewAll,
    color: theme.tint,
  };

  const achievementCardStyle = {
    ...styles.achievementCard,
    backgroundColor: theme.background,
  };

  return (
    <View style={styles.container}>
      <View style={cardStyle}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Battle Honors</ThemedText>
          <Link href="/user/[userId]/stats" style={viewAllStyle}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </Link>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View key={index} style={achievementCardStyle}>
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
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
  },
  viewAllText: {
    fontSize: 14,
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
});
