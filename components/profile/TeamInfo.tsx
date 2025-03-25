import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';
import { colors } from '@/constants/theme';
import { useState } from 'react';

interface TeamInfoProps {
  teamName: string;
  teamLogo: string;
  role: string;
  sportsmanshipRating: number;
}

const fallbackLogo = 'https://images.unsplash.com/photo-1599753894977-bc6c46289a76?q=80&w=400';

export function TeamInfo({ teamName, teamLogo, role, sportsmanshipRating }: TeamInfoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Team Information</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={imageError ? fallbackLogo : teamLogo}
              style={styles.logo}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          </View>

          <View style={styles.info}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Team:</ThemedText>
              <ThemedText style={styles.value}>{teamName}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Role:</ThemedText>
              <ThemedText style={styles.value}>{role}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Sportsmanship:</ThemedText>
              <ThemedText style={styles.value}>{sportsmanshipRating.toFixed(1)} / 5.0</ThemedText>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.silver,
  },
  content: {
    flexDirection: 'row',
    gap: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.steel,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.slate,
    marginRight: 12,
    width: 100,
    lineHeight: 18,
  },
  value: {
    fontSize: 14,
    color: colors.silver,
    flex: 1,
    lineHeight: 18,
  },
});
