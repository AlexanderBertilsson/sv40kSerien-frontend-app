import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, setSupabaseRealtimeAuth } from '@/src/components/supabase/supabase';
import apiClient from '@/src/components/httpClient/httpClient';
import { PairingInitData } from '@/src/hooks/usePairingState';
import { hydratePairingState } from '@/src/utils/pairingStateHydrator';
import {
  PairingState,
  ServerPairingState,
  ActionMessage,
  Player,
  PlayerState as PlayerStateType,
  Phase,
  ServerTeamId,
  PairingTransactionLog,
} from '@/src/types/pairing';
import {
  SelectDefenderRequest,
  SelectAttackersRequest,
  RefuseAttackerRequest,
  SelectLayoutRequest,
} from '@/types/EventAdmin';

export interface MultiplayerPairingHook {
  state: PairingState;
  myTeam: ServerTeamId;  // '1' or '2' (server-side team identifier)
  opponentAction: ActionMessage | null;
  getAvailablePlayers: (team: 'A' | 'B') => Player[];  // UI uses A/B for display
  submitDefender: (playerId: string) => Promise<void>;
  submitAttackers: (playerIds: string[]) => Promise<void>;
  submitRefusal: (playerId: string) => Promise<void>;
  submitLayout: (tableNumber: number, layoutId: string) => Promise<void>;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  isConnected: boolean;
}

interface UseMultiplayerPairingStateParams {
  pairingStateId: string;
  matchId: string;
  myTeamId: string;
  myTeam: ServerTeamId;  // '1' or '2' (server-side team identifier)
  initData: PairingInitData;
  readOnly?: boolean;
}

