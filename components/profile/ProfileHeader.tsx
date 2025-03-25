import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';
import { colors } from '@/constants/theme';

interface ProfileHeaderProps {
  username: string;
  title: string;
  team: string;
  sportsmanship: number;
  sportsmanshipLevel: number;
}

function getSportsmanshipLevel(progress: number, level: number): { level: number; progress: number } {
  // If level 5, show full progress since there's no next level
  if (level === 5) {
    return { level, progress: 100 };
  }

  return { level, progress };
}

export function ProfileHeader({ username, title, team, sportsmanship, sportsmanshipLevel }: ProfileHeaderProps) {
  const { level, progress } = getSportsmanshipLevel(sportsmanship, sportsmanshipLevel);

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image
          source="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000"
          style={styles.heroBanner}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', colors.darkNavy]}
          style={styles.bannerGradient}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.profileContent}>
            <View style={styles.profilePictureContainer}>
              <Image
                source="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400"
                style={styles.profilePicture}
                contentFit="cover"
              />
            </View>

            <View style={styles.info}>
              <ThemedText style={styles.username}>{username}</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Team:</ThemedText>
                <ThemedText style={styles.value}>{team}</ThemedText>
              </View>
              <ThemedText style={styles.title}>{title}</ThemedText>
            </View>
          </View>

          <View style={styles.sportsmanshipContainer}>
            <View style={styles.sportsmanshipHeader}>
              <ThemedText style={styles.sportsmanshipLabel}>Sportsmanship Level</ThemedText>
              <View style={styles.levelBadge}>
                <ThemedText style={styles.levelText}>{level}</ThemedText>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <ThemedText style={styles.progressText}>{progress}%</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.darkNavy,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  contentContainer: {
    paddingHorizontal: 16,
    transform: [{ translateY: -50 }],
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
  profileContent: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  profilePictureContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.steel,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.silver,
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.slate,
    marginRight: 8,
    lineHeight: 18,
  },
  value: {
    fontSize: 14,
    color: colors.silver,
    fontWeight: '500',
    lineHeight: 18,
  },
  title: {
    fontSize: 16,
    color: colors.slate,
    lineHeight: 20,
  },
  sportsmanshipContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.steel,
    paddingTop: 16,
  },
  sportsmanshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportsmanshipLabel: {
    fontSize: 14,
    color: colors.slate,
    lineHeight: 18,
  },
  levelBadge: {
    backgroundColor: colors.darkNavy,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.steel,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.silver,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.darkNavy,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.slate,
    width: 36,
    textAlign: 'right',
  },
});
