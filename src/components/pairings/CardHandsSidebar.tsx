import { View, Text, Pressable } from 'react-native';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import CardHand from './CardHand';
import { Player } from '@/src/types/pairing';

interface CardHandsSidebarProps {
  // Blue team
  blueAvailablePlayers: Player[];
  selectedCard: Player | null;
  placedBlueCards: Set<string>;
  blueHandRef?: any;
  onOpenBlueHand: () => void;

  // Red team
  redAvailablePlayers: Player[];
  redHandRef?: any;
  onOpenRedHand: () => void;

  // Layout picker / coinflip indicator
  currentLayoutPicker?: 'A' | 'B' | null;
  coinflipWinner?: 'A' | 'B' | null;
  showCoinflipWinner?: boolean; // Show during refuse phase
}

export default function CardHandsSidebar({
  blueAvailablePlayers,
  selectedCard,
  placedBlueCards,
  blueHandRef,
  onOpenBlueHand,
  redAvailablePlayers,
  redHandRef,
  onOpenRedHand,
  currentLayoutPicker,
  coinflipWinner,
  showCoinflipWinner,
}: CardHandsSidebarProps) {
  const theme = usePairingTheme();

  const filteredBluePlayers = blueAvailablePlayers.filter(p => !placedBlueCards.has(p.id));

  // Coinflip Winner Marker (shown during refuse phase)
  const CoinflipWinnerMarker = ({ team }: { team: 'A' | 'B' }) => {
    if (!showCoinflipWinner || coinflipWinner !== team) return null;
    return (
      <View style={{
        backgroundColor: '#10b981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
        marginBottom: 4,
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 7, textAlign: 'center' }}>
          🏆 Picks First
        </Text>
      </View>
    );
  };

  // Layout Picker Marker (shown during layout-select phase)
  const LayoutPickerMarker = ({ team }: { team: 'A' | 'B' }) => {
    if (currentLayoutPicker !== team) return null;
    return (
      <View style={{
        backgroundColor: '#f59e0b',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
        marginBottom: 4,
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 8, textAlign: 'center' }}>
          🎯 Picking
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        width: '22%',
        padding: 2,
        justifyContent: 'space-between',
      }}
      id="card-hands-sidebar"
    >
      {/* Blue Team Hand - tap to open modal */}
      <Pressable id="blue-hand" onPress={onOpenBlueHand} style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <CoinflipWinnerMarker team="A" />
        <LayoutPickerMarker team="A" />
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.bold as any,
            color: '#3b82f6',
            marginBottom: theme.spacing.xs,
          }}
        >
          Blue
        </Text>
        <CardHand
          ref={blueHandRef}
          team="A"
          availablePlayers={filteredBluePlayers}
          faceDown={false}
          isExpanded={false}
          selectedCard={selectedCard}
          disabled={true}
          compact={true}
        />
      </Pressable>

      {/* Red Team Hand - tap to open modal */}
      <Pressable id='red-hand' onPress={onOpenRedHand} style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <CoinflipWinnerMarker team="B" />
        <LayoutPickerMarker team="B" />
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.bold as any,
            color: '#ef4444',
            marginBottom: theme.spacing.xs,
          }}
        >
          Red
        </Text>
        <CardHand
          ref={redHandRef}
          team="B"
          availablePlayers={redAvailablePlayers}
          faceDown={false}
          isExpanded={false}
          disabled={true}
          compact={true}
        />
      </Pressable>
    </View>
  );
}
