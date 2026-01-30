import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
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
}

const CardSlot = forwardRef<View, CardSlotProps>(({
  slotType,
  player,
  faceDown = false,
  onSlotClick,
  isActive = true,
  isHighlighted = false,
  isRefusalSelected = false,
}, ref) => {
  const theme = usePairingTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Calculate responsive card dimensions (match PlayerCard)
  const cardWidth = windowHeight < 730 ? 65 : 80;
  const cardHeight = windowHeight < 730 ? 95 : 120;
  const iconSize = windowHeight < 730 ? 32 : 40;

  // Pulsing animation for highlighted slots
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isHighlighted && !isRefusalSelected) {
      // Start pulsing animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1.0, { duration: 800 })
        ),
        -1, // infinite
        true // reverse
      );
    } else {
      // Stop pulsing
      pulseScale.value = withTiming(1.0, { duration: 200 });
    }
  }, [isHighlighted, isRefusalSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Determine slot properties
  const isDefender = slotType.includes('Defender');
  const isBlueTeam = slotType.startsWith('blue');
  const slotColor = isBlueTeam ? '#3b82f6' : '#ef4444';
  const team = isBlueTeam ? 'A' : 'B';

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
        borderStyle: 'solid' as any,
        borderColor: theme.colors.warning || '#f59e0b',
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

  return (
    <View ref={ref} collapsable={false}>
      <Pressable
        onPress={(event) => handlePress(event)}
        disabled={!isActive && !isHighlighted && !isRefusalSelected}
        style={{
          height: cardHeight,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isActive || isHighlighted || isRefusalSelected ? 1 : 0.5,
        }}
      >
        <Animated.View style={animatedStyle}>
          {isEmpty ? (
            // Empty state
            <View
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: theme.borderRadius.md,
                ...borderStyle,
                backgroundColor: theme.colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.xs,
              }}
            >
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
            </View>
          ) : (
            // Filled state - wrap with border when highlighted/selected
            <View
              style={{
                borderRadius: theme.borderRadius.md,
                ...(isHighlighted || isRefusalSelected ? borderStyle : {}),
              }}
            >
              {faceDown ? (
                <FaceDownCard team={team as 'A' | 'B'} width={cardWidth} height={cardHeight} />
              ) : (
                <PlayerCard
                  player={player}
                  state="available"
                                 />
              )}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});

export default CardSlot;
