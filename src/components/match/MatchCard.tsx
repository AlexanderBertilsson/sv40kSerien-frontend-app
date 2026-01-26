import { useState } from 'react';
import { View, StyleSheet, Pressable, Image, useWindowDimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';

export interface MatchPlayer {
  id: string;
  name: string;
  profileImage?: string;
  faction?: string;
  armyListUrl?: string;
}

export interface MatchGame {
  id?: string;
  player1Id?: string;
  player1Name?: string;
  player1ArmyListId?: string;
  player1Faction?: string | null;
  player1Score: number;
  player1DifferentialScore?: number;
  player2Id?: string;
  player2Name?: string;
  player2ArmyListId?: string;
  player2Faction?: string | null;
  player2Score: number;
  player2DifferentialScore?: number;
  missionName?: string | null;
  deployment?: string | null;
  winnerId?: string | null;
}

export interface MatchTeam {
  id?: string;
  name: string;
  logo?: string;
  players?: MatchPlayer[];
  score?: number;
}

export interface MatchData {
  id: string;
  date?: string;
  event?: string;
  team1: MatchTeam;
  team2?: MatchTeam | null;
  team1Score: number;
  team2Score: number;
  isBye?: boolean;
  isCompleted?: boolean;
  isDraw?: boolean;
  winnerId?: string | null;
  games?: MatchGame[];
  primaryMission?: string;
  deploymentMap?: string;
  missionRules?: string[];
}

interface MatchCardProps {
  match: MatchData;
  isHighlighted?: boolean;
  expandable?: boolean;
  onArmyListPress?: (armyListUrl: string) => void;
  onPress?: () => void;
  onGamePress?: (game: MatchGame) => void;
  showConfirmButton?: boolean;
  onConfirmResult?: () => void;
  isConfirming?: boolean;
}

export function MatchCard({ 
  match, 
  isHighlighted = false, 
  expandable = false,
  onArmyListPress,
  onPress,
  onGamePress,
  showConfirmButton = false,
  onConfirmResult,
  isConfirming = false,
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const getScoreColor = (score1: number, score2: number) => {
    if (score1 > score2) return theme.success;
    if (score1 < score2) return theme.error;
    return theme.text;
  };

  const hasExpandedContent = expandable && (
    match.games?.length || 
    match.primaryMission || 
    match.deploymentMap || 
    match.missionRules?.length
  );

  const handlePress = () => {
    if (hasExpandedContent) {
      setIsExpanded(!isExpanded);
    } else if (onPress) {
      onPress();
    }
  };

  const renderTeamLogo = (team: MatchTeam | null | undefined, fallbackChar?: string) => {
    if (team?.logo) {
      return <Image source={{ uri: team.logo }} style={styles.teamLogo} />;
    }
    return (
      <View style={[styles.teamLogoPlaceholder, { backgroundColor: theme.icon }]}>
        <ThemedText style={styles.teamLogoText}>
          {fallbackChar || team?.name?.charAt(0) || '?'}
        </ThemedText>
      </View>
    );
  };

  return (
    <Pressable
      style={[
        styles.matchCard,
        { 
          backgroundColor: isHighlighted ? hexToRgba(theme.tint, 0.15) : theme.secondary,
          borderColor: isHighlighted ? theme.tint : 'transparent',
        }
      ]}
      onPress={handlePress}
      disabled={!hasExpandedContent && !onPress}
    >
      {/* Main Match Header - Teams and Score */}
      <View style={styles.matchHeader}>
        <View style={[styles.teamsInfo, isMobile && styles.teamsInfoMobile]}>
          {renderTeamLogo(match.team1)}
          <ThemedText 
            style={[
              styles.teamName, 
              isMobile && styles.teamNameMobile,
              match.winnerId === match.team1.id && styles.winnerText
            ]} 
            numberOfLines={1}
          >
            {match.team1.name}
          </ThemedText>
        </View>

        <View style={styles.scoreContainer}>
          {match.isBye ? (
            <ThemedText style={[styles.byeText, { color: theme.warning }]}>BYE</ThemedText>
          ) : (
            <>
              <MaterialCommunityIcons name="sword-cross" size={24} color={theme.tint} />
              <ThemedText 
                style={[
                  styles.score, 
                  { color: match.isCompleted ? getScoreColor(match.team1Score, match.team2Score) : theme.text }
                ]}
              >
                {match.team1Score} - {match.team2Score}
              </ThemedText>
            </>
          )}
        </View>

        <View style={[styles.teamsInfo, styles.teamsInfoRight, isMobile && styles.teamsInfoMobile]}>
          {match.isBye ? (
            <ThemedText style={[styles.teamName, styles.textAlignRight, { opacity: 0.5 }]}>—</ThemedText>
          ) : (
            <>
              {renderTeamLogo(match.team2)}
              <ThemedText 
                style={[
                  styles.teamName, 
                  styles.textAlignRight, 
                  isMobile && styles.teamNameMobile,
                  match.winnerId === match.team2?.id && styles.winnerText
                ]} 
                numberOfLines={1}
              >
                {match.team2?.name || 'TBD'}
              </ThemedText>
            </>
          )}
        </View>
      </View>

      {/* Match Info Row - Date, Event, Expand Icon */}
      {(match.date || match.event || hasExpandedContent) && (
        <View style={styles.matchInfoRow}>
          <View style={styles.matchInfo}>
            {match.date && <ThemedText style={styles.date}>{match.date}</ThemedText>}
            {match.event && <ThemedText style={styles.event}>{match.event}</ThemedText>}
          </View>
          {hasExpandedContent && (
            <FontAwesome
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.text}
            />
          )}
        </View>
      )}

      {/* Match Status */}
      {match.isCompleted && !match.isBye && (
        <ThemedText style={[styles.matchStatus, { color: theme.success }]}>
          {match.isDraw ? 'Draw' : `Winner: ${match.winnerId === match.team1.id ? match.team1.name : match.team2?.name}`}
        </ThemedText>
      )}

      {/* Expanded Content */}
      {isExpanded && hasExpandedContent && (
        <View style={styles.expandedContent}>
          {/* Mission Details */}
          {(match.primaryMission || match.deploymentMap || match.missionRules?.length) && (
            <View style={styles.missionInfo}>
              <ThemedText style={styles.missionTitle}>Mission Details</ThemedText>
              {match.primaryMission && (
                <ThemedText style={styles.missionDetail}>Primary: {match.primaryMission}</ThemedText>
              )}
              {match.deploymentMap && (
                <ThemedText style={styles.missionDetail}>Deployment: {match.deploymentMap}</ThemedText>
              )}
              {match.missionRules?.length && (
                <ThemedText style={styles.missionDetail}>Rules: {match.missionRules.join(', ')}</ThemedText>
              )}
            </View>
          )}

          {/* Individual Games */}
          {match.games && match.games.length > 0 && (
            <View style={styles.gamesContainer}>
              <ThemedText style={styles.gamesTitle}>Individual Games</ThemedText>
              {match.games.map((game, index) => {
                // Support both API GameDto format (player names in game) and legacy format (players array)
                const player1Name = game.player1Name || match.team1.players?.[index]?.name;
                const player2Name = game.player2Name || match.team2?.players?.[index]?.name;
                const player1 = match.team1.players?.[index];
                const player2 = match.team2?.players?.[index];
                const player1Faction = game.player1Faction || player1?.faction;
                const player2Faction = game.player2Faction || player2?.faction;
                const player1ArmyListId = game.player1ArmyListId || player1?.armyListUrl;
                const player2ArmyListId = game.player2ArmyListId || player2?.armyListUrl;

                return (
                  <Pressable 
                    key={game.id || index} 
                    style={styles.gameRow}
                    onPress={onGamePress ? () => onGamePress(game) : undefined}
                    disabled={!onGamePress}
                  >
                    <View style={styles.playerInfo}>
                      {player1?.profileImage ? (
                        <Image source={{ uri: player1.profileImage }} style={styles.playerImage} />
                      ) : (
                        <View style={[styles.playerImagePlaceholder, { backgroundColor: theme.icon }]}>
                          <ThemedText style={styles.playerImageText}>
                            {player1Name?.charAt(0) || '?'}
                          </ThemedText>
                        </View>
                      )}
                      <View style={styles.playerDetails}>
                        <ThemedText style={styles.playerName}>{player1Name || 'Player 1'}</ThemedText>
                        {player1Faction && <ThemedText style={styles.faction}>{player1Faction}</ThemedText>}
                        {player1ArmyListId && onArmyListPress && (
                          <Pressable onPress={() => onArmyListPress(player1ArmyListId)}>
                            <ThemedText style={styles.armyListLink}>View Army List</ThemedText>
                          </Pressable>
                        )}
                      </View>
                    </View>

                    <View style={styles.gameScoreContainer}>
                      <MaterialCommunityIcons name="sword-cross" size={20} color={theme.tint} />
                      <ThemedText style={[
                        styles.gameScore,
                        { color: getScoreColor(game.player1DifferentialScore || 0, game.player2DifferentialScore || 0) }
                      ]}>
                        {game.player1DifferentialScore} - {game.player2DifferentialScore}
                      </ThemedText>
                    </View>

                    <View style={[styles.playerInfo, styles.playerInfoRight]}>
                      <View style={[styles.playerDetails, styles.playerDetailsRight]}>
                        <ThemedText style={[styles.playerName, styles.textAlignRight]}>
                          {player2Name || 'Player 2'}
                        </ThemedText>
                        {player2Faction && <ThemedText style={[styles.faction, styles.textAlignRight]}>{player2Faction}</ThemedText>}
                        {player2ArmyListId && onArmyListPress && (
                          <Pressable onPress={() => onArmyListPress(player2ArmyListId)}>
                            <ThemedText style={[styles.armyListLink, styles.textAlignRight]}>View Army List</ThemedText>
                          </Pressable>
                        )}
                      </View>
                      {player2?.profileImage ? (
                        <Image source={{ uri: player2.profileImage }} style={styles.playerImage} />
                      ) : (
                        <View style={[styles.playerImagePlaceholder, { backgroundColor: theme.icon }]}>
                          <ThemedText style={styles.playerImageText}>
                            {player2Name?.charAt(0) || '?'}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Confirm Result Button */}
          {showConfirmButton && onConfirmResult && (
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: theme.success }]}
              onPress={() => onConfirmResult()}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                  <ThemedText style={styles.confirmButtonText}>Confirm Result</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  matchCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  teamsInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  teamsInfoMobile: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  teamsInfoRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  teamLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  teamLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  teamNameMobile: {
    textAlign: 'center',
    fontSize: 14,
  },
  winnerText: {
    fontWeight: '700',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  byeText: {
    fontWeight: '600',
    fontSize: 16,
  },
  textAlignRight: {
    textAlign: 'right',
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    gap: 8,
  },
  matchInfo: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  event: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  matchStatus: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  missionInfo: {
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  missionDetail: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  gamesContainer: {
    marginTop: 8,
  },
  gamesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerInfoRight: {
    justifyContent: 'flex-end',
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  playerDetails: {
    marginHorizontal: 8,
    flex: 1,
  },
  playerDetailsRight: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginRight: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  faction: {
    fontSize: 12,
    opacity: 0.7,
    flexWrap: 'wrap',
  },
  armyListLink: {
    fontSize: 12,
    color: '#4a9eff',
    marginTop: 2,
  },
  gameScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20%',
  },
  gameScore: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MatchCard;
