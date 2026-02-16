import { View, ScrollView, useWindowDimensions, Image, Pressable } from 'react-native';
import { StyledText, Button } from '@/src/components/pairings/styled';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import { usePairingState, PairingInitData } from '@/src/hooks/usePairingState';
import { FactionIcon, hasFactionIcon } from '@/src/components/FactionIcon';
import { useState, useEffect, useRef } from 'react';
import CardHand from '@/src/components/pairings/CardHand';
import PlayerCard from '@/src/components/pairings/PlayerCard';
import PairingBoard from '@/src/components/pairings/PairingBoard';
import PhaseIndicator from '@/src/components/pairings/PhaseIndicator';
import CompactBattleGrid, { SlotState } from '@/src/components/pairings/CompactBattleGrid';
import { SlotType } from '@/src/components/pairings/CardSlot';
import { Player, TableLayout, Pairing } from '@/src/types/pairing';
import { MultiplayerPairingHook } from '@/src/hooks/useMultiplayerPairingState';
import { SpectatorPairingHook } from '@/src/hooks/useSpectatorPairingState';
import AnimatedCardTransitionMoti from '@/src/components/pairings/AnimatedCardTransitionMoti';
import CardHandsSidebar from '@/src/components/pairings/CardHandsSidebar';
import CardHandModal from '@/src/components/pairings/CardHandModal';
import RotateDeviceOverlay from '@/src/components/pairings/RotateDeviceOverlay';
import LayoutSelectionModal from '@/src/components/pairings/LayoutSelectionModal';

interface PairingGameProps {
  initData: PairingInitData;
  getLayoutImageSource: (layout: TableLayout) => any;
  onComplete?: (pairings: Pairing[]) => void;
  onReset?: () => void;
  mode?: 'local' | 'multiplayer' | 'spectator';
  readOnly?: boolean;
  multiplayerState?: MultiplayerPairingHook;
  spectatorState?: SpectatorPairingHook;
}

