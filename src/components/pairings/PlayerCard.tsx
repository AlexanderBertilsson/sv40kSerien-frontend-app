import { View, Text, useWindowDimensions } from 'react-native';
import { Player, PlayerState } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';

interface PlayerCardProps {
  player: Player;
  state?: PlayerState;
  isDragging?: boolean;
  isSelected?: boolean;
}

export default function PlayerCard({
  player,
  state = 'available',
  isDragging,
  isSelected,
}: PlayerCardProps) {
  const theme = usePairingTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Calculate responsive card dimensions
  // < 730px: smaller cards (65x95), >= 730px: normal cards (80x120)
  const cardWidth = windowHeight < 730 ? 65 : 80;
  const cardHeight = windowHeight < 730 ? 95 : 120;
  const avatarSize = windowHeight < 730 ? 32 : 40;

  // Determine card styling based on state
  const getCardStyle = () => {
    const baseStyle = {
      width: cardWidth,
      height: cardHeight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: theme.spacing.xs,
      borderWidth: 2,
      borderColor: player.color,
      backgroundColor: theme.colors.card,
      ...theme.shadows.md,
    };

    // Apply state-specific styles
    if (isDragging) {
      return { ...baseStyle, opacity: 0.5 };
    }

    if (isSelected) {
      return {
        ...baseStyle,
        borderColor: theme.colors.primary,
        borderWidth: 3,
        ...theme.shadows.lg,
      };
    }

    if (state === 'paired') {
      return {
        ...baseStyle,
        opacity: 0.6,
        backgroundColor: theme.colors.gray[100],
      };
    }

    if (state === 'refused') {
      return {
        ...baseStyle,
        borderColor: theme.colors.error,
        backgroundColor: '#fee2e2', // Light red tint
      };
    }

    if (state === 'defender') {
      return {
        ...baseStyle,
        borderColor: theme.colors.success,
        backgroundColor: '#d1fae5', // Light green tint
      };
    }

    if (state === 'attacker') {
      return {
        ...baseStyle,
        borderColor: theme.colors.warning,
        backgroundColor: '#fef3c7', // Light yellow tint
      };
    }

    return baseStyle;
  };

  const getAvatarStyle = () => {
    return {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: player.color,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...theme.shadows.sm,
    };
  };

  const cardContent = (
    <>
      {/* Avatar with initials */}
      <View style={getAvatarStyle()}>
        <Text
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.bold as any,
          }}
        >
          {player.initials}
        </Text>
      </View>

      {/* Team badge */}
      <View
        style={{
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: player.color,
        }}
      >
        <Text
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium as any,
          }}
        >
          Team {player.team}
        </Text>
      </View>
    </>
  );

  return (
    <View style={getCardStyle()}>
      {cardContent}
    </View>
  );
}
