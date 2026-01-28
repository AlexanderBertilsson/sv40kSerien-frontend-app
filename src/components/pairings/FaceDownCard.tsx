import { View, Text } from 'react-native';
import { usePairingTheme } from '@/src/theme/pairingTheme';

interface FaceDownCardProps {
  team: 'A' | 'B';
  width?: number;
  height?: number;
}

export default function FaceDownCard({
  team,
  width = 80,
  height = 120,
}: FaceDownCardProps) {
  const theme = usePairingTheme();

  const teamColor = team === 'A' ? '#3b82f6' : '#ef4444'; // Blue or Red

  return (
    <View
      style={{
        width,
        height,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        borderWidth: 3,
        borderColor: teamColor,
        backgroundColor: theme.colors.gray[100],
        ...theme.shadows.md,
      }}
    >
      {/* Card back symbol */}
      <Text style={{ fontSize: 40, opacity: 0.3 }}>🂠</Text>

      {/* Team indicator */}
      <View
        style={{
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: teamColor,
        }}
      >
        <Text
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium as any,
          }}
        >
          Team {team}
        </Text>
      </View>

      {/* Hidden label */}
      <Text
        style={{
          color: theme.colors.gray[500],
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.medium as any,
        }}
      >
        Hidden
      </Text>
    </View>
  );
}
