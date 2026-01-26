import { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useEvent } from '@/src/hooks/useEvent';
import { useEventManagement } from '@/src/hooks/useEventManagement';
import { UpdateEventRequest, PairingStrategy } from '@/types/EventAdmin';
import { JoinEventModal } from '@/src/components/modals/joinEventModal';
import {
  EventHeader,
  EditEventModal,
  DeleteConfirmationModal,
} from '@/src/components/event';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { TabSwitcher } from '@/src/components/common/TabSwitcher';
import {
  EventDetailsView,
  PlayerDetailsView,
  TeamDetailsView,
  PairingsView,
  PlacingsView,
  AdminView,
} from './views';

type EventTab = 'details' | 'playerDetails' | 'teams' | 'pairings' | 'placings' | 'admin';

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
  const [joinEventModalVisible, setJoinEventModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<EventTab>('details');
  
  // Event condition states
  const [isEventFull, setIsEventFull] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isTeamRegistered, setIsTeamRegistered] = useState(false);
  const [isEventPast, setIsEventPast] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const disableJoinButton = isEventFull || isUserRegistered || isTeamRegistered || isEventPast;

  const baseTabs = [
    { key: 'details' as const, label: 'Overview' },
    { key: 'playerDetails' as const, label: 'Player Details' },
    { key: 'teams' as const, label: 'Roster' },
    { key: 'pairings' as const, label: 'Pairings' },
    { key: 'placings' as const, label: 'Placings' },
  ];

  const tabs = isOrganizer 
    ? [...baseTabs, { key: 'admin' as const, label: 'Admin' }]
    : baseTabs;

  const renderTabContent = () => {
    if (!event) return null;
    switch (activeTab) {
      case 'details':
        return <EventDetailsView event={event} />;
      case 'playerDetails':
        return <PlayerDetailsView eventId={event.id} />;
      case 'teams':
        return <TeamDetailsView event={event} />;
      case 'pairings':
        return (
          <PairingsView 
            eventId={event.id} 
            userTeamId={authUser?.teamId}
            registeredTeams={event.registeredTeams}
          />
        );
      case 'placings':
        return <PlacingsView />;
      case 'admin':
        return isOrganizer ? (
          <AdminView
            event={event}
            editedEvent={editedEvent}
            setEditedEvent={setEditedEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            actionLoading={actionLoading}
            actionError={actionError}
          />
        ) : null;
      default:
        return <EventDetailsView event={event} />;
    }
  };

  const [editedEvent, setEditedEvent] = useState<UpdateEventRequest>({});

  // Initialize state when event data is loaded
  useEffect(() => {
    if (event) {
      // Event conditions
      setIsEventFull(event.numberOfRegisteredTeams >= event.numberOfPlayers / 5);
      setIsUserRegistered(event.registeredTeams.some(team => team.users.some(user => user.id === authUser?.id)));
      setIsTeamRegistered(event.registeredTeams.some(team => team.id === authUser?.teamId));
      setIsEventPast(event.startDate < new Date().toISOString());
      setIsOrganizer(event.createdByUserId === authUser?.id);
      
      setEditedEvent({
        title: event.title,
        description: event.description,
        numberOfRounds: event.rounds,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        playerPack: event.playerPack,
        maxParticipants: event.numberOfPlayers,
        eventTypeId: event.eventType?.id,
        hideLists: event.hideLists ?? false,
        seasonId: event.seasonId ?? null,
        pairingStrategy: (event.pairingStrategy as PairingStrategy) ?? null,
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
    
    await deleteEventMutation.mutateAsync(eventId);
    setConfirmDeleteVisible(false);
    router.back();
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
        
        {/* Tab Switcher */}
        <TabSwitcher
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={styles.tabSwitcher}
        />

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        {/* Action Buttons */}
        {isAuthenticated && authUser?.teamId && !disableJoinButton ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={() => openJoinEventModal()}
            >
              <ThemedText style={{ color: '#fff' }}>Join Event</ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}
        
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
  tabSwitcher: {
    marginBottom: 16,
  },
  tabContent: {
    flex: 1,
    minHeight: 200,
  },
});
