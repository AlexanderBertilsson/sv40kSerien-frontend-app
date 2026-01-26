import { View, StyleSheet } from 'react-native';
import { EventData } from '@/src/components/event';
import { Event } from '@/types/Event';

interface EventDetailsViewProps {
  event: Event;
}

export default function EventDetailsView({ event }: EventDetailsViewProps) {
  return (
    <View style={styles.container}>
      <EventData 
        date={event.startDate}
        location={event.location}
        rounds={event.rounds}
        description={event.description}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
