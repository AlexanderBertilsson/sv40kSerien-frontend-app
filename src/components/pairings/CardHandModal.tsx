import { View, Pressable, useWindowDimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Player } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import PlayerCard from './PlayerCard';
import FaceDownCard from './FaceDownCard';

interface CardHandModalProps {
  visible: boolean;
  team: 'A' | 'B';
  players: Player[];
  selectedCard: Player | null;
  onCardPress: (player: Player) => void;
  onClose: () => void;
  faceDown?: boolean;
}

export default function CardHandModal({
  visible,
  team,
  players,
  selectedCard,
  onCardPress,
  onClose,
  faceDown = false,
}: CardHandModalProps) {
  const theme = usePairingTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const displayCards = players.slice(0, 5);
  const totalCards = displayCards.length;
  const teamColor = team === 'A' ? '#3b82f6' : '#ef4444';
  const teamName = team === 'A' ? 'Blue' : 'Red';

  // Card dimensions
  const cardWidth = 65;
  const cardHeight = 95;

  // Calculate arc positions for fan layout - spread out for easier finger tapping
  const calculateFanPosition = (index: number, total: number) => {
    const arcSpan = 80; // degrees - wider spread for easier selection
    const arcRadius = 250; // larger radius for more spacing
    const centerIndex = (total - 1) / 2;
    const angleOffset = total > 1
      ? ((index - centerIndex) / (total - 1)) * arcSpan
      : 0;
    const angleRad = (angleOffset * Math.PI) / 180;

    return {
      x: Math.sin(angleRad) * arcRadius,
      y: -Math.cos(angleRad) * arcRadius * 0.25 + 20,
      rotation: angleOffset * 0.4, // less rotation for better readability
    };
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {/* Backdrop - click to close */}
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Card fan container - centered */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -cardWidth / 2 },
            { translateY: -cardHeight / 2 },
          ],
          width: cardWidth,
          height: cardHeight,
        }}
      >
        {/* Team label */}
        <View
          style={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: [{ translateX: -30 }],
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            backgroundColor: teamColor,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text
            style={{
              color: theme.colors.white,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.bold as any,
            }}
          >
            {teamName}
          </Text>
        </View>

        {/* Cards in fan layout */}
        {displayCards.map((player, index) => {
          const pos = calculateFanPosition(index, totalCards);
          const isSelected = selectedCard?.id === player.id;

          return (
            <AnimatedCard
              key={player.id}
              player={player}
              position={pos}
              isSelected={isSelected}
              faceDown={faceDown}
              team={team}
              onPress={() => onCardPress(player)}
              theme={theme}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          );
        })}
      </View>

      {/* Instruction text */}
      <View
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.sizes.sm,
            textAlign: 'center',
          }}
        >
          {team === 'A' ? 'Tap a card to select' : 'Tap anywhere to close'}
        </Text>
      </View>
    </View>
  );
}

// Individual animated card
interface AnimatedCardProps {
  player: Player;
  position: { x: number; y: number; rotation: number };
  isSelected: boolean;
  faceDown: boolean;
  team: 'A' | 'B';
  onPress: () => void;
  theme: any;
  cardWidth: number;
  cardHeight: number;
}

function AnimatedCard({
  player,
  position,
  isSelected,
  faceDown,
  team,
  onPress,
  theme,
  cardWidth,
  cardHeight,
}: AnimatedCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Animate to fan position
    translateX.value = withTiming(position.x, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(position.y, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    rotation.value = withTiming(position.rotation, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [position]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={{
          borderWidth: isSelected ? 3 : 0,
          borderColor: '#3b82f6',
          borderRadius: theme.borderRadius.md,
          padding: isSelected ? 2 : 0,
        }}
      >
        {faceDown ? (
          <FaceDownCard team={team} width={cardWidth} height={cardHeight} />
        ) : (
          <PlayerCard player={player} state="available" />
        )}
      </Pressable>
    </Animated.View>
  );
}
