import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect, forwardRef } from 'react';
import { Player } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import PlayerCard from './PlayerCard';
import FaceDownCard from './FaceDownCard';

export type SlotType = 'blueDefender' | 'blueAttacker1' | 'blueAttacker2' | 'redDefender' | 'redAttacker1' | 'redAttacker2';

interface CardSlotProps {
  slotType: SlotType;
  player: Player | null;
  faceDown?: boolean;
  onSlotClick?: (slotType: SlotType, clickX: number, clickY: number) => void;
  isActive?: boolean;
  isHighlighted?: boolean;
  isRefusalSelected?: boolean;
  isDimmed?: boolean;
}

const CardSlot = forwardRef<View, CardSlotProps>(({
  slotType,
  player,
  faceDown = false,
  onSlotClick,
  isActive = true,
  isHighlighted = false,
  isRefusalSelected = false,
  isDimmed = false,
}, ref) => {
  const theme = usePairingTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Calculate responsive card dimensions (match PlayerCard)
  const cardWidth = windowHeight < 730 ? 65 : 80;
  const cardHeight = windowHeight < 730 ? 95 : 120;
  const iconSize = windowHeight < 730 ? 32 : 40;

  // Determine slot properties
  const isDefender = slotType.includes('Defender');
  const isBlueTeam = slotType.startsWith('blue');
  const slotColor = isBlueTeam ? '#3b82f6' : '#ef4444';
  const team = isBlueTeam ? 'A' : 'B';

  // Flashing animation for highlighted slots
  const flashProgress = useSharedValue(0);

  useEffect(() => {
    if (isHighlighted && !isRefusalSelected && !isDimmed) {
      // Flash between team color and bright white
      flashProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 700 })
        ),
        -1, // infinite
      );
    } else {
      flashProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isHighlighted, isRefusalSelected, isDimmed]);

  const flashBrightColor = '#e8edf5';

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      flashProgress.value,
      [0, 1],
      [slotColor, flashBrightColor],
    );
    const backgroundColor = interpolateColor(
      flashProgress.value,
      [0, 1],
      ['transparent', 'rgba(255, 255, 255, 0.08)'],
    );
    return {
      borderColor,
      backgroundColor,
      borderRadius: theme.borderRadius.md,
    };
  });

  // Get icon and label for empty state
  const getEmptyStateContent = () => {
    if (isDefender) {
      return {
        icon: 'shield' as const,
        label: 'Defender',
      };
    } else {
      const attackerNumber = slotType.includes('1') ? '1' : '2';
      return {
        icon: 'sword-cross' as const,
        label: `Attacker ${attackerNumber}`,
      };
    }
  };

  const { icon, label } = getEmptyStateContent();
  const isEmpty = !player;

  // Get border styles based on highlight state
  const getBorderStyle = () => {
    if (isRefusalSelected) {
      return {
        borderWidth: 3,
        borderStyle: 'solid' as any,
        borderColor: theme.colors.error,
      };
    }
    if (isHighlighted) {
      return {
        borderWidth: 2,
        borderStyle: 'dashed' as any,
        borderColor: slotColor, // overridden by flash animation
      };
    }
    // Normal state
    return {
      borderWidth: 2,
      borderStyle: 'dashed' as any,
      borderColor: slotColor,
    };
  };

  const handlePress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    // Allow clicking during refusal phase even if filled
    if (isHighlighted || isRefusalSelected) {
      if (onSlotClick) {
        onSlotClick(slotType, pageX, pageY);
      }
      return;
    }
    // Normal phase: allow clicking active slots (empty or filled for replacement)
    if (isActive && onSlotClick) {
      onSlotClick(slotType, pageX, pageY);
    }
  };

  const borderStyle = getBorderStyle();

  const isFlashing = isHighlighted && !isRefusalSelected && !isDimmed;

  // When a filled slot is highlighted/selected, make the container slightly larger
  // so the flashing border is visible around the card
  const needsBorderSpace = (isHighlighted || isRefusalSelected) && !isEmpty;
  const borderPad = needsBorderSpace ? 6 : 0;
  const containerWidth = cardWidth + borderPad;
  const containerHeight = cardHeight + borderPad;

  return (
    <View ref={ref} collapsable={false}>
      <Pressable
        onPress={(event) => handlePress(event)}
        disabled={!isActive && !isHighlighted && !isRefusalSelected}
        style={{
          height: containerHeight,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDimmed ? 0.4 : (isActive || isHighlighted || isRefusalSelected ? 1 : 0.5),
        }}
      >
        <Animated.View
          style={[
            {
              width: containerWidth,
              height: containerHeight,
              borderRadius: theme.borderRadius.md,
              ...borderStyle,
              alignItems: 'center',
              justifyContent: 'center',
            },
            isFlashing ? animatedStyle : undefined,
          ]}
        >
          {isEmpty ? (
            // Empty state
            <>
              <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={slotColor}
                style={{ opacity: 0.5 }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  color: slotColor,
                  fontWeight: theme.typography.weights.medium as any,
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
            </>
          ) : (
            // Filled state
            faceDown ? (
              <FaceDownCard team={team as 'A' | 'B'} width={cardWidth} height={cardHeight} />
            ) : (
              <PlayerCard
                player={player}
                state="available"
              />
            )
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});

export default CardSlot;
