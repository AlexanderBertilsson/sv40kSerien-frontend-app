import { View, ScrollView, useWindowDimensions, Image, Pressable } from 'react-native';
import { StyledText, Button } from '@/src/components/pairings/styled';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import { usePairingState } from '@/src/hooks/usePairingState';
import { useState, useEffect, useRef } from 'react';
import CardHand from '@/src/components/pairings/CardHand';
import PlayerCard from '@/src/components/pairings/PlayerCard';
import PairingBoard from '@/src/components/pairings/PairingBoard';
import PhaseIndicator from '@/src/components/pairings/PhaseIndicator';
import CompactBattleGrid, { SlotState } from '@/src/components/pairings/CompactBattleGrid';
import { SlotType } from '@/src/components/pairings/CardSlot';
import { Player, TableLayout } from '@/src/types/pairing';
import AnimatedCardTransitionMoti from '@/src/components/pairings/AnimatedCardTransitionMoti';

import CardHandsSidebar from '@/src/components/pairings/CardHandsSidebar';
import CardHandModal from '@/src/components/pairings/CardHandModal';
import RotateDeviceOverlay from '@/src/components/pairings/RotateDeviceOverlay';
import LayoutSelectionModal from '@/src/components/pairings/LayoutSelectionModal';

// Layout image imports for results display
const layoutImages: Record<TableLayout, any> = {
  layout1: require('@/assets/docs/layouts/layout1.png'),
  layout2: require('@/assets/docs/layouts/layout2.png'),
  layout3: require('@/assets/docs/layouts/layout3.png'),
  layout4: require('@/assets/docs/layouts/layout4.png'),
  layout5: require('@/assets/docs/layouts/layout5.png'),
};

