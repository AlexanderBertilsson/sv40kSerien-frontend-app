import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { RosterTeam } from '@/types/utils/types/RosterTeam';
import { RosterPlayer } from '@/types/utils/types/RosterPlayer';

interface EventParticipantsProps {
  roster: (RosterTeam | RosterPlayer)[];
  theme: any;
}

const EventParticipants = ({ roster, theme }: EventParticipantsProps) => {
  return (
    <View style={styles.sectionContainer}>
      <ThemedText type="subtitle">Participants</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      
      {roster && roster.length > 0 ? (
        roster.map((item, index) => (
          <View key={index} style={styles.rosterItem}>
            <ThemedText>{('name' in item) ? item.name : ('username' in item ? item.username : 'Unknown participant')}</ThemedText>
          </View>
        ))
      ) : (
        <ThemedText>No participants yet</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  rosterItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default EventParticipants;
