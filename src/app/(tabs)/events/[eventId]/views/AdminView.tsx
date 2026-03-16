import { useState } from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { Event, EventTeam } from '@/types/Event';
import { UpdateEventRequest, RoundDto } from '@/types/EventAdmin';
import type { RoundStatus } from '@/types/EventAdmin';
import { EditEventModal } from '@/src/components/event';
import { useEventAdmin } from '@/src/hooks/useEventAdmin';

interface AdminViewProps {
  event: Event;
  editedEvent: UpdateEventRequest;
  setEditedEvent: React.Dispatch<React.SetStateAction<UpdateEventRequest>>;
  onUpdateEvent: (override?: Partial<UpdateEventRequest>) => Promise<void>;
  onDeleteEvent: () => Promise<void>;
  actionLoading: boolean;
  actionError: Error | null;
}

type EventStatus = 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed';

export default function AdminView({ 
  event, 
  editedEvent,
  setEditedEvent,
  onUpdateEvent,
  onDeleteEvent,
  actionLoading,
  actionError,
}: AdminViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  
  const {
    eventStateQuery,
    openRegistrationMutation,
    closeRegistrationMutation,
    startEventMutation,
    generateRoundMutation,
    startRoundMutation,
    completeRoundMutation,
    repairRoundMutation,
    completeEventMutation,
    dropTeamMutation,
  } = useEventAdmin(event.id);

  const [droppingTeamId, setDroppingTeamId] = useState<string | null>(null);
  const [confirmDropTeam, setConfirmDropTeam] = useState<EventTeam | null>(null);

  // Get event status from the event object (comes from API as string)
  const eventStatus = (event.status?.toLowerCase() || 'draft') as EventStatus;
  const currentRound = event.currentRoundNumber || 0;

  const rounds = eventStateQuery.data?.rounds || [];
  const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
  const lastRound = sortedRounds[sortedRounds.length - 1];
  const canGenerateNextRound = eventStatus === 'in_progress' && (!lastRound || lastRound.status === 'completed');
  const allRoundsCompleted = eventStatus === 'in_progress' && sortedRounds.length === event.rounds && lastRound?.status === 'completed';

  const isLoading = 
    openRegistrationMutation.isPending ||
    closeRegistrationMutation.isPending ||
    startEventMutation.isPending ||
    generateRoundMutation.isPending ||
    startRoundMutation.isPending ||
    completeRoundMutation.isPending ||
    repairRoundMutation.isPending ||
    completeEventMutation.isPending ||
    dropTeamMutation.isPending ||
    actionLoading;

  const getErrorMessage = (error: Error | null): string | null => {
    if (error instanceof Error) {
      return error.message;
    }
    return error as string | null;
  };

  const handleOpenRegistration = async () => {
    try {
      await openRegistrationMutation.mutateAsync();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to open registration');
    }
  };

  const handleCloseRegistration = async () => {
    try {
      await closeRegistrationMutation.mutateAsync();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to close registration');
    }
  };

  const handleStartEvent = async () => {
    try {
      await startEventMutation.mutateAsync();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to start event');
    }
  };

  const handleCompleteEvent = async () => {
    try {
      await completeEventMutation.mutateAsync();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to complete event');
    }
  };

  const handleGeneratePairings = async () => {
    try {
      await generateRoundMutation.mutateAsync();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to generate pairings');
    }
  };

  const handleStartRound = async (roundNumber: number) => {
    try {
      await startRoundMutation.mutateAsync(roundNumber);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to start round');
    }
  };

  const handleCompleteRound = async (roundNumber: number) => {
    try {
      await completeRoundMutation.mutateAsync(roundNumber);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to complete round');
    }
  };

  const handleRepairRound = async (roundNumber: number) => {
    try {
      await repairRoundMutation.mutateAsync(roundNumber);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to re-pair round');
    }
  };

  const handleDropTeam = async (team: EventTeam) => {
    setDroppingTeamId(team.id);
    try {
      await dropTeamMutation.mutateAsync(team.id);
      setConfirmDropTeam(null);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error as Error) || 'Failed to drop team');
    } finally {
      setDroppingTeamId(null);
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft': return theme.icon;
      case 'registration_open': return theme.success;
      case 'registration_closed': return theme.warning;
      case 'in_progress': return theme.tint;
      case 'completed': return theme.info;
      default: return theme.text;
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'registration_open': return 'Registration Open';
      case 'registration_closed': return 'Registration Closed';
      case 'in_progress': return 'Active';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getRoundStatusColor = (status: RoundStatus, themeColors: typeof theme) => {
    switch (status) {
      case 'pending': return themeColors.icon;
      case 'pairing_in_progress': return themeColors.warning;
      case 'in_progress': return themeColors.tint;
      case 'completed': return themeColors.success;
      default: return themeColors.text;
    }
  };

  const getRoundStatusLabel = (status: RoundStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'pairing_in_progress': return 'Pairing...';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Event Details Section */}
      <View style={[styles.section, { backgroundColor: theme.secondary }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Event Details</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => setEditModalVisible(true)}
        >
          <ThemedText style={styles.buttonText}>Edit Event Details</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: event.hideLists ? theme.success : theme.warning }]}
          onPress={() => onUpdateEvent({ hideLists: !event.hideLists })}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {event.hideLists ? 'Show Army Lists' : 'Hide Army Lists'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.error }]}
          onPress={() => setConfirmDeleteVisible(true)}
        >
          <ThemedText style={styles.buttonText}>Delete Event</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Event Lifecycle Section */}
      <View style={[styles.section, { backgroundColor: theme.secondary }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Event Lifecycle</ThemedText>
        <View style={styles.statusRow}>
          <ThemedText style={styles.statusText}>Status: </ThemedText>
          <ThemedText style={{ color: getStatusColor(eventStatus), fontWeight: '600' }}>
            {getStatusLabel(eventStatus)}
          </ThemedText>
          {currentRound > 0 && (
            <ThemedText style={styles.statusText}> • Round {currentRound}</ThemedText>
          )}
        </View>
        
        <View style={styles.lifecycleButtons}>
          {/* Open Registration - only in draft */}
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: eventStatus === 'draft' ? theme.success : hexToRgba(theme.success, 0.3) }
            ]}
            onPress={handleOpenRegistration}
            disabled={eventStatus !== 'draft' || isLoading}
          >
            <ThemedText style={styles.buttonText}>Open Registration</ThemedText>
          </TouchableOpacity>

          {/* Close Registration - only when registration is open */}
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: eventStatus === 'registration_open' ? theme.warning : hexToRgba(theme.warning, 0.3) }
            ]}
            onPress={handleCloseRegistration}
            disabled={eventStatus !== 'registration_open' || isLoading}
          >
            <ThemedText style={styles.buttonText}>Close Registration</ThemedText>
          </TouchableOpacity>
          
          {/* Start Event - only when registration is closed */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: eventStatus === 'registration_closed' ? theme.tint : hexToRgba(theme.tint, 0.3) }
            ]}
            onPress={handleStartEvent}
            disabled={eventStatus !== 'registration_closed' || isLoading}
          >
            <ThemedText style={styles.buttonText}>Start Event</ThemedText>
          </TouchableOpacity>

          {/* Complete Event - only when in_progress and all rounds completed */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: allRoundsCompleted ? theme.success : hexToRgba(theme.success, 0.3) }
            ]}
            onPress={handleCompleteEvent}
            disabled={!allRoundsCompleted || isLoading}
          >
            <ThemedText style={styles.buttonText}>Complete Event</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Round Management Section */}
      <View style={[styles.section, { backgroundColor: theme.secondary }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Round Management</ThemedText>
        <ThemedText style={styles.infoText}>
          Total Rounds: {event.rounds} • Current Round: {currentRound}
        </ThemedText>

        {eventStateQuery.isLoading && (
          <ActivityIndicator size="small" color={theme.tint} style={{ marginVertical: 12 }} />
        )}

        {/* Generated Rounds */}
        {sortedRounds.map((round: RoundDto) => {
          const canStart = round.status === 'pending';
          const canComplete = round.status === 'in_progress';
          const canRepair = round.hasPairings;
          
          return (
            <View key={round.roundNumber} style={[styles.roundCard, { borderColor: theme.icon }]}>
              <View style={styles.roundHeader}>
                <ThemedText style={styles.roundTitle}>Round {round.roundNumber}</ThemedText>
                <ThemedText style={[styles.roundStatus, { color: getRoundStatusColor(round.status, theme) }]}>
                  {getRoundStatusLabel(round.status)}
                </ThemedText>
              </View>
              <View style={styles.roundButtons}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: canStart ? theme.success : hexToRgba(theme.success, 0.3) }]}
                  onPress={() => handleStartRound(round.roundNumber)}
                  disabled={!canStart || isLoading}
                >
                  <ThemedText style={styles.smallButtonText}>Start</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: canComplete ? theme.warning : hexToRgba(theme.warning, 0.3) }]}
                  onPress={() => handleCompleteRound(round.roundNumber)}
                  disabled={!canComplete || isLoading}
                >
                  <ThemedText style={styles.smallButtonText}>Complete</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: canRepair ? theme.error : hexToRgba(theme.error, 0.3) }]}
                  onPress={() => handleRepairRound(round.roundNumber)}
                  disabled={!canRepair || isLoading}
                >
                  <ThemedText style={styles.smallButtonText}>Re-pair</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Generate Next Round Pairings */}
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: canGenerateNextRound ? theme.info : hexToRgba(theme.info, 0.3) }
          ]}
          onPress={handleGeneratePairings}
          disabled={!canGenerateNextRound || isLoading}
        >
          <ThemedText style={styles.buttonText}>Generate Next Round Pairings</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Attendee Management Section */}
      <View style={[styles.section, { backgroundColor: theme.secondary }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Attendee Management</ThemedText>
        <ThemedText style={styles.infoText}>
          Teams: {event.numberOfRegisteredTeams}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} | Players: {event.numberOfRegisteredPlayers}
        </ThemedText>

        {/* Registered Teams List */}
        {event.registeredTeams?.map((team) => (
          <View key={team.id} style={[styles.teamCard, { borderColor: hexToRgba(theme.text, 0.15) }]}>
            <View style={styles.teamRow}>
              <Image
                source={
                  team.logoUrl
                    ? { uri: team.logoUrl }
                    : require('@/assets/images/emoji2.png')
                }
                style={styles.teamLogo}
              />
              <View style={styles.teamInfo}>
                <ThemedText style={styles.teamName}>{team.teamName}</ThemedText>
                <ThemedText style={styles.teamPlayers}>
                  {team.users.length} player{team.users.length !== 1 ? 's' : ''}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.dropButton, { backgroundColor: theme.error }]}
                onPress={() => setConfirmDropTeam(team)}
                disabled={droppingTeamId === team.id}
              >
                {droppingTeamId === team.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.dropButtonText}>Drop</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {(!event.registeredTeams || event.registeredTeams.length === 0) && (
          <ThemedText style={[styles.infoText, { opacity: 0.5 }]}>No teams registered</ThemedText>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.info }]}
          onPress={() => {/* TODO: Open scores management */}}
        >
          <ThemedText style={styles.buttonText}>Manage Scores</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.warning }]}
          onPress={() => {/* TODO: Open penalties management */}}
        >
          <ThemedText style={styles.buttonText}>Manage Penalties</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Edit Event Modal */}
      <EditEventModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onUpdate={async () => {
          await onUpdateEvent();
          setEditModalVisible(false);
        }}
        editedEvent={editedEvent}
        setEditedEvent={setEditedEvent}
        theme={theme}
        loading={actionLoading}
        error={getErrorMessage(actionError)}
        eventId={event.id}
        numberOfRounds={event.rounds}
        playersPerTeam={event.eventType?.playersPerTeam}
      />

      {/* Drop Team Confirmation */}
      {confirmDropTeam && (
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: theme.secondary }]}>
            <ThemedText type="subtitle">Drop Team?</ThemedText>
            <ThemedText style={styles.confirmText}>
              Drop {confirmDropTeam.teamName} from this event? The team and all its members will be removed.
            </ThemedText>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { borderColor: theme.tint }]}
                onPress={() => setConfirmDropTeam(null)}
              >
                <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.error }]}
                onPress={() => handleDropTeam(confirmDropTeam)}
              >
                <ThemedText style={styles.buttonText}>Drop Team</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteVisible && (
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: theme.secondary }]}>
            <ThemedText type="subtitle">Delete Event?</ThemedText>
            <ThemedText style={styles.confirmText}>
              This action cannot be undone.
            </ThemedText>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { borderColor: theme.tint }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.error }]}
                onPress={async () => {
                  await onDeleteEvent();
                  setConfirmDeleteVisible(false);
                }}
              >
                <ThemedText style={styles.buttonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusText: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginBottom: 12,
    opacity: 0.8,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  lifecycleButtons: {
    gap: 8,
  },
  roundCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundTitle: {
    fontWeight: '600',
  },
  roundStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  roundButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  confirmText: {
    marginVertical: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  teamCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontWeight: '600',
    fontSize: 14,
  },
  teamPlayers: {
    fontSize: 12,
    opacity: 0.7,
  },
  dropButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  dropButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