export default function PairingsScreen() {
  const theme = usePairingTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  // Check if mobile for sidebar layout (900px for landscape mobile/tablet)
  const isMobile = windowWidth < 900;

  const {
    state,
    getAvailablePlayers,
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
  } = usePairingState();

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
          // FLIP - Use exact measured positions
          // Start from the collapsed hand (where cards visually appear)
          const startPos = {
            x: handX,
            y: handY,
          };

          // End at the exact slot position
          const endPos = {
            x: slotX,
            y: slotY,
          };

          console.log('Red FLIP Animation: slot=' + slotType +
            ', start=(' + startPos.x.toFixed(0) + ',' + startPos.y.toFixed(0) + ')' +
            ', end=(' + endPos.x.toFixed(0) + ',' + endPos.y.toFixed(0) + ')' +
            ', delta=(' + (endPos.x - startPos.x).toFixed(0) + ',' + (endPos.y - startPos.y).toFixed(0) + ')');

          setPendingSlotPlacement({
            slotType,
            player,
            previousCard: null,
          });

          // FLIP - Play: Animate from First to Last
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
      // Animate first attacker
      animateRedCard(currentRound.teamBAttackers[0], 'redAttacker1');

      // Animate second attacker after first completes
      setTimeout(() => {
        animateRedCard(currentRound.teamBAttackers[1], 'redAttacker2');
      }, 300);
    }
  }, [state.round1, state.round2, state.currentPhase, slots.redDefender, slots.redAttacker1, slots.redAttacker2, animatingCard]);

  // Handle toggling blue hand expansion (auto-collapses red)
  const handleToggleBlueHand = () => {
    if (expandedHand === 'blue') {
      // Collapse blue and clear selection
      setExpandedHand(null);
      setSelectedHandCard(null);
    } else {
      // Expand blue (auto-collapses red)
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
      // Blue team: select the card and close modal
      setSelectedHandCard(player);
      setModalOpen(null);
    } else {
      // Red team: just close modal without selection
      setModalOpen(null);
    }
  };

  // Handle card selected from hand
  const handleCardSelected = (player: Player, cardRef: any) => {
    if (selectedHandCard?.id === player.id) {
      // Deselect
      setSelectedHandCard(null);
      setSelectedCardPosition(null);
      selectedCardRef.current = null;
    } else {
      // Select new card and measure its position (FLIP - First)
      setSelectedHandCard(player);
      selectedCardRef.current = cardRef;

      // Measure the card's current position in the hand
      if (cardRef && typeof cardRef.measureInWindow === 'function') {
        cardRef.measureInWindow((x: number, y: number, width: number, height: number) => {
          console.log('Card selected - FLIP First: x=' + x + ', y=' + y + ', w=' + width + ', h=' + height);
          setSelectedCardPosition({ x, y, width, height });
        });
      }
    }
  };

  // Whether to show card hands sidebar on mobile
  const showMobileCardHands = isMobile &&
    state.currentPhase !== 'setup' &&
    state.currentPhase !== 'results';

  // Auto-advance intermediate phases (no user interaction needed)
  useEffect(() => {
    const autoAdvancePhases = [
      'round1-coin-flip',
      'round1-complete',
      'round2-complete',
      'round3-auto-pair',
    ];

    if (autoAdvancePhases.includes(state.currentPhase)) {
      const timer = setTimeout(() => {
        if (state.currentPhase === 'round1-coin-flip') {
          flipCoin();
          advancePhase();
        } else if (state.currentPhase === 'round1-complete' || state.currentPhase === 'round2-complete') {
          advancePhase();
        } else if (state.currentPhase === 'round3-auto-pair') {
          autoPairLastPlayers();
          advancePhase();
        }
      }, 1500); // 1.5 second delay before auto-advancing

      return () => clearTimeout(timer);
    }
  }, [state.currentPhase]);

  // Layout selection phase flow
  useEffect(() => {
    if (state.currentPhase === 'round1-layout-select' || state.currentPhase === 'round2-layout-select') {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const tableOffset = isRound1 ? 0 : 2; // Tables 1-2 for R1, 3-4 for R2

      // Determine picking order based on coinflip
      // Round 1: Winner picks first
      // Round 2: Loser picks first
      const firstPicker = isRound1 ? state.coinflipWinner : (state.coinflipWinner === 'A' ? 'B' : 'A');
      const secondPicker = firstPicker === 'A' ? 'B' : 'A';

      // Check how many layouts have been assigned to pairings in this round
      const roundPairings = state.pairings.filter(p =>
        p.tableNumber === tableOffset + 1 || p.tableNumber === tableOffset + 2
      );
      const assignedCount = roundPairings.filter(p => p.layout).length;

      if (assignedCount === 0 && !state.currentLayoutPicker) {
        // First picker needs to select - short delay to show message first
        setTimeout(() => {
          setLayoutPicker(firstPicker!, tableOffset + 1);
        }, 1500);
      } else if (assignedCount === 1 && !state.currentLayoutPicker) {
        // Second picker needs to select
        setTimeout(() => {
          setLayoutPicker(secondPicker!, tableOffset + 2);
        }, 1000);
      } else if (assignedCount === 2) {
        // Both layouts selected - wait for Team B's feedback to show before advancing
        if (!lastLayoutSelection || lastLayoutSelection.team === 'A') {
          advancePhase();
        }
        // If Team B just picked, wait for feedback message to clear (2 seconds)
      }
    }
  }, [state.currentPhase, state.pairings, state.currentLayoutPicker, state.coinflipWinner, lastLayoutSelection]);

  // Wrapper for selectLayout that also shows feedback message
  const handleSelectLayout = (tableNumber: number, layout: TableLayout, team: 'A' | 'B') => {
    selectLayout(tableNumber, layout);
    setLastLayoutSelection({ team, layout, tableNumber });
  };

  // AI layout selection - when it's Team B's turn, auto-select a random layout
  useEffect(() => {
    if (state.currentLayoutPicker === 'B' && state.pendingLayoutForTable && state.availableLayouts.length > 0) {
      const timer = setTimeout(() => {
        // AI selects a random layout from available options
        const randomIndex = Math.floor(Math.random() * state.availableLayouts.length);
        const selectedLayout = state.availableLayouts[randomIndex];
        handleSelectLayout(state.pendingLayoutForTable!, selectedLayout, 'B');
      }, 1500); // 1.5 second delay to simulate "thinking"

      return () => clearTimeout(timer);
    }
  }, [state.currentLayoutPicker, state.pendingLayoutForTable, state.availableLayouts]);

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
  }, [state.currentPhase]);

  // Log layout picker changes
  useEffect(() => {
    if (state.currentPhase.includes('layout-select')) {
      if (state.currentLayoutPicker === 'A' && state.pendingLayoutForTable) {
        addLogMessage(`Select layout for Table ${state.pendingLayoutForTable}`);
      } else if (state.currentLayoutPicker === 'B') {
        addLogMessage('Team Bravo selecting layout...');
      }
    }
  }, [state.currentLayoutPicker, state.pendingLayoutForTable, state.currentPhase]);

  // Log coin flip winner and refusals
  useEffect(() => {
    if (state.currentPhase.includes('layout-select') && !state.currentLayoutPicker) {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const roundState = isRound1 ? state.round1 : state.round2;
      const firstPicker = state.coinflipWinner;
      console.log('firstPicker', firstPicker);
      if (firstPicker) {
        const teamName = firstPicker === 'A' ? 'Team Alpha' : 'Team Bravo';
        if (isRound1) {
          addLogMessage(`${teamName} wins coin flip!`);
        } else {
          addLogMessage(`${teamName} picks first`);
        }
      }
      if (roundState.teamBRefused) {
        addLogMessage(`Bravo refused ${roundState.teamBRefused.initials}`);
      }
    }
  }, [state.currentPhase, state.coinflipWinner]);

  // Log when Team B picks a layout
  useEffect(() => {
    if (lastLayoutSelection && lastLayoutSelection.team === 'B') {
      const layoutName = lastLayoutSelection.layout.replace('layout', 'L');
      addLogMessage(`Bravo picked ${layoutName} for T${lastLayoutSelection.tableNumber}`);
    }
  }, [lastLayoutSelection]);

  // Handle clicking a slot (with selected card) - FLIP technique
  const handleSlotClick = (slotType: SlotType, clickX: number, clickY: number) => {
    if (selectedHandCard && !animatingCard) {
      // Get the card currently in the slot (if any)
      const previousCard = slots[slotType];

      // FLIP - Last: Measure where the slot is
      const slotRef = slotRefs.current[slotType];
      if (!slotRef) {
        console.error('Missing slot ref for animation');
        // Fallback: place card immediately without animation
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

      // Determine starting position: use measured card position if available, otherwise use hand ref
      const getStartPosition = (callback: (startPos: { x: number; y: number }) => void) => {
        if (selectedCardPosition) {
          // Use the exact card position if we have it
          callback({ x: selectedCardPosition.x, y: selectedCardPosition.y });
        } else if (blueHandRef?.current && typeof blueHandRef.current.measureInWindow === 'function') {
          // Fallback: measure from the blue hand (for modal selections)
          blueHandRef.current.measureInWindow((x: number, y: number) => {
            callback({ x, y });
          });
        } else {
          // Last fallback: use click position
          callback({ x: clickX, y: clickY });
        }
      };

      getStartPosition((measuredStartPos) => {
        slotRef.measureInWindow((slotX: number, slotY: number, _slotWidth: number, _slotHeight: number) => {
          const endPos = {
            x: slotX,
            y: slotY,
          };

          console.log('FLIP Animation: slot=' + slotType +
            ', start=(' + measuredStartPos.x.toFixed(0) + ',' + measuredStartPos.y.toFixed(0) + ')' +
            ', end=(' + endPos.x.toFixed(0) + ',' + endPos.y.toFixed(0) + ')' +
            ', delta=(' + (endPos.x - measuredStartPos.x).toFixed(0) + ',' + (endPos.y - measuredStartPos.y).toFixed(0) + ')');

          // Store pending placement
          setPendingSlotPlacement({
            slotType,
            player: selectedHandCard,
            previousCard,
          });

          // FLIP - Play: Start animation from First to Last
          setAnimatingCard({
            player: selectedHandCard,
            startPos: measuredStartPos,
            endPos,
            faceDown: false,
          });

          // Clear selection and collapse hand immediately
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

      // Place the card in the slot
      setSlots(prev => ({ ...prev, [slotType]: player }));

      // Update placed cards tracking
      setPlacedBlueCards(prev => {
        const updated = new Set(prev);
        // Remove previous card from placed set (if it was a blue card)
        if (previousCard && previousCard.team === 'A') {
          updated.delete(previousCard.id);
        }
        // Add new card to placed set
        updated.add(player.id);
        return updated;
      });

      // Clear animation and pending state
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
    if (slots.blueDefender) {
      // User's selection
      selectDefender(slots.blueDefender.id, 'A');

      // AI selection (get from usePairingState)
      aiSelectDefender('B');
      // Note: useEffect will sync the AI's defender to slots.redDefender

      advancePhase(); // Move to reveal

      // Auto-advance after reveal - reveal the Red slots
      setTimeout(() => {
        setRevealedSlots(prev => new Set(prev).add('redDefender'));
        advancePhase(); // Move to attackers
      }, 2000);
    }
  };

  // Submit attacker selection
  const handleSubmitAttackers = () => {
    if (slots.blueAttacker1 && slots.blueAttacker2) {
      // User's selection
      selectAttackers([slots.blueAttacker1.id, slots.blueAttacker2.id], 'A');

      // AI selection
      aiSelectAttackers('B');
      // Note: useEffect will sync the AI's attackers to slots.redAttacker1 and redAttacker2

      advancePhase(); // Move to reveal

      // Auto-advance after reveal - reveal the Red slots
      setTimeout(() => {
        setRevealedSlots(prev => new Set(prev).add('redAttacker1').add('redAttacker2'));
        advancePhase(); // Move to coin flip or refuse
      }, 2000);
    }
  };

  // Handle phase-specific actions (only for phases that require user interaction)
  const handleContinue = () => {
    if (state.currentPhase === 'setup') {
      advancePhase();
    } else if (state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') {
      // User must select which attacker to refuse
      if (!refusalSlotSelection) {
        return; // Don't proceed without selection
      }

      // Map slot to player
      const refusedPlayer = slots[refusalSlotSelection];
      if (!refusedPlayer) {
        return; // Should not happen
      }

      // User refuses the selected attacker
      refuseAttacker(refusedPlayer.id, 'A');

      // AI refuses a random attacker
      setTimeout(() => {
        aiRefuseAttacker('B');

        // Create pairings after both refusals
        setTimeout(() => {
          createPairings();
          setRefusalSlotSelection(null); // Reset selection

          // Clear slots for next round
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

          advancePhase();
        }, 500);
      }, 500);
    }
  };

  const renderPhaseContent = () => {
    // Setup phase
    if (state.currentPhase === 'setup') {
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

    // Results phase - full screen display of all pairings
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

          {/* Pairings row - horizontal layout */}
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
                    {/* Mobile: Table number at top */}
                    <StyledText style={{ color: theme.colors.white, fontWeight: 'bold', fontSize: 10 }}>
                      T{pairing.tableNumber}
                    </StyledText>

                    {/* Mobile: Team A initials */}
                    <StyledText style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>
                      {pairing.teamAPlayer.initials}
                    </StyledText>

                    {/* Layout image with layout name overlay */}
                    <View style={{
                      borderRadius: theme.borderRadius.md,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                    }}>
                      {pairing.layout ? (
                        <Image
                          source={layoutImages[pairing.layout]}
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
                          {pairing.layout ? pairing.layout.replace('layout', 'L') : '-'}
                        </StyledText>
                      </View>
                    </View>

                    {/* Mobile: Team B initials below */}
                    <StyledText style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>
                      {pairing.teamBPlayer.initials}
                    </StyledText>
                  </>
                ) : (
                  <>
                    {/* Desktop: Table number */}
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

                    {/* Desktop: Blue player card */}
                    <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                      <PlayerCard player={pairing.teamAPlayer} state="paired" />
                    </View>

                    {/* Desktop: Layout image */}
                    {pairing.layout ? (
                      <View style={{
                        borderRadius: theme.borderRadius.sm,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}>
                        <Image
                          source={layoutImages[pairing.layout]}
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
                            {pairing.layout.replace('layout', 'L')}
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

                    {/* Desktop: Red player card */}
                    <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                      <PlayerCard player={pairing.teamBPlayer} state="paired" />
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>

          <Button onPress={reset} variant="primary">
            Start Over
          </Button>
        </View>
      );
    }

    // Layout selection phases
    if (state.currentPhase === 'round1-layout-select' || state.currentPhase === 'round2-layout-select') {
      const isRound1 = state.currentPhase === 'round1-layout-select';
      const firstPicker = isRound1 ? state.coinflipWinner : (state.coinflipWinner === 'A' ? 'B' : 'A');

      // Show feedback message only when Team B (opponent) picks a layout
      if (lastLayoutSelection && lastLayoutSelection.team === 'B') {
        if (isMobile) return null; // Message shown in sidebar log
        const layoutName = lastLayoutSelection.layout.replace('layout', 'Layout ');
        return (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            alignItems: 'center',
          }}>
            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              Team Bravo picked {layoutName} for T{lastLayoutSelection.tableNumber}
            </StyledText>
          </View>
        );
      }

      // Before picker is set, show who picks first and what Team B refused
      if (!state.currentLayoutPicker) {
        if (isMobile) return null; // Messages shown in sidebar log
        const roundState = isRound1 ? state.round1 : state.round2;
        const teamBRefusedPlayer = roundState.teamBRefused;

        return (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.md,
          }}>
            {teamBRefusedPlayer && (
              <StyledText variant="h3" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
                Team Bravo refused {teamBRefusedPlayer.initials}
              </StyledText>
            )}

            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              {isRound1
                ? `${firstPicker === 'A' ? 'Team Alpha' : 'Team Bravo'} wins coin flip!`
                : `${firstPicker === 'A' ? 'Team Alpha' : 'Team Bravo'} picks first`}
            </StyledText>

            <StyledText variant="body" style={{ textAlign: 'center', color: theme.colors.gray[600] }}>
              Selecting table layouts...
            </StyledText>
          </View>
        );
      }

      // User's turn to pick (Team A)
      if (state.currentLayoutPicker === 'A' && state.pendingLayoutForTable) {
        if (isMobile) return null; // Message shown in sidebar log, modal renders at root
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

      // AI's turn to pick (Team B) - show waiting message
      if (state.currentLayoutPicker === 'B') {
        if (isMobile) return null; // Message shown in sidebar log
        return (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            alignItems: 'center',
          }}>
            <StyledText variant="h3" style={{ textAlign: 'center' }}>
              Team Bravo is selecting layout...
            </StyledText>
          </View>
        );
      }
    }

    // Refusal phase - buttons in sidebar on mobile
    if (state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') {
      if (isMobile) return null; // Buttons rendered in sidebar
      return (
        <View style={{ alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
          <StyledText variant="body" style={{ fontWeight: 'bold' }}>
            Refuse One Attacker — Tap a Red attacker slot
          </StyledText>
          <Button
            onPress={handleContinue}
            variant="primary"
            disabled={!refusalSlotSelection}
          >
            {refusalSlotSelection ? 'Confirm' : 'Select attacker'}
          </Button>
        </View>
      );
    }

    // Defender/Attacker selection phases - buttons in sidebar on mobile
    if (state.currentPhase === 'round1-defender' || state.currentPhase === 'round2-defender') {
      if (isMobile) return null; // Buttons rendered in sidebar
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
            <Button
              onPress={handleSubmitDefender}
              variant="primary"
              disabled={!slots.blueDefender}
            >
              Confirm Defender
            </Button>
          </View>
        </View>
      );
    }

    if (state.currentPhase === 'round1-attackers' || state.currentPhase === 'round2-attackers') {
      if (isMobile) return null; // Buttons rendered in sidebar
      const attackerCount = (slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0);
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
            <Button
              onPress={handleSubmitAttackers}
              variant="primary"
              disabled={attackerCount !== 2}
            >
              Confirm Attackers ({attackerCount}/2)
            </Button>
          </View>
        </View>
      );
    }

    // Auto-advancing phases - show centered text only (no button)
    // On mobile, messages appear in the sidebar log instead
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
        {/* Mobile Card Hands - column to the left of the grid */}
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
          />
        )}

        {/* Main Area - flex grows to fill remaining space (on mobile ~40% after sidebars take their share) */}
        <View style={{
          flex: 1,
          gap: theme.spacing.sm,
          minHeight: 0,
          justifyContent: (isMobile && windowHeight < 410) ? undefined : isMobile ? 'center' : 'space-evenly',
          position: 'relative',
          marginTop: isMobile ? '2%' : 0,
        }} id="main-area">

          {/* Team Alpha Card Hand with Layouts button (not shown during setup/results/refuse, or on mobile where sidebar is used) */}
          {!isMobile && state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
              {/* View Layouts button */}
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
                selectedCard={selectedHandCard}
                onCardSelected={handleCardSelected}
                disabled={false}
              />
            </View>
          )}

          {/* Compact Battle Grid (not shown during setup/results) */}
          {state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <CompactBattleGrid
              slots={{
                ...slots,
                // Hide the destination slot during animation
                ...(pendingSlotPlacement ? { [pendingSlotPlacement.slotType]: null } : {}),
              }}
              revealedSlots={revealedSlots}
              onSlotClick={state.currentPhase.includes('refuse') ? handleRefusalSlotClick : handleSlotClick}
              currentPhase={state.currentPhase}
              slotRefs={slotRefs}
              highlightedSlots={state.currentPhase.includes('refuse') ? new Set(['redAttacker1', 'redAttacker2']) : undefined}
              selectedRefusalSlot={state.currentPhase.includes('refuse') ? refusalSlotSelection : undefined}
            />
          )}

          {/* Team Bravo Card Hand (not shown during setup/results, or on mobile where sidebar is used) */}
          {!isMobile && state.currentPhase !== 'setup' && state.currentPhase !== 'results' && (
            <CardHand
              ref={redHandRef}
              team="B"
              availablePlayers={getAvailablePlayers('B')}
              faceDown={false}
              isExpanded={expandedHand === 'red'}
              onToggleExpanded={handleToggleRedHand}
            />
          )}

          {/* Phase-specific content */}
          {renderPhaseContent()}
        </View>

        {/* Right Sidebar - different layout for mobile vs desktop */}
        {state.currentPhase !== 'results' && (
          isMobile ? (
            // Mobile: PhaseIndicator + Log + Layouts + Action Buttons
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
              {/* Phase Indicator */}
              <PhaseIndicator currentPhase={state.currentPhase} />

              {/* Log Messages */}
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

              {/* Layouts Button */}
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

              {/* Action Buttons - all orange */}
              {(state.currentPhase === 'round1-defender' || state.currentPhase === 'round2-defender') && (
                <Pressable
                  onPress={handleSubmitDefender}
                  disabled={!slots.blueDefender}
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
              )}
              {(state.currentPhase === 'round1-attackers' || state.currentPhase === 'round2-attackers') && (
                <Pressable
                  onPress={handleSubmitAttackers}
                  disabled={(slots.blueAttacker1 ? 1 : 0) + (slots.blueAttacker2 ? 1 : 0) !== 2}
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
              )}
              {(state.currentPhase === 'round1-refuse' || state.currentPhase === 'round2-refuse') && (
                <Pressable
                  onPress={handleContinue}
                  disabled={!refusalSlotSelection}
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
              )}
            </View>
          ) : (
            // Desktop: PhaseIndicator + PairingBoard
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
                {/* Phase Indicator */}
                <PhaseIndicator currentPhase={state.currentPhase} />

                {/* Pairing Board */}
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

      {/* Card Hand Modal for mobile - fans out cards in center of screen */}
      {isMobile && (
        <CardHandModal
          visible={modalOpen !== null}
          team={modalOpen === 'blue' ? 'A' : 'B'}
          players={
            modalOpen === 'blue'
              ? getAvailablePlayers('A').filter(p => !placedBlueCards.has(p.id))
              : getAvailablePlayers('B')
          }
          selectedCard={selectedHandCard}
          onCardPress={handleModalCardPress}
          onClose={handleCloseModal}
          faceDown={false}
        />
      )}

      {/* Layout Selection Modal for mobile - overlays entire screen like CardHandModal */}
      {isMobile && state.currentLayoutPicker === 'A' && state.pendingLayoutForTable && (
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

      {/* Layouts Viewer Modal - shows remaining available layouts */}
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
          {/* Backdrop - click to close */}
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

          {/* Modal content - sized to content with max constraints */}
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
            {/* Close button - top left */}
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

            {/* Scrollable content */}
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

              {/* All layouts with pairing info */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 6 : theme.spacing.sm }}>
                {(['layout1', 'layout2', 'layout3', 'layout4', 'layout5'] as TableLayout[]).map((layout) => {
                  const pairing = state.pairings.find(p => p.layout === layout);
                  const isUsed = !!pairing;
                  return (
                    <View
                      key={layout}
                      style={{
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {/* Team A initials above */}
                      <StyledText
                        variant="caption"
                        style={{
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 'bold',
                          color: isUsed ? '#3b82f6' : 'transparent',
                          minHeight: isMobile ? 12 : 14,
                        }}
                      >
                        {pairing?.teamAPlayer.initials || ''}
                      </StyledText>

                      {/* Layout image */}
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
                          source={layoutImages[layout]}
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
                            {layout.replace('layout', 'L')}
                          </StyledText>
                        </View>
                      </View>

                      {/* Team B initials below */}
                      <StyledText
                        variant="caption"
                        style={{
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 'bold',
                          color: isUsed ? '#ef4444' : 'transparent',
                          minHeight: isMobile ? 12 : 14,
                        }}
                      >
                        {pairing?.teamBPlayer.initials || ''}
                      </StyledText>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Overlay prompting user to rotate device when screen is too narrow */}
      <RotateDeviceOverlay minWidth={600} />
    </View>
  );
}
