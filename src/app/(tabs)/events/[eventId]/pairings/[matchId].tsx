import { View, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/src/constants/Colors';
import ThemedText from '@/src/components/ThemedText';
import { EventProvider, useEventContext } from '@/src/contexts/EventContext';
import { useTeamRegistrations } from '@/src/hooks/useTeamRegistrations';
import { useRoundConfiguration } from '@/src/hooks/useRoundConfiguration';
import { useTeamMatch, useEventState } from '@/src/hooks/useEventState';
import { mapApiPlayersToTeam, mapApiLayouts } from '@/src/utils/pairingMappers';
import { useMemo, useCallback, useLayoutEffect } from 'react';
import { TableLayout, ServerTeamId } from '@/src/types/pairing';
import { PairingInitData } from '@/src/hooks/usePairingState';
import { useMultiplayerPairingState } from '@/src/hooks/useMultiplayerPairingState';
import { useSpectatorPairingState } from '@/src/hooks/useSpectatorPairingState';
import PairingGame from '@/src/components/pairings/PairingGame';

export default function MatchPairingsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string; matchId: string }>();
  const navigation = useNavigation();

  // Hide the tab bar when this screen is mounted
  // Navigate up the hierarchy: Screen → Stack (events) → Tabs
  useLayoutEffect(() => {
    const tabNavigator = navigation.getParent()?.getParent();
    tabNavigator?.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      tabNavigator?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  return (
    <EventProvider eventId={eventId}>
      <MatchPairingsContent />
    </EventProvider>
  );
}

function MatchPairingsContent() {
  const { eventId, matchId } = useLocalSearchParams<{ eventId: string; matchId: string }>();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const queryClient = useQueryClient();
  const { eventTeamId, isCaptain, isTeamAdmin } = useEventContext();

  const { teamMatchQuery } = useTeamMatch(matchId);
  const match = teamMatchQuery.data;

  const team1Id = match?.team1Id;
  const team2Id = match?.team2Id;

  // Derive round number from the match's roundId via event state
  const { eventStateQuery } = useEventState(eventId);
  const roundNumber = useMemo(() => {
    if (!match?.roundId || !eventStateQuery.data?.rounds) return 1;
    const round = eventStateQuery.data.rounds.find(r => r.id === match.roundId);
    return round?.roundNumber ?? 1;
  }, [match?.roundId, eventStateQuery.data?.rounds]);
  const isUserTeam1 = eventTeamId === team1Id;
  const isUserTeam2 = eventTeamId === team2Id;
  const isAdmin = isCaptain || isTeamAdmin;
  const isOnTeam = isUserTeam1 || isUserTeam2;
  const isTeamSpectator = isOnTeam && !isAdmin;
  const isSpectator = !isOnTeam;
  const pairingStateId = match?.pairingState?.id;
  const isMultiplayer = !!pairingStateId;

  // Fetch both teams' registrations
  const { teamRegistrationsQuery: team1RegQuery } = useTeamRegistrations(eventId, team1Id);
  const { teamRegistrationsQuery: team2RegQuery } = useTeamRegistrations(eventId, team2Id);

  // Fetch round configuration for layouts
  const { roundConfigQuery } = useRoundConfiguration(eventId, roundNumber);

  // Map API data to pairing types
  const initData = useMemo<PairingInitData | null>(() => {
    if (!team1RegQuery.data || !team2RegQuery.data || !roundConfigQuery.data || !match) return null;

    let teamAMembers, teamBMembers, teamAName, teamBName;

    if (isSpectator) {
      // Spectator: team1 = A (blue), team2 = B (red) — natural server order
      teamAMembers = team1RegQuery.data.members;
      teamBMembers = team2RegQuery.data.members;
      teamAName = match.team1Name;
      teamBName = match.team2Name || 'Team 2';
    } else {
      // Participant: user's team = A (blue), opponent = B (red)
      teamAMembers = isUserTeam1 ? team1RegQuery.data.members : team2RegQuery.data.members;
      teamBMembers = isUserTeam1 ? team2RegQuery.data.members : team1RegQuery.data.members;
      teamAName = isUserTeam1 ? match.team1Name : (match.team2Name || 'Opponent');
      teamBName = isUserTeam1 ? (match.team2Name || 'Opponent') : match.team1Name;
    }

    const teamA = mapApiPlayersToTeam(teamAMembers, 'A', teamAName, '#3b82f6');
    const teamB = mapApiPlayersToTeam(teamBMembers, 'B', teamBName, '#ef4444');
    const layouts = mapApiLayouts(roundConfigQuery.data.layouts);

    return { teamA, teamB, layouts };
  }, [team1RegQuery.data, team2RegQuery.data, roundConfigQuery.data, match, isUserTeam1, isSpectator]);

  const myTeamId = isUserTeam1 ? team1Id! : team2Id!;

  const handleDone = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['teamMatch', matchId] });
    queryClient.invalidateQueries({ queryKey: ['roundMatches', eventId] });
    queryClient.invalidateQueries({ queryKey: ['eventState', eventId] });
    queryClient.invalidateQueries({ queryKey: ['eventRegistration', 'me', eventId] });
    router.back();
  }, [queryClient, eventId, matchId]);

  const isLoading = teamMatchQuery.isLoading || team1RegQuery.isLoading || team2RegQuery.isLoading || roundConfigQuery.isLoading || eventStateQuery.isLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={{ marginTop: 16 }}>Loading match data...</ThemedText>
      </View>
    );
  }

  if (!initData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ThemedText>Unable to load match data.</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <ThemedText style={{ color: theme.tint }}>Go Back</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (isMultiplayer && isSpectator) {
    return (
      <SpectatorPairingGameWrapper
        initData={initData}
        pairingStateId={pairingStateId!}
        matchId={matchId!}
        onDone={handleDone}
      />
    );
  }

  if (isMultiplayer) {
    return (
      <MultiplayerPairingGame
        initData={initData}
        pairingStateId={pairingStateId!}
        matchId={matchId!}
        myTeamId={myTeamId}
        myTeam={isUserTeam1 ? '1' : '2'}
        readOnly={isTeamSpectator}
        onDone={handleDone}
      />
    );
  }

  return (
    <PairingGame
      initData={initData}
      getLayoutImageSource={(layout: TableLayout) => ({ uri: layout.imageUrl })}
      onReset={handleDone}
      mode="local"
    />
  );
}

