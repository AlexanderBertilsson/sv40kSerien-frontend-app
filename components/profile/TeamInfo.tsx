import { View, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Image } from 'expo-image';
import ThemedText from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { Link } from 'expo-router';

interface TeamInfoProps {
  teamName: string;
  teamLogo: string;
  role: string;
  sportsmanshipRating: number;
  teamId: string;
}

const fallbackLogo = 'https://images.unsplash.com/photo-1599753894977-bc6c46289a76?q=80&w=400';

export function TeamInfo({ teamName, teamLogo, role, sportsmanshipRating, teamId }: TeamInfoProps) {
  const [imageError, setImageError] = useState(false);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.secondary,
  };

  const logoContainerStyle = {
    ...styles.logoContainer,
    borderColor: theme.icon,
  };

  const labelStyle = {
    ...styles.label,
    color: theme.text,
  };

  const valueStyle = {
    ...styles.value,
    color: theme.text,
  };

  const linkStyle = {
    ...styles.link,
    color: theme.tint
  };

  return (
    <View style={styles.container}>
      <View style={cardStyle}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Team Information</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={logoContainerStyle}> 
          <Link href={`/team/${teamId}`} asChild>
              <Image
                source={imageError ? fallbackLogo : teamLogo}
                style={styles.logo}
                contentFit="cover"
                onError={() => setImageError(true)}
                />
          </Link>
          </View>

          <View style={styles.info}>
            <Link href={`/team/${teamId}`} asChild>
              <Pressable style={styles.infoRow}>
                <ThemedText style={labelStyle}>Team:</ThemedText>
                <ThemedText style={[valueStyle, linkStyle]}>{teamName}</ThemedText>
              </Pressable>
            </Link>
            
            <View style={styles.infoRow}>
              <ThemedText style={labelStyle}>Role:</ThemedText>
              <ThemedText style={valueStyle}>{role}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={labelStyle}>Sportsmanship:</ThemedText>
              <ThemedText style={valueStyle}>{sportsmanshipRating.toFixed(1)} / 5.0</ThemedText>
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
    marginRight: 12,
    width: 100,
    lineHeight: 18,
  },
  value: {
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  link: {
    fontWeight: 'bold'
  }
});
