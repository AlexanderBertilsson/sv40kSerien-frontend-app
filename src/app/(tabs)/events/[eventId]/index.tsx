import { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { useEvent } from '@/src/hooks/useEvent';
import { useEventManagement } from '@/src/hooks/useEventManagement';
import { Event } from '@/types/Event';
import { JoinEventModal } from '@/src/components/modals/joinEventModal';
import {
  EventHeader,
  EventData,
  EventParticipants,
  EditEventModal,
  DeleteConfirmationModal,
} from '@/src/components/event';
import { useAuthContext } from '@/src/contexts/AuthContext';

// Helper function to convert Error objects to strings
const getErrorMessage = (error: Error | null): string | null => {
  if (error instanceof Error) {
    return error.message;
  }
  return error as string | null;
};

export default function EventScreen() {
  const { isAuthenticated, authUser } = useAuthContext();
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { eventQuery } = useEvent(eventId);
  const { updateEventMutation, deleteEventMutation } = useEventManagement();
  
  // Extract data from queries
  const event = eventQuery.data;
  const loading = eventQuery.isLoading;
  const error = eventQuery.error;
  const actionLoading = updateEventMutation.isPending || deleteEventMutation.isPending;
  const actionError = updateEventMutation.error || deleteEventMutation.error;
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [disableJoinButton, setDisableJoinButton] = useState(true);
  const [joinEventModalVisible, setJoinEventModalVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setDisableJoinButton( event.numberOfRegisteredTeams >= event.numberOfPlayers / 5 
        || event.registeredTeams.some(team => team.users.some(user => user.id === authUser?.id))
        || authUser?.teamId === event.registeredTeams.find(team => team.users.some(user => user.id === authUser?.id))?.id
        || event.startDate < new Date().toISOString());
    }
  }, [event, authUser]);

  const [isOrganizer, setIsOrganizer] = useState(false);

  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});

  // Initialize the form when event data is loaded
  useEffect(() => {
    if (event) {
      setIsOrganizer(event.createdByUserId === authUser?.id);
      setEditedEvent({
        title: event.title,
        description: event.description,
        rounds: event.rounds,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        playerPack: event.playerPack,
        numberOfPlayers: event.numberOfPlayers,
        numberOfRegisteredPlayers: event.numberOfRegisteredPlayers,
        numberOfRegisteredTeams: event.numberOfRegisteredTeams,
        registeredTeams: event.registeredTeams,
        eventType: event.eventType,
        createdByUserId: event.createdByUserId,
        id: event.id
      });
    }
  }, [event, authUser]);

  const handleUpdateEvent = async () => {
    if (!eventId) return;
    
    const result = await updateEventMutation.mutateAsync({ id: eventId, data: editedEvent });
    if (result) {
      setEditModalVisible(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    
    const result = await deleteEventMutation.mutateAsync(eventId);
    if (result) {
      setConfirmDeleteVisible(false);
      router.back();
    }
  };

  const openJoinEventModal = (): void => {
    setJoinEventModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText>Loading event details...</ThemedText>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ThemedText type="title">Error</ThemedText>
        <ThemedText style={styles.errorText}>{error instanceof Error ? error.message : error || 'Event not found'}</ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: '#fff' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <EventHeader 
          title={event.title} 
          type={event.eventType.name} 
        />
        
        <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
        
        {/* Event Details */}
        <EventData 
          date={event.startDate}
          location={event.location}
          rounds={event.rounds}
          description={event.description}
        />
          {isAuthenticated && authUser?.teamId ? (<View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: disableJoinButton ? hexToRgba(theme.tint, 0.1) : theme.tint }]}
            onPress={() => openJoinEventModal()}
            disabled={disableJoinButton}
          >
            <ThemedText style={{ color: '#fff' }}>Join Event</ThemedText>
          </TouchableOpacity>
        {/* Roster Section */}
        <EventParticipants 
          roster={event.registeredTeams} 
          theme={theme} 
        />

      

          {isOrganizer ? (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.tint }]}
                onPress={() => setEditModalVisible(true)}
              >
                <ThemedText style={{ color: '#fff' }}>Edit Event</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={() => setConfirmDeleteVisible(true)}
              >
                <ThemedText style={{ color: '#fff' }}>Delete Event</ThemedText>
              </TouchableOpacity>
            </>
          ) : null}

        </View>) : null}
        
      </ScrollView>
      
      {/* Edit Event Modal */}
      <EditEventModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onUpdate={handleUpdateEvent}
        editedEvent={editedEvent}
        setEditedEvent={setEditedEvent}
        theme={theme}
        loading={actionLoading}
        error={getErrorMessage(actionError)}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onDelete={handleDeleteEvent}
        theme={theme}
        loading={actionLoading}
      />

      {/* Join Event Modal */}
      {event && authUser?.teamId && (
        <JoinEventModal 
          visible={joinEventModalVisible}
          onClose={() => setJoinEventModalVisible(false)}
          eventData={{
            eventId: event.id,
            title: event.title,
            type: event.eventType.name,
            playersPerTeam: event.eventType.playersPerTeam,
          }}
        teamId={authUser?.teamId}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  actionButtons: {
    marginTop: 16,
    gap: 12,
  },
});
