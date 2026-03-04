import { useState, useMemo, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { Colors, hexToRgba } from '../../constants/Colors';
import { useSubmitPairings } from '../../hooks/useEventState';
import { EventTeam } from '../../../types/Event';
import { PlayerRole, GamePairingRequest, SubmitPairingsRequest, RoundConfigDto, LayoutOptionDto } from '../../../types/EventAdmin';
import { FactionIcon } from '../FactionIcon';

interface PairingsModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  teamMatchId: string;
  team1: EventTeam | null;
  team2: EventTeam | null;
  onStartPairings?: () => void;
  hasRoundConfig?: boolean;
  roundConfig?: RoundConfigDto | null;
}

interface GamePairing {
  player1Id: string | null;
  player1Role: PlayerRole;
  player2Id: string | null;
  player2Role: PlayerRole;
  layoutId: string | null;
  missionId: number | null;
}

type ModalView = 'options' | 'manual';

export function PairingsModal({
  visible,
  onClose,
  eventId,
  teamMatchId,
  team1,
  team2,
  onStartPairings,
  hasRoundConfig = true,
  roundConfig,
}: PairingsModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [currentView, setCurrentView] = useState<ModalView>('options');
  const { submitPairingsMutation } = useSubmitPairings(eventId, teamMatchId);

  // Check if all players have army lists
  const playersWithoutArmyList = useMemo(() => {
    const missing: string[] = [];
    team1?.users?.forEach(u => { if (!u.armyId) missing.push(u.username); });
    team2?.users?.forEach(u => { if (!u.armyId) missing.push(u.username); });
    return missing;
  }, [team1, team2]);

  const canStartPairings = hasRoundConfig && playersWithoutArmyList.length === 0;

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
      const defaultMissionId = roundConfig?.primaryMission?.id ?? null;
      setGamePairings(
        Array.from({ length: numberOfGames }, () => ({
          player1Id: null,
          player1Role: 'Attacker' as PlayerRole,
          player2Id: null,
          player2Role: 'Defender' as PlayerRole,
          layoutId: null,
          missionId: defaultMissionId,
        }))
      );
    }
  }, [visible, numberOfGames, roundConfig]);

  // Get available players (not yet selected in other games)
  const getAvailablePlayers = (teamUsers: EventTeam['users'], gameIndex: number, isTeam1: boolean) => {
    const selectedPlayerIds = gamePairings
      .filter((_, idx) => idx !== gameIndex)
      .map(g => isTeam1 ? g.player1Id : g.player2Id)
      .filter(Boolean);
    
    return teamUsers.filter(user => !selectedPlayerIds.includes(user.id));
  };

  const updateGamePairing = (gameIndex: number, field: keyof GamePairing, value: string | number | PlayerRole | null) => {
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

    const pairings: GamePairingRequest[] = gamePairings.map(game => ({
      sides: [
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
      missionId: game.missionId,
      layoutId: game.layoutId,
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

      {!hasRoundConfig && (
        <View style={[styles.warningBanner, { backgroundColor: hexToRgba(theme.warning, 0.15) }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.warning} />
          <ThemedText style={[styles.warningText, { color: theme.warning }]}>
            No round configuration set for this round.
          </ThemedText>
        </View>
      )}

      {playersWithoutArmyList.length > 0 && (
        <View style={[styles.warningBanner, { backgroundColor: hexToRgba(theme.warning, 0.15) }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.warning} />
          <ThemedText style={[styles.warningText, { color: theme.warning }]}>
            Missing army lists: {playersWithoutArmyList.join(', ')}
          </ThemedText>
        </View>
      )}

      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: canStartPairings ? theme.tint : hexToRgba(theme.tint, 0.3) }]}
        onPress={() => setCurrentView('manual')}
        disabled={!canStartPairings}
      >
        <MaterialCommunityIcons name="account-group" size={32} color="#fff" />
        <ThemedText style={styles.optionButtonText}>Manual Pairings</ThemedText>
        <ThemedText style={styles.optionButtonSubtext}>
          Select players and roles manually
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: canStartPairings ? theme.tint : hexToRgba(theme.tint, 0.3) }]}
        onPress={() => {
          handleClose();
          onStartPairings?.();
        }}
        disabled={!canStartPairings}
      >
        <MaterialCommunityIcons name="shuffle-variant" size={32} color="#fff" />
        <ThemedText style={styles.optionButtonText}>Start Pairings</ThemedText>
        <ThemedText style={styles.optionButtonSubtext}>
          WTC-style pairing process
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
                  <View style={styles.factionRow}>
                    <FactionIcon faction={player.faction} size={12} color={theme.text} style={{ opacity: 0.7 }} />
                    <ThemedText style={styles.playerFaction} numberOfLines={1}>
                      {player.faction}
                    </ThemedText>
                  </View>
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

  const renderLayoutSelector = (gameIndex: number) => {
    const layouts = roundConfig?.layouts;
    if (!layouts || layouts.length === 0) return null;

    const selectedLayoutId = gamePairings[gameIndex].layoutId;

    return (
      <View style={styles.layoutSelectorContainer}>
        <ThemedText style={styles.selectorLabel}>Layout</ThemedText>
        <View style={styles.layoutOptions}>
          {layouts.map((layout: LayoutOptionDto) => {
            const isSelected = selectedLayoutId === layout.id;
            return (
              <TouchableOpacity
                key={layout.id}
                style={[
                  styles.layoutOption,
                  {
                    backgroundColor: isSelected ? hexToRgba(theme.tint, 0.3) : theme.background,
                    borderColor: isSelected ? theme.tint : 'transparent',
                  },
                ]}
                onPress={() => updateGamePairing(gameIndex, 'layoutId', isSelected ? null : layout.id)}
              >
                {layout.imageUrl ? (
                  <Image source={{ uri: layout.imageUrl }} style={styles.layoutImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.layoutImagePlaceholder, { backgroundColor: hexToRgba(theme.text, 0.1) }]}>
                    <MaterialCommunityIcons name="map" size={20} color={theme.text} />
                  </View>
                )}
                <ThemedText style={styles.layoutName} numberOfLines={2}>
                  {layout.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
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

        {roundConfig?.primaryMission && (
          <View style={[styles.missionBanner, { backgroundColor: hexToRgba(theme.tint, 0.15) }]}>
            <MaterialCommunityIcons name="target" size={16} color={theme.tint} />
            <ThemedText style={styles.missionBannerText}>
              Mission: {roundConfig.primaryMission.name}
            </ThemedText>
          </View>
        )}

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

              {renderLayoutSelector(index)}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
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
  factionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  missionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  missionBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  layoutSelectorContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  layoutOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  layoutOption: {
    width: 80,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  layoutImage: {
    width: '100%',
    height: 60,
  },
  layoutImagePlaceholder: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layoutName: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    padding: 4,
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