export function useMultiplayerPairingState({
  pairingStateId,
  matchId,
  myTeamId,
  myTeam,
  initData,
  readOnly,
}: UseMultiplayerPairingStateParams): MultiplayerPairingHook {
  const [state, setState] = useState<PairingState>(() => {
    const initial = hydratePairingState(createEmptyServerState(), initData);
    // In multiplayer, skip setup — go straight to round1-defender
    initial.currentPhase = 'round1-defender';
    return initial;
  });
  const [opponentAction, setOpponentAction] = useState<ActionMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // When user is server-side team 2, swap in hydration so user is always blue (UI team A)
  const swapTeams = myTeam === '2';

  // Keep a ref to initData so channel handlers always use the latest value
  const initDataRef = useRef(initData);
  initDataRef.current = initData;

  // In multiplayer, 'setup' is not a real phase — treat it as round1-defender
  const hydrateMultiplayer = useCallback((serverState: ServerPairingState) => {
    const hydrated = hydratePairingState(serverState, initDataRef.current, swapTeams);
    if (hydrated.currentPhase === 'setup') {
      hydrated.currentPhase = 'round1-defender';
    }
    return hydrated;
  }, [swapTeams]);

  const actionsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stateChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous phase to detect phase changes
  const prevPhaseRef = useRef<string>(state.currentPhase);
  // Skip the next phase-change reset when initial fetch rehydrated from transaction logs
  const skipNextPhaseResetRef = useRef(false);

  // Reset hasSubmitted when phase changes (new action required from user)
  useEffect(() => {
    if (prevPhaseRef.current !== state.currentPhase) {
      prevPhaseRef.current = state.currentPhase;
      if (skipNextPhaseResetRef.current) {
        skipNextPhaseResetRef.current = false;
      } else {
        setHasSubmitted(false);
      }
    }
  }, [state.currentPhase]);

  // Fetch state + transaction logs from API and rehydrate
  const fetchAndHydrate = useCallback(async () => {
    try {
      const res = await apiClient.get(`/pairings/${pairingStateId}/state`);
      if (res.data?.state) {
        const rawState = typeof res.data.state === 'string'
          ? JSON.parse(res.data.state)
          : res.data.state;
        // API may return PascalCase, normalize to camelCase
        const serverState = normalizeServerState(rawState);
        const hydrated = hydrateMultiplayer(serverState);

        // Apply transaction logs for rehydration
        // Logs tell us what this user's team already submitted in the current phase
        // before refreshing (the server state won't reflect it until both teams submit)
        const rawLogs = res.data.transactionLogs ?? res.data.TransactionLogs ?? null;
        const logs: PairingTransactionLog[] | null = rawLogs
          ? rawLogs.map((l: any) => ({
              transactionType: l.transactionType ?? l.TransactionType,
              entityId: l.entityId ?? l.EntityId,
            }))
          : null;
        if (logs && logs.length > 0) {
          applyTransactionLogs(hydrated, logs, initDataRef.current);
          skipNextPhaseResetRef.current = true;
          setState(hydrated);
          setHasSubmitted(true);
        } else {
          setState(hydrated);
          setHasSubmitted(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pairing state:', error);
    }
  }, [pairingStateId, hydrateMultiplayer]);

  // Fetch initial state
  useEffect(() => {
    fetchAndHydrate();
  }, [fetchAndHydrate]);

  // Subscribe to channels
  useEffect(() => {
    const subscribe = async () => {
      await setSupabaseRealtimeAuth();

      // Actions channel — cosmetic opponent animations
      const actionsChannel = supabase.channel(`actions:${matchId}`, {
        config: { broadcast: { self: true } },
      });

      actionsChannel
        .on('broadcast', { event: 'action' }, (payload) => {
          const msg = payload.payload as ActionMessage;
          setOpponentAction(msg);
          // Clear after animation time
          setTimeout(() => setOpponentAction(null), 2000);

          // ReadOnly: re-fetch state when own team acts to get updated transaction logs
          // Debounced to handle rapid broadcasts (e.g. attacker_1 + attacker_2) and
          // to ensure the API call has completed before fetching
          if (readOnly && msg.team === myTeam) {
            if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
            refetchTimerRef.current = setTimeout(() => fetchAndHydrate(), 500);
          }
        })
        .subscribe((status) => {
        });

      actionsChannelRef.current = actionsChannel;

      // State channel — authoritative state from postgres trigger
      const stateChannel = supabase.channel(`state:${matchId}`, {
        config: { private: true },
      });

      stateChannel
        .on('broadcast', { event: 'UPDATE' }, (payload: any) => {
          const pgPayload = payload.payload;
          const record = pgPayload?.record;
          if (record?.state) {
            const rawState = typeof record.state === 'string'
              ? JSON.parse(record.state)
              : record.state;
            const serverState = normalizeServerState(rawState);
            setState(hydrateMultiplayer(serverState));
          }
        })
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      stateChannelRef.current = stateChannel;
    };

    subscribe();

    return () => {
      if (actionsChannelRef.current) supabase.removeChannel(actionsChannelRef.current);
      if (stateChannelRef.current) supabase.removeChannel(stateChannelRef.current);
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
  }, [matchId]);

  // Send cosmetic action to opponent
  const broadcastAction = useCallback(async (msg: ActionMessage) => {
    if (actionsChannelRef.current) {
      await actionsChannelRef.current.send({
        type: 'broadcast',
        event: 'action',
        payload: msg,
      });
    }
  }, []);

  const getAvailablePlayers = useCallback((team: 'A' | 'B'): Player[] => {
    const teamData = team === 'A' ? state.teamA : state.teamB;
    return teamData.players.filter(
      p => state.playerStates.get(p.id) === 'available' || !state.playerStates.has(p.id)
    );
  }, [state]);

  const submitDefender = useCallback(async (playerId: string) => {
    setIsSubmitting(true);
    try {
      const request: SelectDefenderRequest = {
        teamId: myTeamId,
        defenderId: playerId,
      };
      await apiClient.post(`/pairings/${pairingStateId}/defender`, request);
      setHasSubmitted(true);
      await broadcastAction({ action: 'defender_played', team: myTeam });
    } catch (error) {
      console.error('Failed to submit defender:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [pairingStateId, myTeamId, myTeam, broadcastAction]);

  const submitAttackers = useCallback(async (playerIds: string[]) => {
    setIsSubmitting(true);
    try {
      const request: SelectAttackersRequest = {
        teamId: myTeamId,
        attackerIds: playerIds,
      };
      // Broadcast individual attacker animations
      await broadcastAction({ action: 'attacker_1_played', team: myTeam });
      setTimeout(() => broadcastAction({ action: 'attacker_2_played', team: myTeam }), 300);

      await apiClient.post(`/pairings/${pairingStateId}/attackers`, request);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Failed to submit attackers:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [pairingStateId, myTeamId, myTeam, broadcastAction]);

  const submitRefusal = useCallback(async (playerId: string) => {
    setIsSubmitting(true);
    try {
      const request: RefuseAttackerRequest = {
        teamId: myTeamId,
        attackerId: playerId,
      };
      await apiClient.post(`/pairings/${pairingStateId}/refuse`, request);
      setHasSubmitted(true);
      await broadcastAction({ action: 'refusal_played', team: myTeam });
    } catch (error) {
      console.error('Failed to submit refusal:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [pairingStateId, myTeamId, myTeam, broadcastAction]);

  const submitLayout = useCallback(async (tableNumber: number, layoutId: string) => {
    setIsSubmitting(true);
    try {
      const request: SelectLayoutRequest = {
        teamId: myTeamId,
        layoutId,
      };
      await apiClient.post(`/pairings/${pairingStateId}/layout`, request);
      setHasSubmitted(true);
      await broadcastAction({ action: 'layout_selected', team: myTeam, tableNumber });
    } catch (error) {
      console.error('Failed to submit layout:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [pairingStateId, myTeamId, myTeam, broadcastAction]);

  return {
    state,
    myTeam,
    opponentAction,
    getAvailablePlayers,
    submitDefender,
    submitAttackers,
    submitRefusal,
    submitLayout,
    isSubmitting,
    hasSubmitted,
    isConnected,
  };
}

/**
 * Apply transaction logs to the hydrated state.
 * Logs represent what this user's team already submitted in the current phase
 * before a page refresh. Since hydration swaps teams so our team is always A (blue),
 * the logs map to team A fields in the hydrated state.
 */
function applyTransactionLogs(
  state: PairingState,
  logs: PairingTransactionLog[],
  initData: PairingInitData,
) {
  const findPlayer = (id: string): Player | null =>
    initData.teamA.players.find(p => p.id === id) ??
    initData.teamB.players.find(p => p.id === id) ??
    null;

  const currentRound = state.currentPhase.includes('round1') ? state.round1 : state.round2;

  for (const log of logs) {
    const player = findPlayer(log.entityId);

    switch (log.transactionType) {
      case 'select_defender':
        if (player) {
          currentRound.teamADefender = player;
          state.playerStates.set(player.id, 'defender');
        }
        break;
      case 'select_attacker_1':
        if (player) {
          if (currentRound.teamAAttackers.length === 0) {
            currentRound.teamAAttackers = [player];
          } else {
            currentRound.teamAAttackers[0] = player;
          }
          state.playerStates.set(player.id, 'attacker');
        }
        break;
      case 'select_attacker_2':
        if (player) {
          if (currentRound.teamAAttackers.length < 2) {
            currentRound.teamAAttackers.push(player);
          } else {
            currentRound.teamAAttackers[1] = player;
          }
          state.playerStates.set(player.id, 'attacker');
        }
        break;
      case 'refuse_attacker':
        if (player) {
          currentRound.teamARefused = player;
        }
        break;
      case 'select_layout':
        // entityId is a layout ID, not a player
        // The layout will be handled by the existing layout hydration
        break;
    }
  }
}

export function createEmptyServerState(): ServerPairingState {
  const emptyRound = {
    team1Defender: null,
    team2Defender: null,
    team1Attackers: [],
    team2Attackers: [],
    team1Refused: null,
    team2Refused: null,
    team1Layout: null,
    team2Layout: null,
    team1LayoutTable: null,
    team2LayoutTable: null,
  };
  return {
    currentPhase: 'setup',
    coinflipWinner: null,
    currentLayoutPicker: null,
    round1: { ...emptyRound },
    round2: { ...emptyRound },
    pairings: [],
    availableLayoutIds: [],
  };
}

/**
 * Normalize server state from PascalCase to camelCase.
 * The C# backend serializes with PascalCase property names.
 */
export function normalizeServerState(raw: any): ServerPairingState {
  const normalizeRound = (r: any): ServerPairingState['round1'] => ({
    team1Defender: r?.Team1Defender ?? r?.team1Defender ?? null,
    team2Defender: r?.Team2Defender ?? r?.team2Defender ?? null,
    team1Attackers: r?.Team1Attackers ?? r?.team1Attackers ?? [],
    team2Attackers: r?.Team2Attackers ?? r?.team2Attackers ?? [],
    team1Refused: r?.Team1Refused ?? r?.team1Refused ?? null,
    team2Refused: r?.Team2Refused ?? r?.team2Refused ?? null,
    team1Layout: r?.Team1Layout ?? r?.team1Layout ?? null,
    team2Layout: r?.Team2Layout ?? r?.team2Layout ?? null,
    team1LayoutTable: r?.Team1LayoutTable ?? r?.team1LayoutTable ?? null,
    team2LayoutTable: r?.Team2LayoutTable ?? r?.team2LayoutTable ?? null,
  });

  const normalizePairing = (p: any) => ({
    tableNumber: p?.TableNumber ?? p?.tableNumber ?? 0,
    team1Player: p?.Team1Player ?? p?.team1Player ?? '',
    team2Player: p?.Team2Player ?? p?.team2Player ?? '',
    layoutId: p?.LayoutId ?? p?.layoutId ?? null,
    createdInRound: p?.CreatedInRound ?? p?.createdInRound ?? 1,
  });

  return {
    currentPhase: (raw?.CurrentPhase ?? raw?.currentPhase ?? 'setup') as ServerPairingState['currentPhase'],
    coinflipWinner: raw?.CoinflipWinner ?? raw?.coinflipWinner ?? null,
    currentLayoutPicker: raw?.CurrentLayoutPicker ?? raw?.currentLayoutPicker ?? null,
    round1: normalizeRound(raw?.Round1 ?? raw?.round1),
    round2: normalizeRound(raw?.Round2 ?? raw?.round2),
    pairings: (raw?.Pairings ?? raw?.pairings ?? []).map(normalizePairing),
    availableLayoutIds: raw?.AvailableLayoutIds ?? raw?.availableLayoutIds ?? [],
  };
}
