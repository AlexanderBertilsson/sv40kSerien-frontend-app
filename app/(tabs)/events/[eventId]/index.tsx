import { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useEvent } from '@/hooks/useEvent';
import { useEventManagement } from '@/hooks/useEventManagement';
import { Event } from '@/types/utils/types/Event';
import {
  EventHeader,
  EventDetails,
  EventParticipants,
  EditEventModal,
  JoinTeamEventModal,
  DeleteConfirmationModal,
  JoinEventModal
} from '@/components/event';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserContext } from '@/contexts/ProfileContext';

export default function EventScreen() {
  const { isAuthenticated } = useAuthContext();
  const { profile } = useUserContext();
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { event, loading, error } = useEvent(eventId);
  const { updateEvent, deleteEvent, joinEvent, loading: actionLoading, error: actionError } = useEventManagement();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinTeamModalVisible, setJoinTeamModalVisible] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});

  // Initialize the form when event data is loaded
  useEffect(() => {
    if (event) {
      setIsOrganizer(event.userRole === 'organizer');
      setEditedEvent({
        title: event.title,
        description: event.description,
        rounds: event.rounds,
        date: event.date,
        location: event.location,
        type: event.type
      });
    }
  }, [event]);

  const handleUpdateEvent = async () => {
    if (!eventId) return;
    
    const result = await updateEvent(eventId, editedEvent);
    if (result) {
      setEditModalVisible(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    
    const result = await deleteEvent(eventId);
    if (result) {
      setConfirmDeleteVisible(false);
      router.back();
    }
  };

  const handleJoinEvent = async () => {
    if (!eventId || !participantId) return;
    const result = await joinEvent(eventId, participantId);
    if (result) {
      setJoinModalVisible(false);
      setParticipantId('');
    }
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
        <ThemedText style={styles.errorText}>{error || 'Event not found'}</ThemedText>
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
          type={event.type} 
        />
        
        <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
        
        {/* Event Details */}
        <EventDetails 
          date={event.date}
          location={event.location}
          rounds={event.rounds}
          description={event.description}
        />
        
        {/* Roster Section */}
        <EventParticipants 
          roster={event.roster} 
          theme={theme} 
        />

        {isAuthenticated && profile?.team ? (<View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={event.type === 'single' ? () => setJoinModalVisible(true) : () => setJoinTeamModalVisible(true)}
          >
            <ThemedText style={{ color: '#fff' }}>Join Event</ThemedText>
          </TouchableOpacity>

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
        error={actionError}
      />
      
      {/* Join Event Modal */}
      {profile?.team && <JoinTeamEventModal 
        visible={joinTeamModalVisible}
        onClose={() => setJoinTeamModalVisible(false)}
        onJoin={handleJoinEvent}
        eventType={event.type as '8man' | '5man'}
        theme={theme}
        loading={actionLoading}
        error={actionError}
        teamId={profile!.team.id}
      />}

      {/* Join Event Modal */}
      {profile?.team && <JoinEventModal 
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onJoin={handleJoinEvent}
        theme={theme}
        loading={actionLoading}
        error={actionError}
      />}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onDelete={handleDeleteEvent}
        theme={theme}
        loading={actionLoading}
      />
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
