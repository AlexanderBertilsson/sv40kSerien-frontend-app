import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';

interface ProfileHeaderProps {
  imageUrl: string;
  level: number;
  username: string;
  title: string;
}

export function ProfileHeader({ imageUrl, level, username, title }: ProfileHeaderProps) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        <Image
          source={imageUrl}
          style={styles.profileImage}
          contentFit="cover"
        />
        <View style={styles.levelBadge}>
          <ThemedText style={styles.levelText}>LVL {level}</ThemedText>
        </View>
      </View>

      <View style={styles.nameContainer}>
        <ThemedText style={styles.username}>{username}</ThemedText>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    padding: 16,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#E59500',  // Orange border
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#840032',  // Deep red badge
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 8,
  },
  levelText: {
    color: '#E5DADA',  // Light gray text
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameContainer: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray text
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#E59500',  // Orange text
  },
});
