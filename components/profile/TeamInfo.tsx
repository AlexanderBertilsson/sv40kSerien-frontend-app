import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';

interface TeamInfoProps {
  teamName: string;
  teamLogo: string;
  role: string;
  sportsmanshipRating?: number;
}

export function TeamInfo({ teamName, teamLogo, role, sportsmanshipRating }: TeamInfoProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Team</ThemedText>
      
      <View style={styles.teamCard}>
        <View style={styles.teamHeader}>
          <Image
            source={teamLogo}
            style={styles.teamLogo}
            contentFit="cover"
          />
          <View style={styles.teamDetails}>
            <ThemedText style={styles.teamName}>{teamName}</ThemedText>
            <ThemedText style={styles.role}>{role}</ThemedText>
          </View>
        </View>
        
        {sportsmanshipRating !== undefined && (
          <View style={styles.ratingContainer}>
            <ThemedText style={styles.ratingLabel}>Sportsmanship</ThemedText>
            <ThemedText style={styles.ratingValue}>{sportsmanshipRating}/5</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray text
    marginBottom: 12,
  },
  teamCard: {
    backgroundColor: '#02040F',  // Nearly black background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#840032',  // Deep red border
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E59500',  // Orange border
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray text
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#E59500',  // Orange text
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#840032',  // Deep red border
  },
  ratingLabel: {
    fontSize: 14,
    color: '#E5DADA',  // Light gray text
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E59500',  // Orange text
  },
});
