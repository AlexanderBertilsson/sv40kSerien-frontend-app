import { View, Text, useWindowDimensions } from 'react-native';
import { Player, PlayerState } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import { FactionIcon, hasFactionIcon } from '@/src/components/FactionIcon';

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

  // Check if we have a valid faction to display
  const showFactionIcon = player.faction && hasFactionIcon(player.faction);
  const displayText = player.faction || player.username || `Team ${player.team}`;

  // Truncate long faction names for the badge
  const truncatedFaction = displayText.length > 12
    ? displayText.slice(0, 11) + '…'
    : displayText;

  // Short text for avatar fallback (first 2 chars of faction or username)
  const avatarText = (player.faction || player.username || player.team)?.slice(0, 2).toUpperCase() || '??';

  const cardContent = (
    <>
      {/* Avatar with faction icon or short text fallback */}
      <View style={getAvatarStyle()}>
        {showFactionIcon ? (
          <FactionIcon
            faction={player.faction!}
            size={avatarSize * 0.65}
            color={theme.colors.white}
          />
        ) : (
          <Text
            style={{
              color: theme.colors.white,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.bold as any,
            }}
          >
            {avatarText}
          </Text>
        )}
      </View>

      {/* Faction/Team badge */}
      <View
        style={{
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: player.color,
          maxWidth: cardWidth - theme.spacing.sm * 2,
        }}
      >
        <Text
          style={{
            color: theme.colors.white,
            fontSize: windowHeight < 730 ? 8 : theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium as any,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {truncatedFaction}
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
