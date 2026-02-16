import { useState, useCallback } from 'react';
import {
  Player,
  Team,
  PairingState,
  Phase,
  PlayerState,
  Pairing,
  TableLayout,
  createInitialPairingState,
} from '@/src/types/pairing';
import { selectRandom, refuseRandom } from '@/src/utils/simpleAI';

export interface PairingInitData {
  teamA: Team;
  teamB: Team;
  layouts: TableLayout[];
}

export const usePairingState = (initData: PairingInitData) => {
  const [state, setState] = useState<PairingState>(() => {
    const initialState = createInitialPairingState(initData.teamA, initData.teamB, initData.layouts);

    // Initialize all players as available
    const playerStates = new Map<string, PlayerState>();
    [...initData.teamA.players, ...initData.teamB.players].forEach(player => {
      playerStates.set(player.id, 'available');
    });

    return { ...initialState, playerStates };
  });

  // Get available players for a team
  const getAvailablePlayers = useCallback((team: 'A' | 'B'): Player[] => {
    const teamPlayers = team === 'A' ? state.teamA.players : state.teamB.players;
    return teamPlayers.filter(player => state.playerStates.get(player.id) === 'available');
  }, [state]);

  // Get refused players from a round
  const getRefusedPlayers = useCallback((team: 'A' | 'B', round: 1 | 2): Player[] => {
    const roundState = round === 1 ? state.round1 : state.round2;
    const refused = team === 'A' ? roundState.teamARefused : roundState.teamBRefused;
    return refused ? [refused] : [];
  }, [state]);

  // Advance to next phase
  const advancePhase = useCallback(() => {
    setState(prev => ({ ...prev, currentPhase: getNextPhase(prev.currentPhase) }));
  }, []);

  // Select defender for current round
  const selectDefender = useCallback((playerId: string, team: 'A' | 'B') => {
    setState(prev => {
      const player = (team === 'A' ? prev.teamA : prev.teamB).players.find(p => p.id === playerId);
      if (!player) return prev;

      const newPlayerStates = new Map(prev.playerStates);
      newPlayerStates.set(playerId, 'defender');

      const currentRound = prev.currentPhase.includes('round1') ? 1 : 2;
      const roundKey = currentRound === 1 ? 'round1' : 'round2';
      const defenderKey = team === 'A' ? 'teamADefender' : 'teamBDefender';

      return {
        ...prev,
        playerStates: newPlayerStates,
        [roundKey]: { ...prev[roundKey], [defenderKey]: player },
      };
    });
  }, []);

  // AI selects defender
  const aiSelectDefender = useCallback((team: 'A' | 'B') => {
    const available = getAvailablePlayers(team);
    if (available.length === 0) return;

    const selected = selectRandom(available, 1)[0];
    if (selected) {
      selectDefender(selected.id, team);
    }
  }, [getAvailablePlayers, selectDefender]);

  // Select attackers for current round
  const selectAttackers = useCallback((playerIds: string[], team: 'A' | 'B') => {
    setState(prev => {
      const players = (team === 'A' ? prev.teamA : prev.teamB).players.filter(p => playerIds.includes(p.id));
      if (players.length !== 2) return prev;

      const newPlayerStates = new Map(prev.playerStates);
      players.forEach(p => newPlayerStates.set(p.id, 'attacker'));

      const currentRound = prev.currentPhase.includes('round1') ? 1 : 2;
      const roundKey = currentRound === 1 ? 'round1' : 'round2';
      const attackersKey = team === 'A' ? 'teamAAttackers' : 'teamBAttackers';

      return {
        ...prev,
        playerStates: newPlayerStates,
        [roundKey]: { ...prev[roundKey], [attackersKey]: players },
      };
    });
  }, []);

  // AI selects attackers
  const aiSelectAttackers = useCallback((team: 'A' | 'B') => {
    const currentRound = state.currentPhase.includes('round1') ? 1 : 2;
    let availablePool: Player[] = [];

    if (currentRound === 1) {
      availablePool = getAvailablePlayers(team);
    } else {
      // Round 2: Refused players from R1 are already set back to 'available' state
      // So we just need to get all available players (includes refused + unused)
      availablePool = getAvailablePlayers(team);
    }

    const selected = selectRandom(availablePool, 2);
    if (selected.length === 2) {
      selectAttackers(selected.map(p => p.id), team);
    }
  }, [state.currentPhase, getAvailablePlayers, selectAttackers]);

  // Flip coin for table choice token
  const flipCoin = useCallback(() => {
    setState(prev => {
      const winner: 'A' | 'B' = Math.random() > 0.5 ? 'A' : 'B';
      return {
        ...prev,
        round1: { ...prev.round1, tableChoiceToken: winner },
        coinflipWinner: winner, // Persist winner for layout selection order
      };
    });
  }, []);

  // Refuse attacker
  const refuseAttacker = useCallback((playerId: string, team: 'A' | 'B') => {
    setState(prev => {
      const currentRound = prev.currentPhase.includes('round1') ? 1 : 2;
      const roundKey = currentRound === 1 ? 'round1' : 'round2';
      const roundState = prev[roundKey];

      // Get opponent's attackers
      const opponentAttackers = team === 'A' ? roundState.teamBAttackers : roundState.teamAAttackers;
      const refused = opponentAttackers.find(p => p.id === playerId);
      if (!refused) return prev;

      const newPlayerStates = new Map(prev.playerStates);
      newPlayerStates.set(playerId, 'refused');

      const refusedKey = team === 'A' ? 'teamARefused' : 'teamBRefused';

      return {
        ...prev,
        playerStates: newPlayerStates,
        [roundKey]: { ...prev[roundKey], [refusedKey]: refused },
      };
    });
  }, []);

  // AI refuses attacker
  const aiRefuseAttacker = useCallback((team: 'A' | 'B') => {
    const currentRound = state.currentPhase.includes('round1') ? 1 : 2;
    const roundState = currentRound === 1 ? state.round1 : state.round2;
    const opponentAttackers = team === 'A' ? roundState.teamBAttackers : roundState.teamAAttackers;

    if (opponentAttackers.length === 2) {
      const refused = refuseRandom(opponentAttackers as [Player, Player]);
      refuseAttacker(refused.id, team);
    }
  }, [state, refuseAttacker]);

  // Create pairings for current round
  const createPairings = useCallback(() => {
    setState(prev => {
      const currentRound = prev.currentPhase.includes('round1') ? 1 : 2;
      const roundState = currentRound === 1 ? prev.round1 : prev.round2;

      if (!roundState.teamADefender || !roundState.teamBDefender) return prev;

      // Get accepted attackers (not refused)
      const teamAAccepted = roundState.teamAAttackers.find(p => p.id !== roundState.teamBRefused?.id);
      const teamBAccepted = roundState.teamBAttackers.find(p => p.id !== roundState.teamARefused?.id);

      if (!teamAAccepted || !teamBAccepted) return prev;

      const newPlayerStates = new Map(prev.playerStates);

      // Mark paired players as 'paired'
      [roundState.teamADefender, teamAAccepted, roundState.teamBDefender, teamBAccepted].forEach(player => {
        newPlayerStates.set(player.id, 'paired');
      });

      // Return refused players to 'available' state for next round
      if (roundState.teamARefused) {
        newPlayerStates.set(roundState.teamARefused.id, 'available');
      }
      if (roundState.teamBRefused) {
        newPlayerStates.set(roundState.teamBRefused.id, 'available');
      }

      // Create 2 new pairings
      const tableStart = prev.pairings.length + 1;
      const newPairings: Pairing[] = [
        {
          id: `pairing-${tableStart}`,
          tableNumber: tableStart,
          teamAPlayer: roundState.teamADefender,
          teamBPlayer: teamBAccepted,
          createdInRound: currentRound as 1 | 2 | 3,
        },
        {
          id: `pairing-${tableStart + 1}`,
          tableNumber: tableStart + 1,
          teamAPlayer: teamAAccepted,
          teamBPlayer: roundState.teamBDefender,
          createdInRound: currentRound as 1 | 2 | 3,
        },
      ];

      return {
        ...prev,
        playerStates: newPlayerStates,
        pairings: [...prev.pairings, ...newPairings],
      };
    });
  }, []);

  // Auto-pair last players (Round 3)
  const autoPairLastPlayers = useCallback(() => {
    setState(prev => {
      // Get available players from current state (prev)
      const teamAAvailable = prev.teamA.players.filter(
        player => prev.playerStates.get(player.id) === 'available'
      );
      const teamBAvailable = prev.teamB.players.filter(
        player => prev.playerStates.get(player.id) === 'available'
      );

      const lastTeamA = teamAAvailable[0];
      const lastTeamB = teamBAvailable[0];

      if (!lastTeamA || !lastTeamB) return prev;

      const newPlayerStates = new Map(prev.playerStates);
      newPlayerStates.set(lastTeamA.id, 'paired');
      newPlayerStates.set(lastTeamB.id, 'paired');

      // Auto-assign last remaining layout to final pairing
      const lastLayout = prev.availableLayouts[0];

      const finalPairing: Pairing = {
        id: 'pairing-5',
        tableNumber: 5,
        teamAPlayer: lastTeamA,
        teamBPlayer: lastTeamB,
        createdInRound: 3,
        layout: lastLayout,
      };

      return {
        ...prev,
        playerStates: newPlayerStates,
        pairings: [...prev.pairings, finalPairing],
        availableLayouts: [], // All layouts now assigned
      };
    });
  }, []);

  // Set current layout picker and pending table
  const setLayoutPicker = useCallback((team: 'A' | 'B', tableNumber: number) => {
    setState(prev => ({
      ...prev,
      currentLayoutPicker: team,
      pendingLayoutForTable: tableNumber,
    }));
  }, []);

  // Select layout for a table
  const selectLayout = useCallback((tableNumber: number, layout: TableLayout) => {
    setState(prev => {
      // Find the pairing for this table
      const pairingIndex = prev.pairings.findIndex(p => p.tableNumber === tableNumber);
      if (pairingIndex === -1) return prev;

      // Update the pairing with the selected layout
      const updatedPairings = [...prev.pairings];
      updatedPairings[pairingIndex] = {
        ...updatedPairings[pairingIndex],
        layout,
      };

      // Remove the layout from available layouts
      const newAvailableLayouts = prev.availableLayouts.filter(l => l.id !== layout.id);

      return {
        ...prev,
        pairings: updatedPairings,
        availableLayouts: newAvailableLayouts,
        currentLayoutPicker: null,
        pendingLayoutForTable: null,
      };
    });
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    const initialState = createInitialPairingState(initData.teamA, initData.teamB, initData.layouts);

    const playerStates = new Map<string, PlayerState>();
    [...initData.teamA.players, ...initData.teamB.players].forEach(player => {
      playerStates.set(player.id, 'available');
    });

    setState({ ...initialState, playerStates });
  }, [initData]);

  return {
    state,
    getAvailablePlayers,
    getRefusedPlayers,
    advancePhase,
    selectDefender,
    aiSelectDefender,
    selectAttackers,
    aiSelectAttackers,
    flipCoin,
    refuseAttacker,
    aiRefuseAttacker,
    createPairings,
    autoPairLastPlayers,
    setLayoutPicker,
    selectLayout,
    reset,
  };
};

// Helper to determine next phase
// In round 2, attackers are auto-assigned after defender selection, so we skip attacker phases
const getNextPhase = (currentPhase: Phase): Phase => {
  const phaseFlow: Phase[] = [
    'setup',
    'round1-defender',
    'round1-defender-reveal',
    'round1-attackers',
    'round1-attackers-reveal',
    'round1-coin-flip',
    'round1-refuse',
    'round1-layout-select',
    'round1-complete',
    'round2-defender',
    'round2-defender-reveal',
    // Skip round2-attackers and round2-attackers-reveal - attackers auto-assigned in round 2
    'round2-refuse',
    'round2-layout-select',
    'round2-complete',
    'round3-auto-pair',
    'results',
  ];

  const currentIndex = phaseFlow.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phaseFlow.length - 1) {
    return currentPhase; // Stay at current phase if invalid or at end
  }

  return phaseFlow[currentIndex + 1];
};
