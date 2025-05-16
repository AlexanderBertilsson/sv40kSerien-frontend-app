import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { useTeam } from '@/hooks/useTeam';

interface JoinTeamEventModalProps {
  visible: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onJoin: (playerIds: string[]) => void;
  eventType: '8man' | '5man';
  theme: any;
  loading: boolean;
  error: string | null;
  teamId: string;
}


const JoinTeamEventModal = ({ 
  visible, 
  onClose, 
  onJoin, 
  eventType, 
  theme, 
  loading, 
  error,
  teamId 
}: JoinTeamEventModalProps) => {
  const { playersQuery: { data: players } } = useTeam(teamId);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      const playerLimit = eventType === '8man' ? 8 : 5;
      const currentPlayers = selectedPlayers.length;
      if (currentPlayers < playerLimit) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };

  // const isPlayerSelected = (playerId: string) => selectedPlayers.includes(playerId);

  const getPlayerCount = () => players?.length || 0;

  const getRequiredPlayers = () => eventType === '5man' ? 5 : 8;

  const canSubmit = () => selectedPlayers.length === getRequiredPlayers();

  const handleSubmit = () => {
    if (canSubmit()) {
      onJoin(selectedPlayers);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
          <ThemedText type="title">Join Team Event</ThemedText>
          <View style={styles.formContainer}>
            <ThemedText type="subtitle">
              Select {getRequiredPlayers()} players for this {eventType} event
            </ThemedText>
            {getPlayerCount() < getRequiredPlayers() && (
              <ThemedText style={styles.errorText}>
                Warning: Your team only has {getPlayerCount()} players. You need {getRequiredPlayers()} players for this event.
              </ThemedText>
            )}
            <ScrollView style={styles.scrollView}>
            {players?.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerItem,
                    { 
                      backgroundColor: selectedPlayers.includes(player.id) ? theme.tint : theme.background,
                    }
                  ]}
                  onPress={() => togglePlayerSelection(player.id)}
                  disabled={player.role !== 'player'}
                >
                  <ThemedText style={{ 
                    color: selectedPlayers.includes(player.id) ? '#fff' : theme.text,
                    opacity: player.role === 'player' ? 1 : 0.5
                  }}>
                    {player.username} ({player.role})
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCreate, { backgroundColor: theme.tint }]}
              onPress={handleSubmit}
              disabled={loading || !canSubmit()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={{ color: '#fff' }}>Join</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  formContainer: {
    width: '100%',
    marginVertical: 16,
  },
  scrollView: {
    width: '100%',
    maxHeight: 300,
    marginVertical: 10,
  },
  playerItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonCreate: {
    borderWidth: 0,
  },
});

export default JoinTeamEventModal;
