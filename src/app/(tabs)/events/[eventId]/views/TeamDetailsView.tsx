import { View, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { EventParticipants } from '@/src/components/event';
import { Event } from '@/types/Event';

interface TeamDetailsViewProps {
  event: Event;
}

export default function TeamDetailsView({ event }: TeamDetailsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Registered Teams ({event.numberOfRegisteredTeams})
      </ThemedText>
      <EventParticipants 
        roster={event.registeredTeams} 
        theme={theme} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 12,
  },
});
