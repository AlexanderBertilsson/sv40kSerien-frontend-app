import { View, StyleSheet, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface ProfileHeaderProps {
  username: string;
  title: string;
  team?: string;
  sportsmanship: number;
  sportsmanshipLevel: number;
  profilePicture: string;
  heroImage: string;
}

function getSportsmanshipLevel(progress: number, level: number): { level: number; progress: number } {
  // If level 5, show full progress since there's no next level
  if (level === 5) {
    return { level, progress: 100 };
  }

  return { level, progress };
}

export function ProfileHeader({ username, title, team, sportsmanship, sportsmanshipLevel, profilePicture, heroImage }: ProfileHeaderProps) {
  const { level, progress } = getSportsmanshipLevel(sportsmanship, sportsmanshipLevel);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.bannerContainer}>
        <Image
          source={heroImage}
          style={styles.heroBanner}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', theme.background]}
          style={styles.bannerGradient}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: theme.secondary }]}>
          <View style={styles.profileContent}>
            <View style={[styles.profilePictureContainer, { borderColor: theme.icon }]}>
              <Image
                source={profilePicture}
                style={styles.profilePicture}
                contentFit="cover"
              />
            </View>

            <View style={styles.info}>
              <ThemedText style={[styles.username, { color: theme.text }]}>{username}</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.label, { color: theme.text }]}>{'Team: '}</ThemedText>
                <ThemedText style={[styles.value, { color: theme.text }]}>{team}</ThemedText>
              </View>
              <ThemedText style={[styles.title, { color: theme.text }]}>{title}</ThemedText>
            </View>
          </View>

          <View style={[styles.sportsmanshipContainer, { borderTopColor: theme.icon }]}>
            <View style={styles.sportsmanshipHeader}>
              <ThemedText style={[styles.sportsmanshipLabel, { color: theme.icon }]}>Sportsmanship Level</ThemedText>
              <View style={styles.levelBadge}>
                <ThemedText style={[styles.levelText, { color: theme.text }]}>{level}</ThemedText>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.tint }]} />
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
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginRight: 8,
    lineHeight: 18,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  sportsmanshipContainer: {
    borderTopWidth: 1,
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
    lineHeight: 18,
  },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },
});
