import {
  PairingState,
  ServerPairingState,
  Player,
  Team,
  TableLayout,
  RoundState,
  Pairing,
  PlayerState,
} from '@/src/types/pairing';
import { PairingInitData } from '@/src/hooks/usePairingState';

function findPlayer(teams: { teamA: Team; teamB: Team }, playerId: string): Player | null {
  return (
    teams.teamA.players.find(p => p.id === playerId) ??
    teams.teamB.players.find(p => p.id === playerId) ??
    null
  );
}

function findLayout(layouts: TableLayout[], layoutId: string): TableLayout | undefined {
  return layouts.find(l => l.id === layoutId);
}

/**
 * Hydrate a round's state. When `swap` is true, the server's 1/2 are flipped
 * so the user's team always appears as UI team A (blue).
 * Server: Team1/Team2 → UI: TeamA/TeamB
 */
function hydrateRound(
  serverRound: ServerPairingState['round1'],
  roundNumber: 1 | 2 | 3,
  teams: { teamA: Team; teamB: Team },
  swap: boolean,
): RoundState {
  // Map server team1/team2 to UI teamA/teamB, with optional swap
  const sA = swap ? serverRound.team2Defender : serverRound.team1Defender;
  const sB = swap ? serverRound.team1Defender : serverRound.team2Defender;
  const sAAtk = swap ? serverRound.team2Attackers : serverRound.team1Attackers;
  const sBAtk = swap ? serverRound.team1Attackers : serverRound.team2Attackers;
  const sARef = swap ? serverRound.team2Refused : serverRound.team1Refused;
  const sBRef = swap ? serverRound.team1Refused : serverRound.team2Refused;

  const teamADefender = sA ? findPlayer(teams, sA) : null;
  const teamBDefender = sB ? findPlayer(teams, sB) : null;

  return {
    round: roundNumber,
    teamADefender,
    teamBDefender,
    teamAAttackers: sAAtk.map(id => findPlayer(teams, id)).filter(Boolean) as Player[],
    teamBAttackers: sBAtk.map(id => findPlayer(teams, id)).filter(Boolean) as Player[],
    teamARefused: sARef ? findPlayer(teams, sARef) : null,
    teamBRefused: sBRef ? findPlayer(teams, sBRef) : null,
    tableChoiceToken: null,
  };
}

function buildPlayerStates(
  serverState: ServerPairingState,
  teams: { teamA: Team; teamB: Team },
): Map<string, PlayerState> {
  const states = new Map<string, PlayerState>();

  // Initialize all players as available
  for (const p of [...teams.teamA.players, ...teams.teamB.players]) {
    states.set(p.id, 'available');
  }

  // Mark paired players (server uses team1/team2)
  for (const pairing of serverState.pairings) {
    states.set(pairing.team1Player, 'paired');
    states.set(pairing.team2Player, 'paired');
  }

  // Mark current round selections (server uses team1/team2)
  const currentRound = serverState.currentPhase.includes('round1') ? serverState.round1 : serverState.round2;

  if (currentRound.team1Defender) states.set(currentRound.team1Defender, 'defender');
  if (currentRound.team2Defender) states.set(currentRound.team2Defender, 'defender');
  for (const id of currentRound.team1Attackers) states.set(id, 'attacker');
  for (const id of currentRound.team2Attackers) states.set(id, 'attacker');
  if (currentRound.team1Refused) states.set(currentRound.team1Refused, 'refused');
  if (currentRound.team2Refused) states.set(currentRound.team2Refused, 'refused');

  return states;
}

/**
 * Convert server JSONB state into a full PairingState for the UI.
 *
 * @param swapTeams When true the server's A/B sides are flipped so the
 *   current user's team always renders as UI team A (blue). Pass true when
 *   the user is server-side team2 (team B).
 */
export function hydratePairingState(
  serverState: ServerPairingState,
  initData: PairingInitData,
  swapTeams = false,
): PairingState {
  const teams = { teamA: initData.teamA, teamB: initData.teamB };

  // Map server team1/team2 to UI teamA/teamB, with optional swap
  const pairings: Pairing[] = serverState.pairings.map((p, i) => ({
    id: `pairing-${i}`,
    tableNumber: p.tableNumber,
    teamAPlayer: findPlayer(teams, swapTeams ? p.team2Player : p.team1Player)!,
    teamBPlayer: findPlayer(teams, swapTeams ? p.team1Player : p.team2Player)!,
    createdInRound: p.createdInRound as 1 | 2 | 3,
    layout: p.layoutId != null ? findLayout(initData.layouts, p.layoutId) : undefined,
  }));

  const usedLayoutIds = new Set(serverState.pairings.map(p => p.layoutId).filter(Boolean));
  const availableLayouts = initData.layouts.filter(l => !usedLayoutIds.has(l.id));

  // Map server coinflip winner (1/2) to UI (A/B), with optional swap
  // Server: '1' or '2' → UI: 'A' or 'B'
  let coinflipWinner: 'A' | 'B' | null = null;
  if (serverState.coinflipWinner) {
    if (swapTeams) {
      coinflipWinner = serverState.coinflipWinner === '1' ? 'B' : 'A';
    } else {
      coinflipWinner = serverState.coinflipWinner === '1' ? 'A' : 'B';
    }
  }

  // Map server's currentLayoutPicker (1/2) to UI (A/B) with swap
  let currentLayoutPicker: 'A' | 'B' | null = null;
  if (serverState.currentLayoutPicker) {
    if (swapTeams) {
      currentLayoutPicker = serverState.currentLayoutPicker === '1' ? 'B' : 'A';
    } else {
      currentLayoutPicker = serverState.currentLayoutPicker === '1' ? 'A' : 'B';
    }
  }

  // Derive pendingLayoutForTable from server's layout table assignments
  let pendingLayoutForTable: number | null = null;
  if (currentLayoutPicker && (serverState.currentPhase === 'round1-layout-select' || serverState.currentPhase === 'round2-layout-select')) {
    const isRound1 = serverState.currentPhase === 'round1-layout-select';
    const serverRound = isRound1 ? serverState.round1 : serverState.round2;

    // Use the server-provided layout table for the current picker
    const serverPicker = serverState.currentLayoutPicker;
    if (serverPicker === '1' && serverRound.team1LayoutTable != null) {
      pendingLayoutForTable = serverRound.team1LayoutTable;
    } else if (serverPicker === '2' && serverRound.team2LayoutTable != null) {
      pendingLayoutForTable = serverRound.team2LayoutTable;
    }

    // Fallback: if server doesn't provide layout table, find first unassigned
    if (pendingLayoutForTable == null) {
      const tableOffset = isRound1 ? 0 : 2;
      const table1Pairing = pairings.find(p => p.tableNumber === tableOffset + 1);
      const table2Pairing = pairings.find(p => p.tableNumber === tableOffset + 2);

      if (!table1Pairing?.layout) {
        pendingLayoutForTable = tableOffset + 1;
      } else if (!table2Pairing?.layout) {
        pendingLayoutForTable = tableOffset + 2;
      }
    }
  }

  return {
    teamA: initData.teamA,
    teamB: initData.teamB,
    playerStates: buildPlayerStates(serverState, teams),
    currentPhase: serverState.currentPhase,
    round1: hydrateRound(serverState.round1, 1, teams, swapTeams),
    round2: hydrateRound(serverState.round2, 2, teams, swapTeams),
    pairings,
    availableLayouts,
    coinflipWinner,
    currentLayoutPicker,
    pendingLayoutForTable,
    isAIThinking: false,
    showReveal: false,
  };
}