export default function PairingGame({ initData, getLayoutImageSource, onComplete, onReset, mode = 'local', readOnly, multiplayerState, spectatorState }: PairingGameProps) {
  const theme = usePairingTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 900;

  const isMultiplayer = mode === 'multiplayer' && !!multiplayerState;
  const isSpectator = mode === 'spectator' && !!spectatorState;
  const isReadOnly = isMultiplayer && readOnly === true;
  const isPassive = isSpectator || isReadOnly;

  const localPairing = usePairingState(initData);

  // In multiplayer/spectator mode, use server-driven state; in local mode, use local state + AI
  const state = isSpectator ? spectatorState.state
               : isMultiplayer ? multiplayerState.state
               : localPairing.state;
  const getAvailablePlayers = isSpectator ? spectatorState.getAvailablePlayers
                             : isMultiplayer ? multiplayerState.getAvailablePlayers
                             : localPairing.getAvailablePlayers;
  const reset = localPairing.reset;

  // Slot-based state management (compact card slots)
  const [slots, setSlots] = useState<SlotState>({
    blueDefender: null,
    blueAttacker1: null,
    blueAttacker2: null,
    redDefender: null,
    redAttacker1: null,
    redAttacker2: null,
  });

  const [revealedSlots, setRevealedSlots] = useState<Set<keyof SlotState>>(new Set());

  // Hand expansion state - only one hand can be expanded at a time
  const [expandedHand, setExpandedHand] = useState<'blue' | 'red' | null>(null);
  const [selectedHandCard, setSelectedHandCard] = useState<Player | null>(null);
  const [refusalSlotSelection, setRefusalSlotSelection] = useState<SlotType | null>(null);

  // Modal state for mobile card hand expansion
  const [modalOpen, setModalOpen] = useState<'blue' | 'red' | null>(null);

  // State for viewing remaining layouts
  const [showLayoutsViewer, setShowLayoutsViewer] = useState(false);

  // Track last layout selection for feedback message
  const [lastLayoutSelection, setLastLayoutSelection] = useState<{
    team: 'A' | 'B';
    layout: TableLayout;
    tableNumber: number;
  } | null>(null);

  // Track which cards are placed in slots (for filtering blue hand)
  const [placedBlueCards, setPlacedBlueCards] = useState<Set<string>>(new Set());

  // Store the selected card's measured position (FLIP technique - First step)
  const [selectedCardPosition, setSelectedCardPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const selectedCardRef = useRef<any>(null);

  // Animation state
  const [animatingCard, setAnimatingCard] = useState<{
    player: Player;
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    faceDown: boolean;
  } | null>(null);
  const [pendingSlotPlacement, setPendingSlotPlacement] = useState<{
    slotType: SlotType;
    player: Player;
    previousCard: Player | null;
  } | null>(null);

  // Log messages for mobile sidebar
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const addLogMessage = (msg: string) => {
    setLogMessages(prev => [...prev.slice(-9), msg]);
  };

  // Refs for measuring positions
  const blueHandRef = useRef<any>(null);
  const redHandRef = useRef<any>(null);
  const slotRefs = useRef<{ [key: string]: any }>({});

  // Track previous phase for multiplayer state transition detection
  const prevPhaseRef = useRef(state.currentPhase);

  // Track the previous phase to detect phase changes
  const prevPhaseForSyncRef = useRef<string | null>(null);

  // Multiplayer: Sync slots from server state
  // This ensures cards are in the right slots when rejoining mid-game or when phase advances
  // Also replaces placeholder cards with real data when server state is available
  useEffect(() => {
    if (!isMultiplayer && !isSpectator) return;

    const currentRound = state.currentPhase.includes('round1') ? state.round1 : state.round2;
    const phase = state.currentPhase;
    const prevPhase = prevPhaseForSyncRef.current;
    const phaseChanged = prevPhase !== phase || prevPhase === null;
    prevPhaseForSyncRef.current = phase;

    // Update slots based on server state, replacing placeholders with real data
    setSlots(prev => {
      const newSlots = { ...prev };
      let changed = false;

      // Clear slots when entering a new round (don't return early — let rehydration logic run)
      if (phaseChanged && phase === 'round2-defender') {
        newSlots.blueDefender = null;
        newSlots.blueAttacker1 = null;
        newSlots.blueAttacker2 = null;
        newSlots.redDefender = null;
        newSlots.redAttacker1 = null;
        newSlots.redAttacker2 = null;
        changed = true;
      }

      // During layout-select, show the pairings that were just created (not cleared slots)
      // This helps users see which matchups they're selecting layouts for
      if (phase.includes('layout-select')) {
        // Return prev to skip the setSlots here - we'll handle layout-select separately below
        return prev;
      }

      // Helper to check if a slot needs updating (is placeholder or null when data exists)
      const isPlaceholder = (player: Player | null) => !player || player.id === '__opponent__';

      // During current selection phase: sync own cards from transaction log rehydration
      // (state populated from logs, slot still empty after page refresh)
      if (phase.includes('defender') && !phase.includes('reveal')) {
        if (currentRound.teamADefender && !prev.blueDefender) {
          newSlots.blueDefender = currentRound.teamADefender;
          changed = true;
        }
      }
      if (phase.includes('attackers') && !phase.includes('reveal')) {
        if (currentRound.teamAAttackers.length >= 1 && !prev.blueAttacker1) {
          newSlots.blueAttacker1 = currentRound.teamAAttackers[0];
          changed = true;
        }
        if (currentRound.teamAAttackers.length >= 2 && !prev.blueAttacker2) {
          newSlots.blueAttacker2 = currentRound.teamAAttackers[1];
          changed = true;
        }
      }

      // After defender selection phase (includes reveal), defenders should be in slots
      // Note: 'defender-reveal' contains 'defender' so we need to explicitly include 'reveal' phases
      const pastDefenderPhase = !phase.includes('defender') || phase.includes('reveal') || phase.includes('refuse') || phase.includes('attackers') || phase.includes('layout') || phase.includes('complete');
      if (pastDefenderPhase) {
        // Set blue defender from state (user's own defender)
        if (currentRound.teamADefender && (isPlaceholder(prev.blueDefender) || phaseChanged)) {
          newSlots.blueDefender = currentRound.teamADefender;
          changed = true;
        }
        // Set red defender from state, replacing any placeholder
        if (currentRound.teamBDefender && (isPlaceholder(prev.redDefender) || phaseChanged)) {  
          newSlots.redDefender = currentRound.teamBDefender;
          changed = true;
        }
      }

      // After attackers selection phase (includes reveal), attackers should be in slots
      const pastAttackersPhase = phase.includes('attackers-reveal') || phase.includes('refuse') || phase.includes('layout') || phase.includes('complete');
      if (pastAttackersPhase) {
        if (currentRound.teamAAttackers.length >= 1 && (isPlaceholder(prev.blueAttacker1) || phaseChanged)) {
          newSlots.blueAttacker1 = currentRound.teamAAttackers[0];
          changed = true;
        }
        if (currentRound.teamAAttackers.length >= 2 && (isPlaceholder(prev.blueAttacker2) || phaseChanged)) {
          newSlots.blueAttacker2 = currentRound.teamAAttackers[1];
          changed = true;
        }
        if (currentRound.teamBAttackers.length >= 1 && (isPlaceholder(prev.redAttacker1) || phaseChanged)) {
          newSlots.redAttacker1 = currentRound.teamBAttackers[0];
          changed = true;
        }
        if (currentRound.teamBAttackers.length >= 2 && (isPlaceholder(prev.redAttacker2) || phaseChanged)) {
          newSlots.redAttacker2 = currentRound.teamBAttackers[1];
          changed = true;
        }
      }

      // Always try to replace placeholder opponent cards when real data is available
      // This handles the case where animation placed placeholder but state update arrived later
      const isPlaceholderCard = (player: Player | null) =>
        player && player.id === '__opponent__';

      if (isPlaceholderCard(prev.redDefender) && currentRound.teamBDefender) {
        newSlots.redDefender = currentRound.teamBDefender;
        changed = true;
      }
      if (isPlaceholderCard(prev.redAttacker1) && currentRound.teamBAttackers.length >= 1) {
        newSlots.redAttacker1 = currentRound.teamBAttackers[0];
        changed = true;
      }
      if (isPlaceholderCard(prev.redAttacker2) && currentRound.teamBAttackers.length >= 2) {
        newSlots.redAttacker2 = currentRound.teamBAttackers[1];
        changed = true;
      }

      // Spectator: also replace blue team placeholders
      if (isSpectator) {
        if (isPlaceholderCard(prev.blueDefender) && currentRound.teamADefender) {
          newSlots.blueDefender = currentRound.teamADefender;
          changed = true;
        }
        if (isPlaceholderCard(prev.blueAttacker1) && currentRound.teamAAttackers.length >= 1) {
          newSlots.blueAttacker1 = currentRound.teamAAttackers[0];
          changed = true;
        }
        if (isPlaceholderCard(prev.blueAttacker2) && currentRound.teamAAttackers.length >= 2) {
          newSlots.blueAttacker2 = currentRound.teamAAttackers[1];
          changed = true;
        }
      }

      return changed ? newSlots : prev;
    });

    // Layout-select phase is handled by a dedicated effect that works for both local and multiplayer
    if (phase.includes('layout-select')) {
      return;
    }

    // Update revealed slots and placed blue cards
    setRevealedSlots(prev => {
      const newRevealed = new Set(prev);
      const pastDefenderPhase = !phase.includes('defender') || phase.includes('reveal') || phase.includes('refuse') || phase.includes('attackers') || phase.includes('layout') || phase.includes('complete');
      if (pastDefenderPhase && currentRound.teamBDefender) {
        newRevealed.add('redDefender');
      }
      // Spectator: also reveal blue cards at same time
      if (isSpectator && pastDefenderPhase && currentRound.teamADefender) {
        newRevealed.add('blueDefender');
      }
      const pastAttackersPhase = phase.includes('attackers-reveal') || phase.includes('refuse') || phase.includes('layout') || phase.includes('complete');
      if (pastAttackersPhase) {
        if (currentRound.teamBAttackers.length >= 1) newRevealed.add('redAttacker1');
        if (currentRound.teamBAttackers.length >= 2) newRevealed.add('redAttacker2');
        // Spectator: also reveal blue attackers
        if (isSpectator) {
          if (currentRound.teamAAttackers.length >= 1) newRevealed.add('blueAttacker1');
          if (currentRound.teamAAttackers.length >= 2) newRevealed.add('blueAttacker2');
        }
      }
      if (phase === 'round2-defender' || phase.includes('layout-select')) {
        return new Set();
      }
      return newRevealed;
    });

    setPlacedBlueCards(prev => {
      // Start fresh for new round or layout-select; otherwise carry forward
      const newPlaced = (phase === 'round2-defender' || phase.includes('layout-select'))
        ? new Set<string>()
        : new Set(prev);

      // During current phase: track own cards from transaction log rehydration
      if (phase.includes('defender') && !phase.includes('reveal') && currentRound.teamADefender) {
        newPlaced.add(currentRound.teamADefender.id);
      }
      if (phase.includes('attackers') && !phase.includes('reveal')) {
        if (currentRound.teamAAttackers.length >= 1) newPlaced.add(currentRound.teamAAttackers[0].id);
        if (currentRound.teamAAttackers.length >= 2) newPlaced.add(currentRound.teamAAttackers[1].id);
      }

      const pastDefenderPhase = !phase.includes('defender') || phase.includes('reveal') || phase.includes('refuse') || phase.includes('attackers') || phase.includes('layout') || phase.includes('complete');
      if (pastDefenderPhase && currentRound.teamADefender) {
        newPlaced.add(currentRound.teamADefender.id);
      }
      const pastAttackersPhase = phase.includes('attackers-reveal') || phase.includes('refuse') || phase.includes('layout') || phase.includes('complete');
      if (pastAttackersPhase) {
        if (currentRound.teamAAttackers.length >= 1) newPlaced.add(currentRound.teamAAttackers[0].id);
        if (currentRound.teamAAttackers.length >= 2) newPlaced.add(currentRound.teamAAttackers[1].id);
      }
      return newPlaced;
    });
  }, [isMultiplayer, isSpectator, state.currentPhase, state.round1, state.round2, state.pairings]);

  // Update slots during layout-select phase (works for BOTH local and multiplayer)
  // Shows role-based positions: defenders in defender slots, accepted attackers in attacker slots
  useEffect(() => {
    const phase = state.currentPhase;
    if (!phase.includes('layout-select')) return;

    const isRound1 = phase === 'round1-layout-select';
    const currentRound = isRound1 ? state.round1 : state.round2;

    // Get accepted attackers (the ones that weren't refused)
    const blueAcceptedAttacker = currentRound.teamAAttackers.find(
      p => p.id !== currentRound.teamBRefused?.id
    ) || null;
    const redAcceptedAttacker = currentRound.teamBAttackers.find(
      p => p.id !== currentRound.teamARefused?.id
    ) || null;

    // Show defenders in defender slots, accepted attackers in attacker slots
    setSlots({
      blueDefender: currentRound.teamADefender,
      redDefender: currentRound.teamBDefender,
      blueAttacker1: blueAcceptedAttacker,
      redAttacker1: redAcceptedAttacker,
      blueAttacker2: null, // Refused attackers are not shown
      redAttacker2: null,
    });
    // All cards should be revealed during layout-select
    setRevealedSlots(new Set(['blueDefender', 'redDefender', 'blueAttacker1', 'redAttacker1']));
  }, [state.currentPhase, state.round1, state.round2]);

  // Multiplayer/Spectator: reset slots when server advances to a new round or layout phase
  useEffect(() => {
    if (!isMultiplayer && !isSpectator) {
      prevPhaseRef.current = state.currentPhase;
      return;
    }

    const prev = prevPhaseRef.current;
    const curr = state.currentPhase;
    prevPhaseRef.current = curr;

    // On reveal phases, show the opponent's cards in slots from server state
    if (curr.includes('defender-reveal') && !prev.includes('defender-reveal')) {
      const currentRound = curr.includes('round1') ? state.round1 : state.round2;
      if (currentRound.teamBDefender) {
        setSlots(s => ({ ...s, redDefender: currentRound.teamBDefender }));
        setRevealedSlots(s => new Set(s).add('redDefender'));
      }
      // Spectator: also reveal blue defender
      if (isSpectator && currentRound.teamADefender) {
        setSlots(s => ({ ...s, blueDefender: currentRound.teamADefender }));
        setRevealedSlots(s => new Set(s).add('blueDefender'));
      }
    }

    if (curr.includes('attackers-reveal') && !prev.includes('attackers-reveal')) {
      const currentRound = curr.includes('round1') ? state.round1 : state.round2;
      if (currentRound.teamBAttackers.length === 2) {
        setSlots(s => ({
          ...s,
          redAttacker1: currentRound.teamBAttackers[0],
          redAttacker2: currentRound.teamBAttackers[1],
        }));
        setRevealedSlots(s => new Set(s).add('redAttacker1').add('redAttacker2'));
      }
      // Spectator: also reveal blue attackers
      if (isSpectator && currentRound.teamAAttackers.length === 2) {
        setSlots(s => ({
          ...s,
          blueAttacker1: currentRound.teamAAttackers[0],
          blueAttacker2: currentRound.teamAAttackers[1],
        }));
        setRevealedSlots(s => new Set(s).add('blueAttacker1').add('blueAttacker2'));
      }
    }

    // On new round, reset revealed slots and refusal selection
    // (slot clearing and placedBlueCards are handled by the main slot sync effect)
    if (curr === 'round2-defender' && prev !== 'round2-defender') {
      setRevealedSlots(new Set());
      setRefusalSlotSelection(null);
    }
  }, [state.currentPhase, isMultiplayer, isSpectator]);

  // Multiplayer: rehydrate refusal selection from transaction logs
  // When the user submitted a refusal then refreshed, teamARefused is populated from logs
  // but refusalSlotSelection (local state) needs to be matched to the correct slot
  useEffect(() => {
    if (!isMultiplayer) return;
    const phase = state.currentPhase;
    if (!phase.includes('refuse')) return;

    const currentRound = phase.includes('round1') ? state.round1 : state.round2;
    if (!currentRound.teamARefused || refusalSlotSelection) return;

    if (slots.redAttacker1?.id === currentRound.teamARefused.id) {
      setRefusalSlotSelection('redAttacker1');
    } else if (slots.redAttacker2?.id === currentRound.teamARefused.id) {
      setRefusalSlotSelection('redAttacker2');
    }
  }, [isMultiplayer, state.currentPhase, state.round1, state.round2, slots.redAttacker1, slots.redAttacker2, refusalSlotSelection]);

  // Multiplayer/Spectator: animate face-down card when an action is played
  const lastAnimatedActionRef = useRef<object | null>(null);
  useEffect(() => {
    const opponentAction = isSpectator ? spectatorState?.opponentAction
                          : isMultiplayer ? multiplayerState?.opponentAction
                          : null;
    if (!opponentAction) return;

    const action = opponentAction;
    // Skip if we already animated this exact action object
    if (action === lastAnimatedActionRef.current) return;
    // Multiplayer: only animate opponent's actions (not our own)
    if (isMultiplayer && action.team === multiplayerState!.myTeam) return;
    // Don't queue if an animation is already playing
    if (animatingCard) return;

    lastAnimatedActionRef.current = action;

    // Spectator: determine which team the action belongs to
    const isTeam1Action = action.team === '1';
    const isBlueAction = isSpectator ? isTeam1Action : false;

    const faceDownPlayer: Player = {
      id: '__opponent__',
      username: '?',
      color: isBlueAction ? '#3b82f6' : '#ef4444',
      team: isBlueAction ? 'A' : 'B',
    };

    const animateToSlot = (slotType: SlotType) => {
      const handRef = isBlueAction ? blueHandRef : redHandRef;
      const slotRef = slotRefs.current[slotType];

      if (!handRef?.current || !slotRef) return;

      handRef.current.measureInWindow((handX: number, handY: number) => {
        slotRef.measureInWindow((slotX: number, slotY: number) => {
          setPendingSlotPlacement({ slotType, player: faceDownPlayer, previousCard: null });
          setAnimatingCard({
            player: faceDownPlayer,
            startPos: { x: handX, y: handY },
            endPos: { x: slotX, y: slotY },
            faceDown: true,
          });
        });
      });
    };

    if (action.action === 'defender_played') {
      animateToSlot(isBlueAction ? 'blueDefender' : 'redDefender');
    } else if (action.action === 'attacker_1_played') {
      animateToSlot(isBlueAction ? 'blueAttacker1' : 'redAttacker1');
    } else if (action.action === 'attacker_2_played') {
      animateToSlot(isBlueAction ? 'blueAttacker2' : 'redAttacker2');
    }
  }, [isMultiplayer, isSpectator, multiplayerState?.opponentAction, spectatorState?.opponentAction, animatingCard]);

  // Call onComplete when results phase is reached
  useEffect(() => {
    if (state.currentPhase === 'results' && onComplete) {
      onComplete(state.pairings);
    }
  }, [state.currentPhase]);

  // Sync AI selections from state to slots (with animation)
  useEffect(() => {
    // Only sync during reveal phases
    if (!state.currentPhase.includes('reveal') || animatingCard) {
      return;
    }

    const currentRound = state.currentPhase.includes('round1') ? state.round1 : state.round2;

    // Helper to animate a card from red hand to slot (FLIP technique)
    const animateRedCard = (player: Player, slotType: SlotType) => {
      const handRef = redHandRef;
      const slotRef = slotRefs.current[slotType];

      if (!handRef?.current || !slotRef) {
        console.error('Missing refs for red card animation');
        // Fallback: place immediately
        setSlots(prev => ({ ...prev, [slotType]: player }));
        return;
      }

      // FLIP - First: Measure collapsed hand position
      handRef.current.measureInWindow((handX: number, handY: number, _handWidth: number, _handHeight: number) => {
        // FLIP - Last: Measure destination slot position
        slotRef.measureInWindow((slotX: number, slotY: number, _slotWidth: number, _slotHeight: number) => {
          const startPos = { x: handX, y: handY };
          const endPos = { x: slotX, y: slotY };

          setPendingSlotPlacement({
            slotType,
            player,
            previousCard: null,
          });

          setAnimatingCard({
            player,
            startPos,
            endPos,
            faceDown: true,
          });
        });
      });
    };

    // Sync defender with animation
    if (currentRound.teamBDefender && !slots.redDefender && state.currentPhase.includes('defender-reveal')) {
      animateRedCard(currentRound.teamBDefender, 'redDefender');
    }

    // Sync attackers with animation
    if (currentRound.teamBAttackers.length === 2 && !slots.redAttacker1 && !slots.redAttacker2 && state.currentPhase.includes('attackers-reveal')) {
      animateRedCard(currentRound.teamBAttackers[0], 'redAttacker1');

      setTimeout(() => {
        animateRedCard(currentRound.teamBAttackers[1], 'redAttacker2');
      }, 300);
    }
  }, [state.round1, state.round2, state.currentPhase, slots.redDefender, slots.redAttacker1, slots.redAttacker2, animatingCard]);

  // Handle toggling blue hand expansion (auto-collapses red)
  const handleToggleBlueHand = () => {
    if (expandedHand === 'blue') {
      setExpandedHand(null);
      setSelectedHandCard(null);
    } else {
      setExpandedHand('blue');
    }
  };

  // Handle toggling red hand expansion (auto-collapses blue)
  const handleToggleRedHand = () => {
    setExpandedHand(prev => prev === 'red' ? null : 'red');
  };

  // Modal handlers for mobile card hand expansion
  const handleOpenBlueModal = () => {
    setModalOpen('blue');
  };

  const handleOpenRedModal = () => {
    setModalOpen('red');
  };

  const handleCloseModal = () => {
    setModalOpen(null);
  };

  const handleModalCardPress = (player: Player) => {
    if (modalOpen === 'blue') {
      setSelectedHandCard(player);
      setModalOpen(null);
    } else {
      setModalOpen(null);
    }
  };

  // Handle card selected from hand
  const handleCardSelected = (player: Player, cardRef: any) => {
    if (selectedHandCard?.id === player.id) {
      setSelectedHandCard(null);
      setSelectedCardPosition(null);
      selectedCardRef.current = null;
    } else {
      setSelectedHandCard(player);
      selectedCardRef.current = cardRef;

      if (cardRef && typeof cardRef.measureInWindow === 'function') {
        cardRef.measureInWindow((x: number, y: number, width: number, height: number) => {
          setSelectedCardPosition({ x, y, width, height });
        });
      }
    }
  };

  // Whether to show card hands sidebar on mobile
  const showMobileCardHands = isMobile &&
    state.currentPhase !== 'setup' &&
    state.currentPhase !== 'results';

  // Auto-advance intermediate phases (local mode only — multiplayer is server-driven)
  useEffect(() => {
    if (isMultiplayer || isSpectator) return;

    const autoAdvancePhases = [
      'round1-coin-flip',
      'round1-complete',
      'round2-complete',
      'round3-auto-pair',
    ];

    if (autoAdvancePhases.includes(state.currentPhase)) {
      const timer = setTimeout(() => {
        if (state.currentPhase === 'round1-coin-flip') {
          localPairing.flipCoin();
          localPairing.advancePhase();
        } else if (state.currentPhase === 'round1-complete' || state.currentPhase === 'round2-complete') {
          localPairing.advancePhase();
        } else if (state.currentPhase === 'round3-auto-pair') {
          localPairing.autoPairLastPlayers();
          localPairing.advancePhase();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.currentPhase, isMultiplayer]);

  // Layout selection phase flow (local mode only — multiplayer is server-driven)
  useEffect(() => {
    if (isMultiplayer || isSpectator) return;

    if (state.currentPhase === 'round1-layout-select' || state.currentPhase === 'round2-layout-select') {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const tableOffset = isRound1 ? 0 : 2;

      const firstPicker = isRound1 ? state.coinflipWinner : (state.coinflipWinner === 'A' ? 'B' : 'A');
      const secondPicker = firstPicker === 'A' ? 'B' : 'A';

      const roundPairings = state.pairings.filter(p =>
        p.tableNumber === tableOffset + 1 || p.tableNumber === tableOffset + 2
      );
      const assignedCount = roundPairings.filter(p => p.layout).length;

      if (assignedCount === 0 && !state.currentLayoutPicker) {
        setTimeout(() => {
          localPairing.setLayoutPicker(firstPicker!, tableOffset + 1);
        }, 1500);
      } else if (assignedCount === 1 && !state.currentLayoutPicker) {
        setTimeout(() => {
          localPairing.setLayoutPicker(secondPicker!, tableOffset + 2);
        }, 1000);
      } else if (assignedCount === 2) {
        if (!lastLayoutSelection || lastLayoutSelection.team === 'A') {
          localPairing.advancePhase();
        }
      }
    }
  }, [state.currentPhase, state.pairings, state.currentLayoutPicker, state.coinflipWinner, lastLayoutSelection, isMultiplayer]);

  // Wrapper for selectLayout that also shows feedback message
  const handleSelectLayout = (tableNumber: number, layout: TableLayout, team: 'A' | 'B') => {
    if (isMultiplayer) {
      multiplayerState.submitLayout(tableNumber, layout.id);
    } else {
      localPairing.selectLayout(tableNumber, layout);
    }
    setLastLayoutSelection({ team, layout, tableNumber });
  };

  // AI layout selection - local mode only (in multiplayer, opponent selects via server)
  useEffect(() => {
    if (isMultiplayer || isSpectator) return;

    if (state.currentLayoutPicker === 'B' && state.pendingLayoutForTable && state.availableLayouts.length > 0) {
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * state.availableLayouts.length);
        const selectedLayout = state.availableLayouts[randomIndex];
        handleSelectLayout(state.pendingLayoutForTable!, selectedLayout, 'B');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.currentLayoutPicker, state.pendingLayoutForTable, state.availableLayouts, isMultiplayer]);

  // Clear layout selection feedback after delay
  useEffect(() => {
    if (lastLayoutSelection) {
      const timer = setTimeout(() => {
        setLastLayoutSelection(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastLayoutSelection]);

  // Update log messages when phase changes (mobile sidebar)
  useEffect(() => {
    const getPhaseLogMessage = (): string | null => {
      if (isPassive) {
        switch (state.currentPhase) {
          case 'round1-defender':
          case 'round2-defender':
            return 'Teams selecting defenders...';
          case 'round1-defender-reveal':
          case 'round2-defender-reveal':
            return 'Revealing defenders...';
          case 'round1-attackers':
          case 'round2-attackers':
            return 'Teams selecting attackers...';
          case 'round1-attackers-reveal':
          case 'round2-attackers-reveal':
            return 'Revealing attackers...';
          case 'round1-coin-flip':
            return 'Coin flip for table choice...';
          case 'round1-refuse':
          case 'round2-refuse':
            return 'Teams selecting refusals...';
          case 'round1-layout-select':
          case 'round2-layout-select':
            return 'Selecting table layouts...';
          case 'round1-complete':
            return 'Round 1 complete!';
          case 'round2-complete':
            return 'Round 2 complete!';
          case 'round3-auto-pair':
            return 'Auto-pairing final players...';
          case 'results':
            return 'All pairings complete!';
          default:
            return null;
        }
      }
      switch (state.currentPhase) {
        case 'round1-defender':
        case 'round2-defender':
          return 'Select 1 defender from hand';
        case 'round1-defender-reveal':
        case 'round2-defender-reveal':
          return 'Revealing defenders...';
        case 'round1-attackers':
        case 'round2-attackers':
          return 'Select 2 attackers from hand';
        case 'round1-attackers-reveal':
        case 'round2-attackers-reveal':
          return 'Revealing attackers...';
        case 'round1-coin-flip':
          return 'Coin flip for table choice...';
        case 'round1-refuse':
        case 'round2-refuse':
          return 'Tap red slot to refuse';
        case 'round1-layout-select':
        case 'round2-layout-select':
          return 'Select table layouts';
        case 'round1-complete':
          return 'Round 1 complete!';
        case 'round2-complete':
          return 'Round 2 complete!';
        case 'round3-auto-pair':
          return 'Auto-pairing final players...';
        case 'results':
          return 'All pairings complete!';
        default:
          return null;
      }
    };

    const msg = getPhaseLogMessage();
    if (msg) {
      setLogMessages(prev => [...prev.slice(-9), msg]);
    }
  }, [state.currentPhase, isPassive]);

  // Log layout picker changes
  useEffect(() => {
    if (state.currentPhase.includes('layout-select')) {
      if (state.currentLayoutPicker === 'A' && state.pendingLayoutForTable) {
        if (isPassive) {
          addLogMessage(`${state.teamA.name} selecting layout...`);
        } else {
          addLogMessage(`Select layout for Table ${state.pendingLayoutForTable}`);
        }
      } else if (state.currentLayoutPicker === 'B') {
        addLogMessage(`${state.teamB.name} selecting layout...`);
      }
    }
  }, [state.currentLayoutPicker, state.pendingLayoutForTable, state.currentPhase, isPassive]);

  // Log coin flip winner and refusals
  useEffect(() => {
    if (state.currentPhase.includes('layout-select') && !state.currentLayoutPicker) {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const roundState = isRound1 ? state.round1 : state.round2;
      const firstPicker = state.coinflipWinner;
      if (firstPicker) {
        const teamName = firstPicker === 'A' ? state.teamA.name : state.teamB.name;
        if (isRound1) {
          addLogMessage(`${teamName} wins coin flip!`);
        } else {
          addLogMessage(`${teamName} picks first`);
        }
      }
      // Spectators/ReadOnly see both teams' refusals; participants only see opponent's
      if (isPassive) {
        if (roundState.teamARefused) {
          addLogMessage(`${state.teamA.name} refused ${roundState.teamARefused.faction || roundState.teamARefused.username || 'player'}`);
        }
        if (roundState.teamBRefused) {
          addLogMessage(`${state.teamB.name} refused ${roundState.teamBRefused.faction || roundState.teamBRefused.username || 'player'}`);
        }
      } else {
        if (roundState.teamBRefused) {
          addLogMessage(`${state.teamB.name} refused ${roundState.teamBRefused.faction || roundState.teamBRefused.username || 'player'}`);
        }
      }
    }
  }, [state.currentPhase, state.coinflipWinner, isPassive]);

  // Log when a team picks a layout
  useEffect(() => {
    if (!lastLayoutSelection) return;
    const layoutName = lastLayoutSelection.layout.name;
    if (isPassive) {
      // Spectators/ReadOnly see both teams' picks
      const teamName = lastLayoutSelection.team === 'A' ? state.teamA.name : state.teamB.name;
      addLogMessage(`${teamName} picked ${layoutName} for T${lastLayoutSelection.tableNumber}`);
    } else if (lastLayoutSelection.team === 'B') {
      addLogMessage(`${state.teamB.name} picked ${layoutName} for T${lastLayoutSelection.tableNumber}`);
    }
  }, [lastLayoutSelection, isPassive]);

  // Handle clicking a slot (with selected card) - FLIP technique
  const handleSlotClick = (slotType: SlotType, clickX: number, clickY: number) => {
    if (selectedHandCard && !animatingCard) {
      const previousCard = slots[slotType];

      const slotRef = slotRefs.current[slotType];
      if (!slotRef) {
        console.error('Missing slot ref for animation');
        setSlots(prev => ({ ...prev, [slotType]: selectedHandCard }));
        setPlacedBlueCards(prev => {
          const updated = new Set(prev);
          if (previousCard && previousCard.team === 'A') {
            updated.delete(previousCard.id);
          }
          updated.add(selectedHandCard.id);
          return updated;
        });
        setSelectedHandCard(null);
        setSelectedCardPosition(null);
        setExpandedHand(null);
        return;
      }

      const getStartPosition = (callback: (startPos: { x: number; y: number }) => void) => {
        if (selectedCardPosition) {
          callback({ x: selectedCardPosition.x, y: selectedCardPosition.y });
        } else if (blueHandRef?.current && typeof blueHandRef.current.measureInWindow === 'function') {
          blueHandRef.current.measureInWindow((x: number, y: number) => {
            callback({ x, y });
          });
        } else {
          callback({ x: clickX, y: clickY });
        }
      };

      getStartPosition((measuredStartPos) => {
        slotRef.measureInWindow((slotX: number, slotY: number, _slotWidth: number, _slotHeight: number) => {
          const endPos = { x: slotX, y: slotY };

          setPendingSlotPlacement({
            slotType,
            player: selectedHandCard,
            previousCard,
          });

          setAnimatingCard({
            player: selectedHandCard,
            startPos: measuredStartPos,
            endPos,
            faceDown: false,
          });

          setSelectedHandCard(null);
          setSelectedCardPosition(null);
          setExpandedHand(null);
        });
      });
    }
  };

  // Handle animation complete
  const handleAnimationComplete = () => {
    if (pendingSlotPlacement) {
      const { slotType, player, previousCard } = pendingSlotPlacement;

      // Check if the player being placed is a placeholder (opponent animation)
      const isPlaceholderPlayer = player.id === '__opponent__';

      setSlots(prev => {
        const currentPlayer = prev[slotType];
        // If we're placing a placeholder but the slot already has real data, don't overwrite
        // This handles the race condition where server state arrives before animation completes
        if (isPlaceholderPlayer && currentPlayer && currentPlayer.id !== '__opponent__') {
          return prev;
        }
        return { ...prev, [slotType]: player };
      });

      setPlacedBlueCards(prev => {
        const updated = new Set(prev);
        if (previousCard && previousCard.team === 'A') {
          updated.delete(previousCard.id);
        }
        // Only add to placed cards if it's a real player (not a placeholder)
        if (!isPlaceholderPlayer) {
          updated.add(player.id);
        }
        return updated;
      });

      setAnimatingCard(null);
      setPendingSlotPlacement(null);
    }
  };

  // Refusal phase slot interaction
  const handleRefusalSlotClick = (slotType: SlotType, _clickX: number, _clickY: number) => {
    if (slotType === 'redAttacker1' || slotType === 'redAttacker2') {
      setRefusalSlotSelection(slotType);
    }
  };

  // Submit defender selection
  const handleSubmitDefender = () => {
    if (!slots.blueDefender) return;

    if (isMultiplayer) {
      multiplayerState.submitDefender(slots.blueDefender.id);
    } else {
      const isRound2 = state.currentPhase === 'round2-defender';
      localPairing.selectDefender(slots.blueDefender.id, 'A');
      localPairing.aiSelectDefender('B');
      localPairing.advancePhase(); // → defender-reveal

      setTimeout(() => {
        setRevealedSlots(prev => new Set(prev).add('redDefender'));

        if (isRound2) {
          // Round 2: Auto-assign remaining 2 players as attackers (skip attacker selection)
          const teamAAvailable = localPairing.getAvailablePlayers('A');
          const teamBAvailable = localPairing.getAvailablePlayers('B');

          if (teamAAvailable.length >= 2 && teamBAvailable.length >= 2) {
            localPairing.selectAttackers([teamAAvailable[0].id, teamAAvailable[1].id], 'A');
            localPairing.selectAttackers([teamBAvailable[0].id, teamBAvailable[1].id], 'B');
          }
          localPairing.advancePhase(); // → round2-refuse (skips attacker phases)
        } else {
          localPairing.advancePhase(); // → round1-attackers
        }
      }, 2000);
    }
  };

  // Submit attacker selection
  const handleSubmitAttackers = () => {
    if (!slots.blueAttacker1 || !slots.blueAttacker2) return;

    if (isMultiplayer) {
      multiplayerState.submitAttackers([slots.blueAttacker1.id, slots.blueAttacker2.id]);
    } else {
      localPairing.selectAttackers([slots.blueAttacker1.id, slots.blueAttacker2.id], 'A');
      localPairing.aiSelectAttackers('B');
      localPairing.advancePhase();

      setTimeout(() => {
        setRevealedSlots(prev => new Set(prev).add('redAttacker1').add('redAttacker2'));
        localPairing.advancePhase();
      }, 2000);
    }
  };

  // Handle phase-specific actions
  const handleContinue = () => {
    if (state.currentPhase === 'setup') {
      if (!isMultiplayer) {
        localPairing.advancePhase();
      }
      // In multiplayer, setup advance is server-driven
    } else if (state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') {
      if (!refusalSlotSelection) return;

      const refusedPlayer = slots[refusalSlotSelection];
      if (!refusedPlayer) return;

      if (isMultiplayer) {
        multiplayerState.submitRefusal(refusedPlayer.id);
      } else {
        localPairing.refuseAttacker(refusedPlayer.id, 'A');

        setTimeout(() => {
          localPairing.aiRefuseAttacker('B');

          setTimeout(() => {
            localPairing.createPairings();
            setRefusalSlotSelection(null);

            setSlots({
              blueDefender: null,
              blueAttacker1: null,
              blueAttacker2: null,
              redDefender: null,
              redAttacker1: null,
              redAttacker2: null,
            });
            setRevealedSlots(new Set());
            setPlacedBlueCards(new Set());

            localPairing.advancePhase();
          }, 500);
        }, 500);
      }
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      reset();
    }
  };

  const renderPhaseContent = () => {
    // Setup phase — skip in multiplayer/spectator (server controls phase)
    if (state.currentPhase === 'setup') {
      if (isMultiplayer || isSpectator) {
        return (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            alignItems: 'center',
            width: '100%'
          }}>
            <StyledText variant="body" style={{ textAlign: 'center', color: theme.colors.gray[500] }}>
              Waiting for server state...
            </StyledText>
          </View>
        );
      }
      return (
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
          alignItems: 'center',
          width: '100%'
        }}>
          <View style={{
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg
          }}>
            <StyledText variant="h2" style={{ textAlign: 'center' }}>
              Ready to Begin?
            </StyledText>
            <StyledText variant="body" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
              This system will guide you through 3 rounds of WTC pairing
            </StyledText>
            <Button onPress={handleContinue} variant="primary">
              Start Pairing
            </Button>
          </View>
        </View>
      );
    }

    // Results phase
    if (state.currentPhase === 'results') {
      const sortedPairings = [...state.pairings].sort((a, b) => a.tableNumber - b.tableNumber);
      const cardScale = isMobile ? 0.55 : 0.85;
      const layoutImageWidth = isMobile ? 60 : 100;
      const layoutImageHeight = layoutImageWidth * 1.5;

      return (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
        }}>
          <StyledText variant={isMobile ? 'body' : 'h2'} style={{ textAlign: 'center', color: theme.colors.success }}>
            All Pairings Complete!
          </StyledText>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: isMobile ? theme.spacing.xs : theme.spacing.md,
            flexWrap: 'wrap',
          }}>
            {sortedPairings.map((pairing) => (
              <View
                key={pairing.tableNumber}
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? 2 : theme.spacing.xs,
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.borderRadius.md,
                  padding: isMobile ? theme.spacing.xs : theme.spacing.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                {isMobile ? (
                  <>
                    <StyledText style={{ color: theme.colors.white, fontWeight: 'bold', fontSize: 10 }}>
                      T{pairing.tableNumber}
                    </StyledText>

                    <View style={{ alignItems: 'center', gap: 2 }}>
                      {pairing.teamAPlayer.faction && hasFactionIcon(pairing.teamAPlayer.faction) ? (
                        <FactionIcon faction={pairing.teamAPlayer.faction} size={20} color="#3b82f6" />
                      ) : (
                        <StyledText style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 8 }} numberOfLines={1}>
                          {pairing.teamAPlayer.faction || pairing.teamAPlayer.username || 'A'}
                        </StyledText>
                      )}
                      <StyledText style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 8 }} numberOfLines={1}>
                        {pairing.teamAPlayer.faction || pairing.teamAPlayer.username || 'A'}
                      </StyledText>
                    </View>

                    <View style={{
                      borderRadius: theme.borderRadius.md,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                    }}>
                      {pairing.layout ? (
                        <Image
                          source={getLayoutImageSource(pairing.layout)}
                          style={{
                            width: layoutImageWidth,
                            height: layoutImageHeight,
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={{
                          width: layoutImageWidth,
                          height: layoutImageHeight,
                          backgroundColor: theme.colors.gray[700],
                        }} />
                      )}
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        paddingVertical: 2,
                      }}>
                        <StyledText style={{ color: theme.colors.white, fontSize: 9, fontWeight: 'bold', textAlign: 'center' }}>
                          {pairing.layout?.name ?? '-'}
                        </StyledText>
                      </View>
                    </View>

                    <View style={{ alignItems: 'center', gap: 2 }}>
                      {pairing.teamBPlayer.faction && hasFactionIcon(pairing.teamBPlayer.faction) ? (
                        <FactionIcon faction={pairing.teamBPlayer.faction} size={20} color="#ef4444" />
                      ) : (
                        <StyledText style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 8 }} numberOfLines={1}>
                          {pairing.teamBPlayer.faction || pairing.teamBPlayer.username || 'B'}
                        </StyledText>
                      )}
                      <StyledText style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 8 }} numberOfLines={1}>
                        {pairing.teamBPlayer.faction || pairing.teamBPlayer.username || 'B'}
                      </StyledText>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: 4,
                      alignItems: 'center',
                    }}>
                      <StyledText variant="caption" style={{ color: theme.colors.white, fontWeight: 'bold', fontSize: 14 }}>
                        T{pairing.tableNumber}
                      </StyledText>
                    </View>

                    <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                      <PlayerCard player={pairing.teamAPlayer} state="paired" />
                    </View>

                    {pairing.layout ? (
                      <View style={{
                        borderRadius: theme.borderRadius.sm,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}>
                        <Image
                          source={getLayoutImageSource(pairing.layout)}
                          style={{
                            width: layoutImageWidth,
                            height: layoutImageHeight,
                          }}
                          resizeMode="contain"
                        />
                        <View style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingVertical: 1,
                        }}>
                          <StyledText variant="caption" style={{ color: theme.colors.white, textAlign: 'center', fontSize: 10 }}>
                            {pairing.layout.name}
                          </StyledText>
                        </View>
                      </View>
                    ) : (
                      <View style={{
                        width: layoutImageWidth,
                        height: layoutImageHeight,
                        backgroundColor: theme.colors.gray[200],
                        borderRadius: theme.borderRadius.sm,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <StyledText variant="caption" style={{ color: theme.colors.gray[500], fontSize: 11 }}>
                          No Layout
                        </StyledText>
                      </View>
                    )}

                    <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                      <PlayerCard player={pairing.teamBPlayer} state="paired" />
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>

          <Button onPress={handleReset} variant="primary">
            {onReset ? 'Done' : 'Start Over'}
          </Button>
        </View>
      );
    }

    // Layout selection phases
    if (state.currentPhase === 'round1-layout-select' || state.currentPhase === 'round2-layout-select') {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const firstPicker = isRound1 ? state.coinflipWinner : (state.coinflipWinner === 'A' ? 'B' : 'A');

      // Show feedback when a team picks a layout (participants: only opponent; spectators: both teams)
      const showLayoutFeedback = lastLayoutSelection && (isPassive || lastLayoutSelection.team === 'B');
      if (showLayoutFeedback) {
        if (isMobile) return null;
        const layoutName = lastLayoutSelection.layout.name;
        const pickerName = lastLayoutSelection.team === 'A' ? state.teamA.name : state.teamB.name;
        return (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            alignItems: 'center',
          }}>
            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              {pickerName} picked {layoutName} for T{lastLayoutSelection.tableNumber}
            </StyledText>
          </View>
        );
      }

      if (!state.currentLayoutPicker) {
        if (isMobile) return null;
        const roundState = isRound1 ? state.round1 : state.round2;
        const teamARefusedPlayer = roundState.teamARefused;
        const teamBRefusedPlayer = roundState.teamBRefused;

        return (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.md,
          }}>
            {isPassive && teamARefusedPlayer && (
              <StyledText variant="h3" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
                {state.teamA.name} refused {teamARefusedPlayer.faction || teamARefusedPlayer.username || 'player'}
              </StyledText>
            )}
            {teamBRefusedPlayer && (
              <StyledText variant="h3" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
                {state.teamB.name} refused {teamBRefusedPlayer.faction || teamBRefusedPlayer.username || 'player'}
              </StyledText>
            )}

            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              {isRound1
                ? `${firstPicker === 'A' ? state.teamA.name : state.teamB.name} wins coin flip!`
                : `${firstPicker === 'A' ? state.teamA.name : state.teamB.name} picks first`}
            </StyledText>

            <StyledText variant="body" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
              Selecting table layouts...
            </StyledText>
          </View>
        );
      }

      if (state.currentLayoutPicker === 'A' && state.pendingLayoutForTable) {
        if (isMobile || isPassive) {
          if (isPassive) {
            return (
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
                alignItems: 'center',
              }}>
                <StyledText variant="h3" style={{ textAlign: 'center' }}>
                  {state.teamA.name} is selecting layout...
                </StyledText>
              </View>
            );
          }
          return null;
        }
        const currentTeam = state.teamA;
        return (
          <LayoutSelectionModal
            visible={true}
            availableLayouts={state.availableLayouts}
            tableNumber={state.pendingLayoutForTable}
            teamName={currentTeam.name}
            teamColor={currentTeam.color}
            pairings={state.pairings}
            onSelectLayout={(layout: TableLayout) => handleSelectLayout(state.pendingLayoutForTable!, layout, 'A')}
          />
        );
      }

      if (state.currentLayoutPicker === 'B') {
        if (isMobile) return null;
        return (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            alignItems: 'center',
          }}>
            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              {state.teamB.name} is selecting layout...
            </StyledText>
          </View>
        );
      }
    }

    // Refusal phase
    if (state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') {
      if (isMobile) return null;
      if (isPassive) {
        return (
          <View style={{ alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
            <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
              Teams selecting refusals...
            </StyledText>
          </View>
        );
      }
      const waiting = isMultiplayer && multiplayerState.hasSubmitted;
      return (
        <View style={{ alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
          {waiting ? (
            <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
              Waiting for opponent...
            </StyledText>
          ) : (
            <>
              <StyledText variant="body" style={{ fontWeight: 'bold' }}>
                Refuse One Attacker — Tap a Red attacker slot
              </StyledText>
              <Button
                onPress={handleContinue}
                variant="primary"
                disabled={!refusalSlotSelection || (isMultiplayer && multiplayerState.isSubmitting)}
              >
                {refusalSlotSelection ? 'Confirm' : 'Select attacker'}
              </Button>
            </>
          )}
        </View>
      );
    }

    // Defender/Attacker selection phases
    if (state.currentPhase === 'round1-defender' || state.currentPhase === 'round2-defender') {
      if (isMobile) return null;
      if (isPassive) {
        return (
          <View style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
            <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
              Teams selecting defenders...
            </StyledText>
          </View>
        );
      }
      const waiting = isMultiplayer && multiplayerState.hasSubmitted;
      return (
        <View style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          alignItems: 'flex-end',
        }}>
          <View style={{
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg
          }}>
            {waiting ? (
              <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
                Waiting for opponent...
              </StyledText>
            ) : (
              <Button
                onPress={handleSubmitDefender}
                variant="primary"
                disabled={!slots.blueDefender || (isMultiplayer && multiplayerState.isSubmitting)}
              >
                {isMultiplayer && multiplayerState.isSubmitting ? 'Submitting...' : 'Confirm Defender'}
              </Button>
            )}
          </View>
        </View>
      );
    }

    if (state.currentPhase === 'round1-attackers' || state.currentPhase === 'round2-attackers') {
      if (isMobile) return null;
      if (isPassive) {
        return (
          <View style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
            <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
              Teams selecting attackers...
            </StyledText>
          </View>
        );
      }
      const attackerCount = (slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0);
      const waiting = isMultiplayer && multiplayerState.hasSubmitted;
      return (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'flex-end',
        }}>
          <View style={{
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg
          }}>
            {waiting ? (
              <StyledText variant="body" style={{ color: theme.colors.gray[500] }}>
                Waiting for opponent...
              </StyledText>
            ) : (
              <Button
                onPress={handleSubmitAttackers}
                variant="primary"
                disabled={attackerCount !== 2 || (isMultiplayer && multiplayerState.isSubmitting)}
              >
                {isMultiplayer && multiplayerState.isSubmitting ? 'Submitting...' : `Confirm Attackers (${attackerCount}/2)`}
              </Button>
            )}
          </View>
        </View>
      );
    }

    // Auto-advancing phases
    if (isMobile) return null;

    const getPhaseMessage = () => {
      if (state.currentPhase.includes('reveal')) return 'Revealing selections...';
      if (state.currentPhase.includes('coin-flip')) return 'Flipping coin...';
      if (state.currentPhase.includes('complete')) return 'Round complete!';
      if (state.currentPhase.includes('auto-pair')) return 'Auto-pairing final players...';
      return '';
    };

    return (
      <View style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
        alignItems: 'center',
      }}>
        <StyledText variant="h3" style={{ textAlign: 'center' }}>
          {getPhaseMessage()}
        </StyledText>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: isMobile ? theme.spacing.xs : theme.spacing.md, gap: isMobile ? theme.spacing.xs : theme.spacing.md, flexDirection: 'row', flex: 1 }}>
        {/* Mobile Card Hands */}
        {showMobileCardHands && (
          <CardHandsSidebar
            blueAvailablePlayers={getAvailablePlayers('A')}
            selectedCard={selectedHandCard}
            placedBlueCards={placedBlueCards}
            blueHandRef={blueHandRef}
            onOpenBlueHand={handleOpenBlueModal}
            redAvailablePlayers={getAvailablePlayers('B')}
            redHandRef={redHandRef}
            onOpenRedHand={handleOpenRedModal}
            currentLayoutPicker={state.currentPhase.includes('layout-select') ? state.currentLayoutPicker : null}
            coinflipWinner={state.coinflipWinner}
            showCoinflipWinner={state.currentPhase === 'round1-refuse' && !!state.coinflipWinner}
          />
        )}

        {/* Main Area */}
        <View style={{
          flex: 1,
          gap: theme.spacing.sm,
          minHeight: 0,
          justifyContent: (isMobile && windowHeight < 410) ? undefined : isMobile ? 'center' : 'space-evenly',
          position: 'relative',
          marginTop: isMobile ? '2%' : 0,
        }} id="main-area">

          {/* Team A Card Hand with Layouts button */}
          {!isMobile && state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
              <Pressable
                onPress={() => setShowLayoutsViewer(true)}
                style={{
                  backgroundColor: theme.colors.gray[200],
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <StyledText variant="caption" style={{ fontSize: 10 }}>
                  Layouts ({state.availableLayouts.length})
                </StyledText>
              </Pressable>

              <CardHand
                ref={blueHandRef}
                team="A"
                availablePlayers={getAvailablePlayers('A').filter(p => !placedBlueCards.has(p.id))}
                faceDown={false}
                isExpanded={expandedHand === 'blue'}
                onToggleExpanded={handleToggleBlueHand}
                selectedCard={isPassive ? null : selectedHandCard}
                onCardSelected={isPassive ? undefined : handleCardSelected}
              />

              {/* Coinflip Winner / Layout Picker Marker for Team A */}
              {(state.currentPhase === 'round1-refuse' && state.coinflipWinner === 'A') && (
                <View style={{
                  backgroundColor: '#10b981',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <StyledText style={{ fontSize: 14 }}>🏆</StyledText>
                  <StyledText style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    Coinflip Winner - Picks First
                  </StyledText>
                </View>
              )}
              {state.currentPhase.includes('layout-select') && state.currentLayoutPicker === 'A' && (
                <View style={{
                  backgroundColor: '#f59e0b',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  shadowColor: '#f59e0b',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <StyledText style={{ fontSize: 14 }}>🎯</StyledText>
                  <StyledText style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    {state.coinflipWinner === 'A' ? 'Your Pick' : 'Your Turn'}
                  </StyledText>
                </View>
              )}
            </View>
          )}

          {/* Compact Battle Grid */}
          {state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <CompactBattleGrid
              slots={{
                ...slots,
                ...(pendingSlotPlacement ? { [pendingSlotPlacement.slotType]: null } : {}),
              }}
              revealedSlots={revealedSlots}
              onSlotClick={isPassive ? () => {} : state.currentPhase.includes('refuse') ? handleRefusalSlotClick : handleSlotClick}
              currentPhase={state.currentPhase}
              slotRefs={slotRefs}
              highlightedSlots={state.currentPhase.includes('refuse') && !isPassive ? new Set(['redAttacker1', 'redAttacker2']) : undefined}
              selectedRefusalSlot={state.currentPhase.includes('refuse') ? refusalSlotSelection : undefined}
              isSpectator={isSpectator}
            />
          )}

          {/* Team B Card Hand */}
          {!isMobile && state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
              {/* Coinflip Winner Marker for Team B during refuse */}
              {(state.currentPhase === 'round1-refuse' && state.coinflipWinner === 'B') && (
                <View style={{
                  backgroundColor: '#10b981',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <StyledText style={{ fontSize: 14 }}>🏆</StyledText>
                  <StyledText style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    Coinflip Winner - Picks First
                  </StyledText>
                </View>
              )}
              {/* Layout Picker Marker for Team B */}
              {state.currentPhase.includes('layout-select') && state.currentLayoutPicker === 'B' && (
                <View style={{
                  backgroundColor: '#f59e0b',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  shadowColor: '#f59e0b',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <StyledText style={{ fontSize: 14 }}>🎯</StyledText>
                  <StyledText style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    {state.coinflipWinner === 'B' ? 'Picking Layout' : 'Opponent Picking'}
                  </StyledText>
                </View>
              )}

              <CardHand
                ref={redHandRef}
                team="B"
                availablePlayers={getAvailablePlayers('B')}
                faceDown={false}
                isExpanded={expandedHand === 'red'}
                onToggleExpanded={handleToggleRedHand}
              />
            </View>
          )}

          {/* Phase-specific content */}
          {renderPhaseContent()}
        </View>

        {/* Right Sidebar */}
        {state.currentPhase !== 'results' && (
          isMobile ? (
            <View
              style={{
                width: '25%',
                minWidth: 70,
                maxWidth: 120,
                borderLeftWidth: 1,
                borderLeftColor: theme.colors.border,
                paddingLeft: 2,
                paddingVertical: 4,
                justifyContent: 'space-between',
              }}
            >
              <PhaseIndicator currentPhase={state.currentPhase} />

              <ScrollView
                style={{ flex: 1, marginVertical: 4 }}
                contentContainerStyle={{ gap: 2 }}
              >
                {logMessages.slice(-10).map((msg, i, arr) => (
                  <StyledText
                    key={i}
                    variant="caption"
                    style={{
                      fontSize: 8,
                      color: i === arr.length - 1 ? theme.colors.text : theme.colors.gray[500],
                    }}
                  >
                    {msg}
                  </StyledText>
                ))}
              </ScrollView>

              {state.currentPhase !== 'setup' && (
                <Pressable
                  onPress={() => setShowLayoutsViewer(true)}
                  style={{
                    backgroundColor: theme.colors.secondary,
                    paddingHorizontal: 6,
                    paddingVertical: 8,
                    borderRadius: theme.borderRadius.sm,
                    marginBottom: 4,
                  }}
                >
                  <StyledText variant="caption" style={{ fontSize: 9, textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                    View Layouts and Pairings
                  </StyledText>
                </Pressable>
              )}

              {/* Action Buttons — hidden for spectators and readOnly */}
              {!isPassive && (state.currentPhase === 'round1-defender' || state.currentPhase === 'round2-defender') && (
                isMultiplayer && multiplayerState.hasSubmitted ? (
                  <StyledText variant="caption" style={{ fontSize: 9, color: theme.colors.gray[500], textAlign: 'center' }}>
                    Waiting...
                  </StyledText>
                ) : (
                <Pressable
                  onPress={handleSubmitDefender}
                  disabled={!slots.blueDefender || (isMultiplayer && multiplayerState.isSubmitting)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: slots.blueDefender ? '#f59e0b' : theme.colors.gray[400],
                    opacity: slots.blueDefender ? 1 : 0.6,
                  }}
                >
                  <StyledText variant="caption" style={{ fontSize: 9, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                    Confirm Defender
                  </StyledText>
                </Pressable>
                )
              )}
              {!isPassive && (state.currentPhase === 'round1-attackers' || state.currentPhase === 'round2-attackers') && (
                isMultiplayer && multiplayerState.hasSubmitted ? (
                  <StyledText variant="caption" style={{ fontSize: 9, color: theme.colors.gray[500], textAlign: 'center' }}>
                    Waiting...
                  </StyledText>
                ) : (
                <Pressable
                  onPress={handleSubmitAttackers}
                  disabled={(slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0) !== 2 || (isMultiplayer && multiplayerState.isSubmitting)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: (slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0) === 2 ? '#f59e0b' : theme.colors.gray[400],
                    opacity: (slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0) === 2 ? 1 : 0.6,
                  }}
                >
                  <StyledText variant="caption" style={{ fontSize: 9, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                    Confirm Attackers ({(slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0)}/2)
                  </StyledText>
                </Pressable>
                )
              )}
              {!isPassive && (state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') && (
                isMultiplayer && multiplayerState.hasSubmitted ? (
                  <StyledText variant="caption" style={{ fontSize: 9, color: theme.colors.gray[500], textAlign: 'center' }}>
                    Waiting...
                  </StyledText>
                ) : (
                <Pressable
                  onPress={handleContinue}
                  disabled={!refusalSlotSelection || (isMultiplayer && multiplayerState.isSubmitting)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: refusalSlotSelection ? '#f59e0b' : theme.colors.gray[400],
                    opacity: refusalSlotSelection ? 1 : 0.6,
                  }}
                >
                  <StyledText variant="caption" style={{ fontSize: 9, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                    Confirm Refusal
                  </StyledText>
                </Pressable>
                )
              )}
            </View>
          ) : (
            <ScrollView
              style={{
                flex: 1,
                minWidth: 250,
                maxWidth: 350,
                borderLeftWidth: 2,
                borderLeftColor: theme.colors.border,
                paddingLeft: theme.spacing.sm,
              }}
              contentContainerStyle={{
                paddingBottom: theme.spacing.lg,
              }}
              showsVerticalScrollIndicator={true}
            >
              <View style={{ gap: theme.spacing.sm }}>
                <PhaseIndicator currentPhase={state.currentPhase} />

                {state.pairings.length > 0 && (
                  <PairingBoard pairings={state.pairings} sidebarMode={true} />
                )}
              </View>
            </ScrollView>
          )
        )}
      </View>

      {/* Animated card transition overlay */}
      {animatingCard && (
        <AnimatedCardTransitionMoti
          player={animatingCard.player}
          startPosition={animatingCard.startPos}
          endPosition={animatingCard.endPos}
          onComplete={handleAnimationComplete}
          faceDown={animatingCard.faceDown}
        />
      )}

      {/* Card Hand Modal for mobile */}
      {isMobile && (
        <CardHandModal
          visible={modalOpen !== null}
          team={modalOpen === 'blue' ? 'A' : 'B'}
          players={
            modalOpen === 'blue'
              ? getAvailablePlayers('A').filter(p => !placedBlueCards.has(p.id))
              : getAvailablePlayers('B')
          }
          selectedCard={isPassive ? null : selectedHandCard}
          onCardPress={isPassive ? handleCloseModal : handleModalCardPress}
          onClose={handleCloseModal}
          faceDown={false}
        />
      )}

      {/* Layout Selection Modal for mobile — not for spectators or readOnly */}
      {isMobile && !isPassive && state.currentLayoutPicker === 'A' && state.pendingLayoutForTable && (
        <LayoutSelectionModal
          visible={true}
          availableLayouts={state.availableLayouts}
          tableNumber={state.pendingLayoutForTable}
          teamName={state.teamA.name}
          teamColor={state.teamA.color}
          pairings={state.pairings}
          onSelectLayout={(layout: TableLayout) => handleSelectLayout(state.pendingLayoutForTable!, layout, 'A')}
        />
      )}

      {/* Layouts Viewer Modal */}
      {showLayoutsViewer && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1500,
          }}
        >
          <Pressable
            onPress={() => setShowLayoutsViewer(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
          />

          <View
            style={{
              backgroundColor: 'transparent',
              borderRadius: theme.borderRadius.lg,
              padding: isMobile ? theme.spacing.sm : theme.spacing.lg,
              paddingTop: isMobile ? theme.spacing.md : theme.spacing.lg,
              maxWidth: windowWidth - 40,
              maxHeight: windowHeight - 40,
            }}
          >
            <Pressable
              onPress={() => setShowLayoutsViewer(false)}
              style={{
                position: 'absolute',
                top: 6,
                left: 10,
                zIndex: 10,
                padding: 4,
              }}
            >
              <StyledText variant="body" style={{ fontSize: 16, fontWeight: 'bold' }}>
                X
              </StyledText>
            </Pressable>

            <ScrollView
              contentContainerStyle={{
                alignItems: 'center',
                gap: isMobile ? theme.spacing.xs : theme.spacing.sm,
              }}
              showsVerticalScrollIndicator={true}
            >
              <StyledText variant={isMobile ? 'body' : 'h3'} style={{ fontWeight: 'bold' }}>
                Layouts & Pairings
              </StyledText>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 6 : theme.spacing.sm }}>
                {initData.layouts.map((layout) => {
                  const pairing = state.pairings.find(p => p.layout?.id === layout.id);
                  const isUsed = !!pairing;
                  return (
                    <View
                      key={layout.id}
                      style={{
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <View style={{ minHeight: isMobile ? 16 : 20, justifyContent: 'center' }}>
                        {isUsed && pairing?.teamAPlayer.faction && hasFactionIcon(pairing.teamAPlayer.faction) ? (
                          <FactionIcon faction={pairing.teamAPlayer.faction} size={isMobile ? 14 : 18} color="#3b82f6" />
                        ) : isUsed ? (
                          <StyledText
                            variant="caption"
                            style={{
                              fontSize: isMobile ? 8 : 10,
                              fontWeight: 'bold',
                              color: '#3b82f6',
                            }}
                            numberOfLines={1}
                          >
                            {pairing?.teamAPlayer.faction || pairing?.teamAPlayer.username || 'A'}
                          </StyledText>
                        ) : null}
                      </View>

                      <View
                        style={{
                          borderRadius: theme.borderRadius.md,
                          overflow: 'hidden',
                          borderWidth: 2,
                          borderColor: isUsed ? theme.colors.primary : theme.colors.border,
                          opacity: isUsed ? 1 : 0.5,
                        }}
                      >
                        <Image
                          source={getLayoutImageSource(layout)}
                          style={{ width: isMobile ? 50 : 80, height: isMobile ? 75 : 120 }}
                          resizeMode="contain"
                        />
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: isUsed ? 'rgba(59, 130, 246, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                            paddingVertical: 2,
                          }}
                        >
                          <StyledText variant="caption" style={{ color: theme.colors.white, textAlign: 'center', fontSize: isMobile ? 8 : 10 }}>
                            {layout.name}
                          </StyledText>
                        </View>
                      </View>

                      <View style={{ minHeight: isMobile ? 16 : 20, justifyContent: 'center' }}>
                        {isUsed && pairing?.teamBPlayer.faction && hasFactionIcon(pairing.teamBPlayer.faction) ? (
                          <FactionIcon faction={pairing.teamBPlayer.faction} size={isMobile ? 14 : 18} color="#ef4444" />
                        ) : isUsed ? (
                          <StyledText
                            variant="caption"
                            style={{
                              fontSize: isMobile ? 8 : 10,
                              fontWeight: 'bold',
                              color: '#ef4444',
                            }}
                            numberOfLines={1}
                          >
                            {pairing?.teamBPlayer.faction || pairing?.teamBPlayer.username || 'B'}
                          </StyledText>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      <RotateDeviceOverlay minWidth={600} />
    </View>
  );
}
