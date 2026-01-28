import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { Pairing } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import PairingTable from './PairingTable';

interface PairingBoardProps {
  pairings: Pairing[];
  sidebarMode?: boolean;
}

const DESKTOP_BREAKPOINT = 900;

export default function PairingBoard({ pairings, sidebarMode = false }: PairingBoardProps) {
  const theme = usePairingTheme();
  const { width } = useWindowDimensions();
  const isDesktop = !sidebarMode && Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const isMobile = width < DESKTOP_BREAKPOINT;

  // Create array of 5 slots (some may be empty)
  const slots = Array.from({ length: 5 }, (_, index) => {
    const tableNumber = index + 1;
    return pairings.find(p => p.tableNumber === tableNumber) || null;
  });

  const renderEmptySlot = (tableNumber: number) => (
    <View
      key={`empty-${tableNumber}`}
      testID={`pairing-table-${tableNumber}-empty`}
      style={{
        minHeight: isMobile ? 40 : 80,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderWidth: isMobile ? 1 : 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        padding: isMobile ? theme.spacing.xs : theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        testID={`pairing-table-${tableNumber}-empty-number`}
        style={{
          fontSize: isMobile ? 10 : theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.bold as any,
          color: theme.colors.gray[400],
        }}
      >
        T{tableNumber}
      </Text>
      {!isMobile && (
        <Text
          testID={`pairing-table-${tableNumber}-empty-status`}
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.gray[400],
            marginTop: theme.spacing.xs,
          }}
        >
          Not yet paired
        </Text>
      )}
    </View>
  );

  if (isDesktop) {
    // Desktop: Grid layout (2x2 + 1 centered)
    return (
      <View
        testID="pairing-board"
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.md,
        }}
      >
        <Text
          testID="pairing-board-title"
          style={{
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.bold as any,
            color: theme.colors.text,
            marginBottom: theme.spacing.lg,
            textAlign: 'center',
          }}
        >
          Pairing Board
        </Text>

        {/* Top row: Tables 1-2 */}
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <View style={{ flex: 1 }}>
            {slots[0] ? <PairingTable pairing={slots[0]} /> : renderEmptySlot(1)}
          </View>
          <View style={{ flex: 1 }}>
            {slots[1] ? <PairingTable pairing={slots[1]} /> : renderEmptySlot(2)}
          </View>
        </View>

        {/* Middle row: Tables 3-4 */}
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <View style={{ flex: 1 }}>
            {slots[2] ? <PairingTable pairing={slots[2]} /> : renderEmptySlot(3)}
          </View>
          <View style={{ flex: 1 }}>
            {slots[3] ? <PairingTable pairing={slots[3]} /> : renderEmptySlot(4)}
          </View>
        </View>

        {/* Bottom row: Table 5 (centered) */}
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View style={{ width: '48%' }}>
            {slots[4] ? <PairingTable pairing={slots[4]} /> : renderEmptySlot(5)}
          </View>
        </View>
      </View>
    );
  }

  // Mobile/Sidebar: Vertical list
  return (
    <View
      testID="pairing-board"
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: isMobile ? theme.spacing.xs : theme.spacing.sm,
        ...theme.shadows.sm,
      }}
    >
      <Text
        testID="pairing-board-title"
        style={{
          fontSize: isMobile ? theme.typography.sizes.sm : theme.typography.sizes.md,
          fontWeight: theme.typography.weights.bold as any,
          color: theme.colors.text,
          marginBottom: isMobile ? theme.spacing.xs : theme.spacing.sm,
          textAlign: 'center',
        }}
      >
        Pairings
      </Text>

      <View style={{ gap: isMobile ? theme.spacing.xs : theme.spacing.sm }}>
        {slots.map((pairing, index) => {
          const tableNumber = index + 1;
          return pairing ? (
            <PairingTable key={pairing.id} pairing={pairing} compact={isMobile} />
          ) : (
            renderEmptySlot(tableNumber)
          );
        })}
      </View>
    </View>
  );
}
