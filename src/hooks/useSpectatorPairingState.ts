import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, setSupabaseRealtimeAuth } from '@/src/components/supabase/supabase';
import apiClient from '@/src/components/httpClient/httpClient';
import { PairingInitData } from '@/src/hooks/usePairingState';
import { hydratePairingState } from '@/src/utils/pairingStateHydrator';
import { createEmptyServerState, normalizeServerState } from '@/src/hooks/useMultiplayerPairingState';
import {
  PairingState,
  ActionMessage,
  Player,
} from '@/src/types/pairing';

export interface SpectatorPairingHook {
  state: PairingState;
  opponentAction: ActionMessage | null;
  getAvailablePlayers: (team: 'A' | 'B') => Player[];
  isConnected: boolean;
}

interface UseSpectatorPairingStateParams {
  pairingStateId: string;
  matchId: string;
  initData: PairingInitData;
}

export function useSpectatorPairingState({
  pairingStateId,
  matchId,
  initData,
}: UseSpectatorPairingStateParams): SpectatorPairingHook {
  const [state, setState] = useState<PairingState>(() => {
    const initial = hydratePairingState(createEmptyServerState(), initData, false);
    initial.currentPhase = 'round1-defender';
    return initial;
  });
  const [opponentAction, setOpponentAction] = useState<ActionMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initDataRef = useRef(initData);
  initDataRef.current = initData;

  const hydrateSpectator = useCallback((serverState: Parameters<typeof hydratePairingState>[0]) => {
    const hydrated = hydratePairingState(serverState, initDataRef.current, false);
    if (hydrated.currentPhase === 'setup') {
      hydrated.currentPhase = 'round1-defender';
    }
    return hydrated;
  }, []);

  // Fetch initial state from API
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await apiClient.get(`/pairings/${pairingStateId}/state`);
        if (res.data?.state) {
          const rawState = typeof res.data.state === 'string'
            ? JSON.parse(res.data.state)
            : res.data.state;
          const serverState = normalizeServerState(rawState);
          setState(hydrateSpectator(serverState));
        }
      } catch (error) {
        console.error('[Spectator] Failed to fetch pairing state:', error);
      }
    };

    fetchState();
  }, [pairingStateId]);

  // Refs for cleanup
  const actionsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stateChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to channels
  useEffect(() => {
    const subscribe = async () => {
      await setSupabaseRealtimeAuth();

      // Actions channel — all actions trigger animation for spectators
      const actionsChannel = supabase.channel(`actions:${matchId}`, {
        config: { broadcast: { self: true } },
      });

      actionsChannel
        .on('broadcast', { event: 'action' }, (payload) => {
          const msg = payload.payload as ActionMessage;
          setOpponentAction(msg);
          setTimeout(() => setOpponentAction(null), 2000);
        })
        .subscribe();

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
            setState(hydrateSpectator(serverState));
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
    };
  }, [matchId]);

  const getAvailablePlayers = useCallback((team: 'A' | 'B'): Player[] => {
    const teamData = team === 'A' ? state.teamA : state.teamB;
    return teamData.players.filter(
      p => state.playerStates.get(p.id) === 'available' || !state.playerStates.has(p.id)
    );
  }, [state]);

  return {
    state,
    opponentAction,
    getAvailablePlayers,
    isConnected,
  };
}
