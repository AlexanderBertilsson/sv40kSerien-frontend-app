import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '@/components/ThemedText';

interface EventDetailsProps {
  date: string;
  location: string;
  rounds: number;
  description: string;
}

const EventDetails = ({ date, location, rounds, description }: EventDetailsProps) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <ThemedText type="subtitle">Date:</ThemedText>
        <ThemedText>{new Date(date).toLocaleDateString()}</ThemedText>
      </View>
      
      <View style={styles.detailRow}>
        <ThemedText type="subtitle">Location:</ThemedText>
        <ThemedText>{location}</ThemedText>
      </View>
      
      <View style={styles.detailRow}>
        <ThemedText type="subtitle">Rounds:</ThemedText>
        <ThemedText>{rounds}</ThemedText>
      </View>
      
      <View style={styles.descriptionContainer}>
        <ThemedText type="subtitle">Description:</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  description: {
    marginTop: 8,
    lineHeight: 22,
  },
});

export default EventDetails;
