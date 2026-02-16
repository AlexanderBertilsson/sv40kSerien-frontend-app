import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useEventState, useRoundMatches, useConfirmTeamMatch } from '@/src/hooks/useEventState';
import { RoundDto, TeamMatchDto } from '@/types/EventAdmin';
import { MatchCard, MatchData, MatchGame } from '@/src/components/match/MatchCard';
import { ArmyListModal } from '@/src/components/modals/armyListModal';
import { PairingsModal } from '@/src/components/modals/PairingsModal';
import { GameDetailsModal } from '@/src/components/modals/GameDetailsModal';
import { ConfirmModal } from '@/src/components/modals/ConfirmModal';
import { EventTeam } from '@/types/Event';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { useEventContext } from '@/src/contexts/EventContext';

interface PairingsViewProps {
  eventId: string;
  registeredTeams?: EventTeam[];
}

export default function PairingsView({ eventId, registeredTeams = [] }: PairingsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { authUser } = useAuthContext();
  const { eventTeamId, isCaptain, isEventAdmin } = useEventContext();
  
  const { eventStateQuery } = useEventState(eventId);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedArmyListId, setSelectedArmyListId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TeamMatchDto | null>(null);
  const [selectedGame, setSelectedGame] = useState<MatchGame | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { roundMatchesQuery } = useRoundMatches(eventId, selectedRound);

  // Get team data for a match from registered teams
  const getTeamData = (teamId: string): EventTeam | null => {
    return registeredTeams.find(t => t.id === teamId) || null;
  };

  // Get rounds that have pairings
  const roundsWithPairings = useMemo(() => {
    if (!eventStateQuery.data?.rounds) return [];
    return eventStateQuery.data.rounds
      .filter((r: RoundDto) => r.hasPairings)
      .sort((a: RoundDto, b: RoundDto) => a.roundNumber - b.roundNumber);
  }, [eventStateQuery.data?.rounds]);

  // Auto-select the latest round with pairings
  useEffect(() => {
    if (roundsWithPairings.length > 0 && selectedRound === null) {
      const latestRound = roundsWithPairings[roundsWithPairings.length - 1];
      setSelectedRound(latestRound.roundNumber);
    }
  }, [roundsWithPairings, selectedRound]);

  // Sort matches with user's team at top and transform to MatchData
  const sortedMatches = useMemo(() => {
    if (!roundMatchesQuery.data) return [];
    const matches = [...roundMatchesQuery.data];
    
    if (eventTeamId) {
      matches.sort((a, b) => {
        const aIsUserTeam = a.team1Id === eventTeamId || a.team2Id === eventTeamId;
        const bIsUserTeam = b.team1Id === eventTeamId || b.team2Id === eventTeamId;
        if (aIsUserTeam && !bIsUserTeam) return -1;
        if (!aIsUserTeam && bIsUserTeam) return 1;
        return 0;
      });
    }
    return matches;
  }, [roundMatchesQuery.data, eventTeamId]);

  const isUserMatch = (match: TeamMatchDto) => {
    return eventTeamId && (match.team1Id === eventTeamId || match.team2Id === eventTeamId);
  };

  // Transform TeamMatchDto to MatchData
  const transformToMatchData = (item: TeamMatchDto): MatchData => ({
    id: item.id,
    team1: {
      id: item.team1Id,
      name: item.team1Name,
    },
    team2: item.team2Id ? {
      id: item.team2Id,
      name: item.team2Name || 'TBD',
    } : null,
    team1Score: item.team1Score,
    team2Score: item.team2Score,
    isBye: item.isBye,
    isCompleted: item.status === 'completed',
    isDraw: item.isDraw,
    winnerId: item.winnerId,
    games: item.games?.map(g => ({
      id: g.id,
      player1Id: g.player1Id,
      player1Name: g.player1Name,
      player1ArmyListId: g.player1ArmyListId,
      player1Faction: g.player1Faction,
      player1Score: g.player1Score,
      player1DifferentialScore: g.player1DifferentialScore,
      player2Id: g.player2Id,
      player2Name: g.player2Name,
      player2ArmyListId: g.player2ArmyListId,
      player2Faction: g.player2Faction,
      player2Score: g.player2Score,
      player2DifferentialScore: g.player2DifferentialScore,
      missionName: g.mission?.name || null,
      deployment: g.layout?.deployment || null,
      layout: g.layout ? {
        id: g.layout.id,
        name: g.layout.name,
        imageUrl: g.layout.imageUrl,
        deployment: g.layout.deployment,
      } : null,
      winnerId: g.winnerId,
    })),
  });

  const hasGames = (item: TeamMatchDto) => item.games && item.games.length > 0;

  // Check if all games in a match have scores reported (differential score not 0-0)
  const allGamesCompleted = (item: TeamMatchDto) => {
    if (!item.games || item.games.length === 0) return false;
    return item.games.every(g => 
      g.player1DifferentialScore !== 0 || g.player2DifferentialScore !== 0
    );
  };

  // Find user's match for confirm functionality
  const userMatch = useMemo(() => {
    if (!eventTeamId) return undefined;
    return sortedMatches.find(m => m.team1Id === eventTeamId || m.team2Id === eventTeamId);
  }, [sortedMatches, eventTeamId]);

  const { confirmMatchMutation } = useConfirmTeamMatch(eventId, userMatch?.id || '');

  const handleConfirmResult = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await confirmMatchMutation.mutateAsync();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to confirm match:', error);
    }
  };

  const handleArmyListPress = (armyListId: string) => {
    setSelectedArmyListId(armyListId);
  };

  const handleMatchPress = (item: TeamMatchDto) => {
    // Only allow pairings if no games exist and not a bye
    if (!hasGames(item) && !item.isBye) {
      setSelectedMatch(item);
    }
  };

  const handleStartPairings = () => {
    if (selectedMatch) {
      const matchId = selectedMatch.id;
      setSelectedMatch(null);
      router.push(`/events/${eventId}/pairings/${matchId}`);
    }
  };

  const handleGamePress = (game: MatchGame) => {
    setSelectedGame(game);
  };

  const renderMatchItem = ({ item }: { item: TeamMatchDto }) => {
    const isMyMatch = isUserMatch(item);
    const matchData = transformToMatchData(item);
    const isAdmin = isCaptain || isEventAdmin;
    // Only allow starting pairings for admins on their own match
    const canSetPairings = isMyMatch && isAdmin && !hasGames(item) && !item.isBye;
    // Show confirm button if it's user's match, has games, all games completed, and match not yet completed
    const showConfirm = !!isMyMatch && hasGames(item) && allGamesCompleted(item) && item.status !== 'completed';
    // Spectate: non-user matches, or own match for non-admins, with in_progress pairing state
    const canSpectate = (!isMyMatch || (isMyMatch && !isAdmin)) && item.pairingState?.status === 'in_progress' && !item.isBye;

    return (
      <View>
        <MatchCard
          match={matchData}
          isHighlighted={!!isMyMatch}
          expandable={hasGames(item)}
          onArmyListPress={handleArmyListPress}
          onPress={canSetPairings ? () => handleMatchPress(item) : undefined}
          onGamePress={handleGamePress}
          showConfirmButton={showConfirm}
          onConfirmResult={handleConfirmResult}
          isConfirming={confirmMatchMutation.isPending}
        />
        {canSpectate && (
          <TouchableOpacity
            style={[styles.spectateButton, { borderColor: theme.tint }]}
            onPress={() => router.push(`/events/${eventId}/pairings/${item.id}`)}
          >
            <ThemedText style={[styles.spectateButtonText, { color: theme.tint }]}>
              Spectate Pairings
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (eventStateQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (roundsWithPairings.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>Pairings</ThemedText>
        <ThemedText style={styles.emptyText}>
          Pairings will be available once the event starts.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Pairings</ThemedText>
      
      {/* Round Selector */}
      <View style={styles.roundSelector}>
        {roundsWithPairings.map((round: RoundDto) => (
          <TouchableOpacity
            key={round.roundNumber}
            style={[
              styles.roundTab,
              { 
                backgroundColor: selectedRound === round.roundNumber 
                  ? theme.tint 
                  : theme.secondary,
                borderColor: theme.icon,
              }
            ]}
            onPress={() => setSelectedRound(round.roundNumber)}
          >
            <ThemedText style={[
              styles.roundTabText,
              selectedRound === round.roundNumber && styles.roundTabTextActive
            ]}>
              Round {round.roundNumber}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matches List */}
      {roundMatchesQuery.isLoading ? (
        <ActivityIndicator size="small" color={theme.tint} style={{ marginTop: 20 }} />
      ) : roundMatchesQuery.error ? (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          Failed to load matches
        </ThemedText>
      ) : sortedMatches.length === 0 ? (
        <ThemedText style={styles.emptyText}>No matches found for this round.</ThemedText>
      ) : (
        <FlatList
          data={sortedMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.matchesList}
        />
      )}

      <ArmyListModal
        visible={!!selectedArmyListId}
        onClose={() => setSelectedArmyListId(null)}
        armyListId={selectedArmyListId || ''}
      />

      <PairingsModal
        visible={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        eventId={eventId}
        teamMatchId={selectedMatch?.id || ''}
        team1={selectedMatch ? getTeamData(selectedMatch.team1Id) : null}
        team2={selectedMatch?.team2Id ? getTeamData(selectedMatch.team2Id) : null}
        onStartPairings={handleStartPairings}
      />

      <GameDetailsModal
        visible={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        eventId={eventId}
        game={selectedGame}
        currentUserId={authUser?.id}
      />

      <ConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Result"
        message="Are you sure you want to confirm the match result? This action cannot be undone."
        confirmText="Confirm"
        cancelText="Cancel"
        isLoading={confirmMatchMutation.isPending}
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
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  errorText: {
    marginTop: 12,
  },
  roundSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roundTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  roundTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roundTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  matchesList: {
    gap: 12,
  },
  spectateButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
  spectateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
