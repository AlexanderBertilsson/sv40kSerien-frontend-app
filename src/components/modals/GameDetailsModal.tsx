import { useState, useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput, Image, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { Colors, hexToRgba } from '../../constants/Colors';
import { useReportGameScore } from '../../hooks/useEventState';
import { MatchGame } from '../match/MatchCard';
import { ReportScoreRequest } from '../../../types/EventAdmin';

interface GameDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  game: MatchGame | null;
  currentUserId?: string | null;
}

export function GameDetailsModal({ 
  visible, 
  onClose, 
  eventId,
  game,
  currentUserId,
}: GameDetailsModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { reportScoreMutation } = useReportGameScore(eventId, game?.id || '');

  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  // Check if current user is a player in this game
  const isPlayer = useMemo(() => {
    if (!currentUserId || !game) return false;
    return game.player1Id === currentUserId || game.player2Id === currentUserId;
  }, [currentUserId, game]);

  // Check if score has been reported (differential score is not 0-0)
  const hasReportedScore = useMemo(() => {
    if (!game) return false;
    return (game.player1DifferentialScore !== 0 || game.player2DifferentialScore !== 0);
  }, [game]);

  const canReportScore = isPlayer && !hasReportedScore;

  const handleSubmitScore = async () => {
    if (!game || !game.player1Id || !game.player2Id) return;

    const p1Score = parseInt(player1Score, 10);
    const p2Score = parseInt(player2Score, 10);

    if (isNaN(p1Score) || isNaN(p2Score)) return;

    const request: ReportScoreRequest = {
      results: [
        { playerId: game.player1Id, score: p1Score },
        { playerId: game.player2Id, score: p2Score },
      ],
    };

    try {
      await reportScoreMutation.mutateAsync(request);
      handleClose();
    } catch (error) {
      console.error('Failed to report score:', error);
    }
  };

  const handleClose = () => {
    setPlayer1Score('');
    setPlayer2Score('');
    onClose();
  };

  const isFormValid = useMemo(() => {
    const p1 = parseInt(player1Score, 10);
    const p2 = parseInt(player2Score, 10);
    return !isNaN(p1) && !isNaN(p2) && p1 >= 0 && p2 >= 0;
  }, [player1Score, player2Score]);

  const getRoleIcon = (role?: string | null) => {
    if (role === 'Attacker') return 'sword';
    if (role === 'Defender') return 'shield';
    return null;
  };

  const getRoleColor = (role?: string | null) => {
    if (role === 'Attacker') return theme.error;
    if (role === 'Defender') return theme.info;
    return theme.text;
  };

  const formatDeployment = (deployment: string) => {
    return deployment
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!game) return null;

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
            <ThemedText style={styles.modalTitle}>Game Details</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Mission Info */}
            {(game.missionName || game.deployment || game.layout) && (
              <View style={[styles.missionSection, { backgroundColor: theme.secondary }]}>
                {game.missionName && (
                  <View style={styles.missionRow}>
                    <MaterialCommunityIcons name="flag" size={18} color={theme.tint} />
                    <ThemedText style={styles.missionText}>{game.missionName}</ThemedText>
                  </View>
                )}
                {game.deployment && (
                  <View style={styles.missionRow}>
                    <MaterialCommunityIcons name="map" size={18} color={theme.tint} />
                    <ThemedText style={styles.missionText}>{formatDeployment(game.deployment)}</ThemedText>
                  </View>
                )}
                {game.layout?.imageUrl && (
                  <View style={styles.layoutImageContainer}>
                    <ThemedText style={styles.layoutLabel}>{game.layout.name}</ThemedText>
                    <Image
                      source={{ uri: game.layout.imageUrl }}
                      style={styles.layoutImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Player 1 */}
            <View style={[styles.playerSection, { backgroundColor: theme.secondary }]}>
              <View style={styles.playerHeader}>
                <ThemedText style={styles.playerName}>{game.player1Name || 'Player 1'}</ThemedText>
                {getRoleIcon(game.player1Faction) && (
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(game.player1Faction) }]}>
                    <MaterialCommunityIcons 
                      name={getRoleIcon(game.player1Faction) as any} 
                      size={14} 
                      color="#fff" 
                    />
                    <ThemedText style={styles.roleText}>{game.player1Faction}</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <ThemedText style={styles.scoreLabel}>Score</ThemedText>
                  <ThemedText style={styles.scoreValue}>{game.player1Score}</ThemedText>
                </View>
                <View style={styles.scoreItem}>
                  <ThemedText style={styles.scoreLabel}>Differential</ThemedText>
                  <ThemedText style={[
                    styles.scoreValue,
                    { color: (game.player1DifferentialScore || 0) > (game.player2DifferentialScore || 0) ? theme.success :
                             (game.player1DifferentialScore || 0) < (game.player2DifferentialScore || 0) ? theme.error : theme.info }
                  ]}>
                    {(game.player1DifferentialScore || 0) > 0 ? '+' : ''}{game.player1DifferentialScore || 0}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* VS Divider */}
            <View style={styles.vsDivider}>
              <MaterialCommunityIcons name="sword-cross" size={24} color={theme.tint} />
            </View>

            {/* Player 2 */}
            <View style={[styles.playerSection, { backgroundColor: theme.secondary }]}>
              <View style={styles.playerHeader}>
                <ThemedText style={styles.playerName}>{game.player2Name || 'Player 2'}</ThemedText>
                {getRoleIcon(game.player2Faction) && (
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(game.player2Faction) }]}>
                    <MaterialCommunityIcons 
                      name={getRoleIcon(game.player2Faction) as any} 
                      size={14} 
                      color="#fff" 
                    />
                    <ThemedText style={styles.roleText}>{game.player2Faction}</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <ThemedText style={styles.scoreLabel}>Score</ThemedText>
                  <ThemedText style={styles.scoreValue}>{game.player2Score}</ThemedText>
                </View>
                <View style={styles.scoreItem}>
                  <ThemedText style={styles.scoreLabel}>Differential</ThemedText>
                  <ThemedText style={[
                    styles.scoreValue,
                    { color: (game.player2DifferentialScore || 0) > (game.player1DifferentialScore || 0) ? theme.success :
                             (game.player2DifferentialScore || 0) < (game.player1DifferentialScore || 0) ? theme.error : theme.info }
                  ]}>
                    {(game.player2DifferentialScore || 0) > 0 ? '+' : ''}{game.player2DifferentialScore || 0}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Score Status */}
            {!hasReportedScore && (
              <View style={[styles.statusBadge, { backgroundColor: hexToRgba(theme.warning, 0.2) }]}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={theme.warning} />
                <ThemedText style={[styles.statusText, { color: theme.warning }]}>
                  Score not yet reported
                </ThemedText>
              </View>
            )}

            {/* Report Score Form */}
            {canReportScore && (
              <View style={styles.reportSection}>
                <ThemedText style={styles.reportTitle}>Report Score</ThemedText>
                
                <View style={styles.scoreInputRow}>
                  <View style={styles.scoreInputContainer}>
                    <ThemedText style={styles.inputLabel}>{game.player1Name}</ThemedText>
                    <TextInput
                      style={[styles.scoreInput, { 
                        backgroundColor: theme.secondary, 
                        color: theme.text,
                        borderColor: theme.icon,
                      }]}
                      value={player1Score}
                      onChangeText={setPlayer1Score}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.icon}
                    />
                  </View>
                  
                  <ThemedText style={styles.scoreDash}>-</ThemedText>
                  
                  <View style={styles.scoreInputContainer}>
                    <ThemedText style={styles.inputLabel}>{game.player2Name}</ThemedText>
                    <TextInput
                      style={[styles.scoreInput, { 
                        backgroundColor: theme.secondary, 
                        color: theme.text,
                        borderColor: theme.icon,
                      }]}
                      value={player2Score}
                      onChangeText={setPlayer2Score}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.icon}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: isFormValid ? theme.success : hexToRgba(theme.success, 0.3) }
                  ]}
                  onPress={handleSubmitScore}
                  disabled={!isFormValid || reportScoreMutation.isPending}
                >
                  {reportScoreMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Submit Score</ThemedText>
                  )}
                </TouchableOpacity>

                {reportScoreMutation.isError && (
                  <ThemedText style={[styles.errorText, { color: theme.error }]}>
                    Failed to submit score. Please try again.
                  </ThemedText>
                )}
              </View>
            )}
          </ScrollView>
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
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
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
    flexGrow: 0,
  },
  missionSection: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  missionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  layoutImageContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  layoutLabel: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 8,
  },
  layoutImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  playerSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  scoreItem: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsDivider: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  scoreInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  scoreInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  scoreDash: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 12,
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
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default GameDetailsModal;
