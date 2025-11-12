import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Platform } from 'react-native';

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiAnimationProps {
  trigger: boolean;
  originX: number;
  originY: number;
  onComplete?: () => void;
}

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
const CONFETTI_COUNT = 20;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function ConfettiAnimation({ trigger, originX, originY, onComplete }: ConfettiAnimationProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  const screenHeight = Dimensions.get('window').height;
  const isAnimating = useRef(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Initialize confetti pieces
  if (confettiPieces.current.length === 0) {
    confettiPieces.current = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(0),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 6 + 4, // 4-10px
    }));
  }

  useEffect(() => {
    // Only start animation if not already running
    if (trigger && !isAnimating.current) {
      isAnimating.current = true;
      setShouldRender(true);
      // Reset all values
      confettiPieces.current.forEach((piece) => {
        piece.x.setValue(0);
        piece.y.setValue(0);
        piece.rotation.setValue(0);
        piece.opacity.setValue(1);
      });

      // Animate each piece with drag physics
      const animations = confettiPieces.current.map((piece) => {
        // Upward arc spread: 45° to 135° (90° arc centered at top)
        // 45° = up-right, 90° = straight up, 135° = up-left
        const angle = (Math.random() * 90 + 45) * (Math.PI / 180);
        // Much higher initial velocity for explosive burst
        const initialVelocity = Math.random() * 200 + 250; // 250-450px
        
        // Calculate burst distances (with drag applied)
        const burstX = Math.cos(angle) * initialVelocity * 0.6; // 60% of velocity due to drag
        const burstY = -Math.sin(angle) * initialVelocity * 0.6; // Negative = upward in screen coordinates
        
        // Final fall position (straight down from burst endpoint)
        const fallY = screenHeight;

        return Animated.parallel([
          // Horizontal: Very fast burst with rapid deceleration
          Animated.sequence([
            Animated.timing(piece.x, {
              toValue: burstX,
              duration: 300, // Much faster burst - explosive acceleration
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            // Horizontal movement stops (drag effect)
          ]),
          
          // Vertical: Explosive burst out, then fall straight down
          Animated.sequence([
            // Initial burst with rapid acceleration
            Animated.timing(piece.y, {
              toValue: burstY,
              duration: 300, // Match horizontal burst - very fast
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            // Slow fall straight down
            Animated.timing(piece.y, {
              toValue: fallY,
              duration: 1000, // Shorter fall
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
          
          // Rotation throughout
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 720 - 360,
            duration: 800, // Shorter rotation
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          
          // Fade out 500ms after falling starts
          Animated.sequence([
            Animated.delay(300), // Burst duration (300ms)
            Animated.timing(piece.opacity, {
              toValue: 0,
              duration: 500, // Fade out in 500ms
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
        ]);
      });

      Animated.parallel(animations).start(() => {
        isAnimating.current = false;
        setShouldRender(false);
        onComplete?.();
      });
    }
  }, [trigger, screenHeight, onComplete]);

  if (!shouldRender) return null;

  return (
    <View style={[styles.container, { left: originX, top: originY }]} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              // Center pieces at origin by offsetting by half their size
              left: -piece.size / 2,
              top: -piece.size / 2,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
              ],
              opacity: piece.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 10000,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
});
