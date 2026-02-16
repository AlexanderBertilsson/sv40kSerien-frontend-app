import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Player } from '@/src/types/pairing';
import PlayerCard from './PlayerCard';
import FaceDownCard from './FaceDownCard';

interface AnimatedCardTransitionProps {
  player: Player;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
  faceDown?: boolean;
}

export default function AnimatedCardTransition({
  player,
  startPosition,
  endPosition,
  onComplete,
  faceDown = false,
}: AnimatedCardTransitionProps) {
  const { height: windowHeight } = useWindowDimensions();
  const cardWidth = windowHeight < 730 ? 65 : 80;
  const cardHeight = windowHeight < 730 ? 95 : 120;

  const translateX = useSharedValue(startPosition.x);
  const translateY = useSharedValue(startPosition.y);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  useEffect(() => {
    // Small delay to ensure the Animated.View has mounted and painted at startPosition
    const timer = setTimeout(() => {
      const config = {
        duration: 100,
        easing: Easing.out(Easing.quad),
      };
      translateX.value = withTiming(endPosition.x, config);
      translateY.value = withTiming(endPosition.y, config, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: 'fixed' as any,
          top: 0,
          left: 0,
          zIndex: 9999,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {faceDown ? (
        <FaceDownCard
          team={player.team as 'A' | 'B'}
          width={cardWidth}
          height={cardHeight}
        />
      ) : (
        <PlayerCard player={player} state="available" />
      )}
    </Animated.View>
  );
}
