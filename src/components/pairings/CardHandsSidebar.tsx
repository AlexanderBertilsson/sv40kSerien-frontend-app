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
}: CardHandsSidebarProps) {
  const theme = usePairingTheme();

  const filteredBluePlayers = blueAvailablePlayers.filter(p => !placedBlueCards.has(p.id));

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
