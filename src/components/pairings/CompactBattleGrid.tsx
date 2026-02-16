import { View, Text, useWindowDimensions } from 'react-native';
import { Player, Phase } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import CardSlot, { SlotType } from './CardSlot';

export interface SlotState {
  blueDefender: Player | null;
  blueAttacker1: Player | null;
  blueAttacker2: Player | null;
  redDefender: Player | null;
  redAttacker1: Player | null;
  redAttacker2: Player | null;
}

interface CompactBattleGridProps {
  slots: SlotState;
  revealedSlots: Set<keyof SlotState>;
  onSlotClick: (slotType: SlotType, clickX: number, clickY: number) => void;
  currentPhase: Phase;
  highlightedSlots?: Set<SlotType>;
  selectedRefusalSlot?: SlotType | null;
  slotRefs?: React.MutableRefObject<{ [key: string]: any }>;
  isSpectator?: boolean;
}

export default function CompactBattleGrid({
  slots,
  revealedSlots,
  onSlotClick,
  currentPhase,
  highlightedSlots,
  selectedRefusalSlot,
  slotRefs,
  isSpectator = false,
}: CompactBattleGridProps) {
  const theme = usePairingTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Calculate responsive row height to match card height exactly
  // < 730px: 95px (card height), >= 730px: 120px (card height)
  const rowHeight = windowHeight < 730 ? 95 : 120;

  // Calculate responsive VS indicator spacing
  // < 730px: small margin, >= 730px: normal margin
  const vsMarginVertical = windowHeight < 730 ? theme.spacing.xs : theme.spacing.sm;

  // Determine which slots are active based on current phase
  const isDefenderPhase = currentPhase.includes('defender') && !currentPhase.includes('reveal');
  const isAttackerPhase = currentPhase.includes('attackers') && !currentPhase.includes('reveal');

  // Active slots (user can click here) — none for spectators
  const activeSlots: Set<SlotType> = new Set();
  if (!isSpectator) {
    if (isDefenderPhase) {
      activeSlots.add('blueDefender');
    } else if (isAttackerPhase) {
      activeSlots.add('blueAttacker1');
      activeSlots.add('blueAttacker2');
    }
  }

  return (
    <View id="wrapper-container" style={{ gap: theme.spacing.xs, minHeight: 0, maxHeight: 'fit-content' as any }}>
      {/* Grid container */}
      <View
      id="grid-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
          maxHeight: 'fit-content' as any,
        }}
      >
        {/* Top row - Blue team (User) */}
        <View
        id="top-row"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: theme.spacing.sm,
            justifyContent: 'space-between',
            height: rowHeight,
            flexShrink: 0,
          }}
        >
          {/* Blue Defender Slot */}
          <View
            style={{ flex: 1, minWidth: 0, alignItems: 'center' }}
          >
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['blueDefender'] = el)}
              slotType="blueDefender"
              player={slots.blueDefender}
              faceDown={isSpectator && !revealedSlots.has('blueDefender')}
              onSlotClick={onSlotClick}
              isActive={activeSlots.has('blueDefender')}
              isHighlighted={activeSlots.has('blueDefender') && !slots.blueDefender}
            />
          </View>

          {/* Blue Attacker Slots */}
          <View
            style={{
              flex: 1,
              minWidth: 0,
              flexDirection: 'row',
              gap: theme.spacing.xs,
              justifyContent: 'center',
            }}
          >
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['blueAttacker1'] = el)}
              slotType="blueAttacker1"
              player={slots.blueAttacker1}
              faceDown={isSpectator && !revealedSlots.has('blueAttacker1')}
              onSlotClick={onSlotClick}
              isActive={activeSlots.has('blueAttacker1')}
              isHighlighted={activeSlots.has('blueAttacker1') && !slots.blueAttacker1}
            />
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['blueAttacker2'] = el)}
              slotType="blueAttacker2"
              player={slots.blueAttacker2}
              faceDown={isSpectator && !revealedSlots.has('blueAttacker2')}
              onSlotClick={onSlotClick}
              isActive={activeSlots.has('blueAttacker2')}
              isHighlighted={activeSlots.has('blueAttacker2') && !slots.blueAttacker2}
            />
          </View>
        </View>

        {/* VS Indicators between rows */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginVertical: vsMarginVertical,
            flexShrink: 0,
          }}
        >
          {/* VS badge for left column (defenders) */}
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.round,
              ...theme.shadows.sm,
            }}
          >
            <Text
              style={{
                color: theme.colors.white,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.bold as any,
              }}
            >
              VS
            </Text>
          </View>

          {/* VS badge for right column (attackers) */}
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.round,
              ...theme.shadows.sm,
            }}
          >
            <Text
              style={{
                color: theme.colors.white,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.bold as any,
              }}
            >
              VS
            </Text>
          </View>
        </View>

        {/* Bottom row - Red team (Opponent) */}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: theme.spacing.sm,
            justifyContent: 'space-between',
            height: rowHeight,
            flexShrink: 0,
          }}
        >
          {/* Red Attacker Slots (faces Blue Defender) */}
          <View
            style={{
              flex: 1,
              minWidth: 0,
              flexDirection: 'row',
              gap: theme.spacing.xs,
              justifyContent: 'center',
            }}
          >
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['redAttacker1'] = el)}
              slotType="redAttacker1"
              player={slots.redAttacker1}
              faceDown={!revealedSlots.has('redAttacker1')}
              onSlotClick={onSlotClick}
              isActive={false}
              isHighlighted={highlightedSlots?.has('redAttacker1')}
              isRefusalSelected={selectedRefusalSlot === 'redAttacker1'}
              isDimmed={!!selectedRefusalSlot && selectedRefusalSlot !== 'redAttacker1'}
            />
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['redAttacker2'] = el)}
              slotType="redAttacker2"
              player={slots.redAttacker2}
              faceDown={!revealedSlots.has('redAttacker2')}
              onSlotClick={onSlotClick}
              isActive={false}
              isHighlighted={highlightedSlots?.has('redAttacker2')}
              isRefusalSelected={selectedRefusalSlot === 'redAttacker2'}
              isDimmed={!!selectedRefusalSlot && selectedRefusalSlot !== 'redAttacker2'}
            />
          </View>

          {/* Red Defender Slot (faces Blue Attacker) */}
          <View
            style={{ flex: 1, minWidth: 0, alignItems: 'center' }}
          >
            <CardSlot
              ref={(el) => slotRefs?.current && (slotRefs.current['redDefender'] = el)}
              slotType="redDefender"
              player={slots.redDefender}
              faceDown={!revealedSlots.has('redDefender')}
              isActive={false} // AI controlled, never active for user
            />
          </View>
        </View>
      </View>
    </View>
  );
}
