import { View, Text, useWindowDimensions } from 'react-native';
import { Pairing } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import PlayerCard from './PlayerCard';

interface PairingTableProps {
  pairing: Pairing;
  showRound?: boolean;
  compact?: boolean; // For mobile sidebar mode
}

export default function PairingTable({ pairing, showRound = true, compact = false }: PairingTableProps) {
  const theme = usePairingTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;

  // Use compact mode on mobile or when explicitly set
  const useCompact = compact || isMobile;

  return (
    <View
      testID={`pairing-table-${pairing.tableNumber}`}
      style={{
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: useCompact ? theme.spacing.xs : theme.spacing.sm,
        borderWidth: useCompact ? 1 : 2,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
      }}
    >
      {/* Header with table number, layout badge, and round */}
      <View
        testID={`pairing-table-${pairing.tableNumber}-header`}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: useCompact ? theme.spacing.xs : theme.spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: useCompact ? 4 : theme.spacing.xs }}>
          <Text
            testID={`pairing-table-${pairing.tableNumber}-number`}
            style={{
              fontSize: useCompact ? 10 : theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.bold as any,
              color: theme.colors.text,
            }}
          >
            T{pairing.tableNumber}
          </Text>

          {/* Layout indicator badge */}
          {pairing.layout && (
            <View
              testID={`pairing-table-${pairing.tableNumber}-layout-badge`}
              style={{
                paddingHorizontal: useCompact ? 3 : theme.spacing.xs,
                paddingVertical: useCompact ? 1 : 2,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.gray[200],
                borderWidth: 1,
                borderColor: theme.colors.gray[400],
              }}
            >
              <Text
                style={{
                  fontSize: useCompact ? 7 : theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.medium as any,
                  color: theme.colors.gray[700],
                }}
              >
                {pairing.layout.replace('layout', 'L')}
              </Text>
            </View>
          )}
        </View>

        {showRound && (
          <View
            testID={`pairing-table-${pairing.tableNumber}-round-badge`}
            style={{
              paddingHorizontal: useCompact ? 4 : theme.spacing.sm,
              paddingVertical: useCompact ? 2 : 4,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text
              testID={`pairing-table-${pairing.tableNumber}-round-number`}
              style={{
                fontSize: useCompact ? 8 : theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.medium as any,
                color: theme.colors.white,
              }}
            >
              R{pairing.createdInRound}
            </Text>
          </View>
        )}
      </View>

      {/* Players with VS - vertical layout on compact mode */}
      <View
        testID={`pairing-table-${pairing.tableNumber}-matchup`}
        style={{
          flexDirection: useCompact ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: useCompact ? 4 : theme.spacing.xs,
        }}
      >
        {/* Team A Player */}
        <View
          testID={`pairing-table-${pairing.tableNumber}-teamA-player`}
          style={useCompact ? { transform: [{ scale: 0.5 }], marginVertical: -20 } : {}}
        >
          <PlayerCard
            player={pairing.teamAPlayer}
            state="paired"
          />
        </View>

        {/* VS Badge */}
        <View
          testID={`pairing-table-${pairing.tableNumber}-vs-badge`}
          style={{
            paddingHorizontal: useCompact ? 4 : theme.spacing.xs,
            paddingVertical: useCompact ? 2 : 4,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.primary,
            ...theme.shadows.sm,
          }}
        >
          <Text
            style={{
              fontSize: useCompact ? 8 : theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.bold as any,
              color: theme.colors.white,
            }}
          >
            VS
          </Text>
        </View>

        {/* Team B Player */}
        <View
          testID={`pairing-table-${pairing.tableNumber}-teamB-player`}
          style={useCompact ? { transform: [{ scale: 0.5 }], marginVertical: -20 } : {}}
        >
          <PlayerCard
            player={pairing.teamBPlayer}
            state="paired"
          />
        </View>
      </View>

      {/* Optional: Show player names below cards for clarity - hidden on compact */}
      {!useCompact && (
        <View
          testID={`pairing-table-${pairing.tableNumber}-names`}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: theme.spacing.xs,
            paddingHorizontal: theme.spacing.xs,
          }}
        >
          <Text
            testID={`pairing-table-${pairing.tableNumber}-teamA-name`}
            style={{
              flex: 1,
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.gray[600],
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {pairing.teamAPlayer.initials}
          </Text>
          <View style={{ width: 24 }} />
          <Text
            testID={`pairing-table-${pairing.tableNumber}-teamB-name`}
            style={{
              flex: 1,
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.gray[600],
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {pairing.teamBPlayer.initials}
          </Text>
        </View>
      )}
    </View>
  );
}
