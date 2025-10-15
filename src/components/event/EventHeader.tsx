import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '@/src/components/ThemedText';

interface EventHeaderProps {
  title: string;
  type: string;
}

const EventHeader = ({ title, type }: EventHeaderProps) => {
  return (
    <View style={styles.header}>
      <ThemedText type='title'>{title}</ThemedText>
      <View style={styles.eventTypeTag}>
        <ThemedText style={styles.eventTypeText}>{type}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  eventTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#555',
    borderRadius: 4,
  },
  eventTypeText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default EventHeader;