/** Spectator wrapper — read-only, no team affiliation */
function SpectatorPairingGameWrapper({
  initData,
  pairingStateId,
  matchId,
  onDone,
}: {
  initData: PairingInitData;
  pairingStateId: string;
  matchId: string;
  onDone: () => void;
}) {
  const spectator = useSpectatorPairingState({
    pairingStateId,
    matchId,
    initData,
  });

  return (
    <PairingGame
      initData={initData}
      getLayoutImageSource={(layout: TableLayout) => ({ uri: layout.imageUrl })}
      onReset={onDone}
      mode="spectator"
      spectatorState={spectator}
    />
  );
}

/** Mounts only after initData is ready, so the hook initializes with real player data. */
function MultiplayerPairingGame({
  initData,
  pairingStateId,
  matchId,
  myTeamId,
  myTeam,
  readOnly,
  onDone,
}: {
  initData: PairingInitData;
  pairingStateId: string;
  matchId: string;
  myTeamId: string;
  myTeam: ServerTeamId;
  readOnly?: boolean;
  onDone: () => void;
}) {
  const multiplayer = useMultiplayerPairingState({
    pairingStateId,
    matchId,
    myTeamId,
    myTeam,
    initData,
    readOnly,
  });

  return (
    <PairingGame
      initData={initData}
      getLayoutImageSource={(layout: TableLayout) => ({ uri: layout.imageUrl })}
      onReset={onDone}
      mode="multiplayer"
      multiplayerState={multiplayer}
      readOnly={readOnly}
    />
  );
}
