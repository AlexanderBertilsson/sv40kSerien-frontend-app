import { useState, useMemo, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { Colors, hexToRgba } from '../../constants/Colors';
import { useSubmitPairings } from '../../hooks/useEventState';
import { EventTeam } from '../../../types/Event';
import { PlayerRole, PairingRequest, SubmitPairingsRequest } from '../../../types/EventAdmin';

interface PairingsModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  teamMatchId: string;
  team1: EventTeam | null;
  team2: EventTeam | null;
}

interface GamePairing {
  player1Id: string | null;
  player1Role: PlayerRole;
  player2Id: string | null;
  player2Role: PlayerRole;
}

type ModalView = 'options' | 'manual';

export function PairingsModal({ 
  visible, 
  onClose, 
  eventId, 
  teamMatchId,
  team1,
  team2,
}: PairingsModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [currentView, setCurrentView] = useState<ModalView>('options');
  const { submitPairingsMutation } = useSubmitPairings(eventId, teamMatchId);

  // Calculate number of games from the smaller team's roster
  const numberOfGames = useMemo(() => {
    const team1Size = team1?.users?.length || 0;
    const team2Size = team2?.users?.length || 0;
    return Math.min(team1Size, team2Size);
  }, [team1, team2]);

  // Initialize game pairings based on team roster size
  const [gamePairings, setGamePairings] = useState<GamePairing[]>([]);

  // Reset game pairings when modal opens or number of games changes
  useEffect(() => {
    if (visible && numberOfGames > 0) {
      setGamePairings(
        Array.from({ length: numberOfGames }, () => ({
          player1Id: null,
          player1Role: 'Attacker' as PlayerRole,
          player2Id: null,
          player2Role: 'Defender' as PlayerRole,
        }))
      );
    }
  }, [visible, numberOfGames]);

  // Get available players (not yet selected in other games)
  const getAvailablePlayers = (teamUsers: EventTeam['users'], gameIndex: number, isTeam1: boolean) => {
    const selectedPlayerIds = gamePairings
      .filter((_, idx) => idx !== gameIndex)
      .map(g => isTeam1 ? g.player1Id : g.player2Id)
      .filter(Boolean);
    
    return teamUsers.filter(user => !selectedPlayerIds.includes(user.id));
  };

  const updateGamePairing = (gameIndex: number, field: keyof GamePairing, value: string | PlayerRole | null) => {
    setGamePairings(prev => {
      const updated = [...prev];
      updated[gameIndex] = { ...updated[gameIndex], [field]: value };
      
      // If changing role, swap the other player's role
      if (field === 'player1Role') {
        updated[gameIndex].player2Role = value === 'Attacker' ? 'Defender' : 'Attacker';
      } else if (field === 'player2Role') {
        updated[gameIndex].player1Role = value === 'Attacker' ? 'Defender' : 'Attacker';
      }
      
      return updated;
    });
  };

  const isFormValid = useMemo(() => {
    return gamePairings.every(g => g.player1Id && g.player2Id);
  }, [gamePairings]);

  const handleSubmit = async () => {
    if (!team1 || !team2 || !isFormValid) return;

    const pairings: PairingRequest[] = gamePairings.map(game => ({
      games: [
        {
          team: team1.id,
          player: game.player1Id!,
          role: game.player1Role,
        },
        {
          team: team2.id,
          player: game.player2Id!,
          role: game.player2Role,
        },
      ],
    }));

    const request: SubmitPairingsRequest = { pairings };

    try {
      await submitPairingsMutation.mutateAsync(request);
      handleClose();
    } catch (error) {
      console.error('Failed to submit pairings:', error);
    }
  };

  const handleClose = () => {
    setCurrentView('options');
    setGamePairings([]);
    onClose();
  };

  const renderOptionsView = () => (
    <View style={styles.optionsContainer}>
      <ThemedText style={styles.optionsTitle}>Choose Pairing Method</ThemedText>
      
      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: theme.tint }]}
        onPress={() => setCurrentView('manual')}
      >
        <MaterialCommunityIcons name="account-group" size={32} color="#fff" />
        <ThemedText style={styles.optionButtonText}>Manual Pairings</ThemedText>
        <ThemedText style={styles.optionButtonSubtext}>
          Select players and roles manually
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: hexToRgba(theme.icon, 0.5) }]}
        disabled
      >
        <MaterialCommunityIcons name="shuffle-variant" size={32} color={theme.text} style={{ opacity: 0.5 }} />
        <ThemedText style={[styles.optionButtonText, { opacity: 0.5 }]}>Start Pairings</ThemedText>
        <ThemedText style={[styles.optionButtonSubtext, { opacity: 0.5 }]}>
          Coming soon
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderPlayerSelector = (
    gameIndex: number,
    teamUsers: EventTeam['users'],
    selectedPlayerId: string | null,
    isTeam1: boolean,
    teamName: string
  ) => {
    const availablePlayers = getAvailablePlayers(teamUsers, gameIndex, isTeam1);
    const fieldName = isTeam1 ? 'player1Id' : 'player2Id';

    return (
      <View style={styles.playerSelectorContainer}>
        <ThemedText style={styles.teamLabel}>{teamName}</ThemedText>
        <View style={styles.playerOptions}>
          {availablePlayers.map(player => {
            const isSelected = selectedPlayerId === player.id;
            return (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerOption,
                  { 
                    backgroundColor: isSelected ? hexToRgba(theme.tint, 0.3) : theme.secondary,
                    borderColor: isSelected ? theme.tint : 'transparent',
                  }
                ]}
                onPress={() => updateGamePairing(gameIndex, fieldName, player.id)}
              >
                <ThemedText style={styles.playerName} numberOfLines={1}>
                  {player.username}
                </ThemedText>
                {player.faction && (
                  <ThemedText style={styles.playerFaction} numberOfLines={1}>
                    {player.faction}
                  </ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRoleSelector = (gameIndex: number, isTeam1: boolean) => {
    const role = isTeam1 ? gamePairings[gameIndex].player1Role : gamePairings[gameIndex].player2Role;
    const fieldName = isTeam1 ? 'player1Role' : 'player2Role';

    return (
      <View style={styles.roleSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            { 
              backgroundColor: role === 'Attacker' ? theme.error : theme.secondary,
              borderColor: role === 'Attacker' ? theme.error : 'transparent',
            }
          ]}
          onPress={() => updateGamePairing(gameIndex, fieldName, 'Attacker')}
        >
          <MaterialCommunityIcons 
            name="sword" 
            size={16} 
            color={role === 'Attacker' ? '#fff' : theme.text} 
          />
          <ThemedText style={[styles.roleText, role === 'Attacker' && { color: '#fff' }]}>
            ATK
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            { 
              backgroundColor: role === 'Defender' ? theme.info : theme.secondary,
              borderColor: role === 'Defender' ? theme.info : 'transparent',
            }
          ]}
          onPress={() => updateGamePairing(gameIndex, fieldName, 'Defender')}
        >
          <MaterialCommunityIcons 
            name="shield" 
            size={16} 
            color={role === 'Defender' ? '#fff' : theme.text} 
          />
          <ThemedText style={[styles.roleText, role === 'Defender' && { color: '#fff' }]}>
            DEF
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderManualPairingsView = () => {
    if (!team1 || !team2) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText>Team data not available</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.manualContainer}>
        <View style={styles.manualHeader}>
          <TouchableOpacity onPress={() => setCurrentView('options')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.manualTitle}>Manual Pairings</ThemedText>
        </View>

        <ScrollView style={styles.gamesScrollView} showsVerticalScrollIndicator={false}>
          {gamePairings.map((game, index) => (
            <View key={index} style={[styles.gameCard, { backgroundColor: theme.secondary }]}>
              <ThemedText style={styles.gameTitle}>Game {index + 1}</ThemedText>
              
              <View style={styles.gameRow}>
                {/* Team 1 Player Selection */}
                <View style={styles.teamColumn}>
                  {renderPlayerSelector(index, team1.users, game.player1Id, true, team1.teamName)}
                  {renderRoleSelector(index, true)}
                </View>

                <View style={styles.vsContainer}>
                  <MaterialCommunityIcons name="sword-cross" size={24} color={theme.tint} />
                </View>

                {/* Team 2 Player Selection */}
                <View style={styles.teamColumn}>
                  {renderPlayerSelector(index, team2.users, game.player2Id, false, team2.teamName)}
                  {renderRoleSelector(index, false)}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isFormValid ? theme.success : hexToRgba(theme.success, 0.3) }
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || submitPairingsMutation.isPending}
        >
          {submitPairingsMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Pairings</ThemedText>
          )}
        </TouchableOpacity>

        {submitPairingsMutation.isError && (
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to submit pairings. Please try again.
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable 
        style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        onPress={handleClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Game Pairings</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            {currentView === 'options' ? renderOptionsView() : renderManualPairingsView()}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    maxWidth: 700,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    flex: 1,
  },
  optionsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  optionButton: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  manualContainer: {
    flex: 1,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  gamesScrollView: {
    flex: 1,
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamColumn: {
    flex: 1,
  },
  vsContainer: {
    paddingHorizontal: 12,
    paddingTop: 40,
    alignItems: 'center',
  },
  playerSelectorContainer: {
    marginBottom: 8,
  },
  teamLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  playerOptions: {
    gap: 6,
  },
  playerOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  playerFaction: {
    fontSize: 12,
    opacity: 0.7,
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PairingsModal;
