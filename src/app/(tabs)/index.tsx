import { View, StyleSheet, useColorScheme, Pressable, Text } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { ConfettiAnimation } from '@/src/components/animations/ConfettiAnimation';
import { hexToRgba } from '@/src/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const [showConfetti, setShowConfetti] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);

  const handleButtonPress = () => {
    // Measure button position for confetti origin
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonPosition({ 
        x: x + width / 2,  // Center X
        y: y + height / 2   // Center Y
      });
      setShowConfetti(true);  // Trigger the animation
    });
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);  // Reset for next time
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type='title'>Home</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText>Track your battles, achievements, and glory!</ThemedText>
      
      <Pressable 
        ref={buttonRef}
        style={[styles.testButton, { backgroundColor: hexToRgba(theme.tint, 0.9) }]}
        onPress={handleButtonPress}
      >
        <Text style={styles.buttonText}>🎉 Test Confetti Animation</Text>
      </Pressable>

      <ConfettiAnimation
        trigger={showConfetti}
        originX={buttonPosition.x}
        originY={buttonPosition.y}
        onComplete={handleConfettiComplete}
      />

      {/* Reanimated 4 test */}
      <ReanimatedTest />
    </View>
  );
}

function ReanimatedTest() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [inSlotB, setInSlotB] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const slotARef = useRef<View>(null);
  const slotBRef = useRef<View>(null);

  const boxSize = 80;

  const animStyle = useAnimatedStyle(() => ({
    width: boxSize,
    height: boxSize,
    backgroundColor: 'tomato',
    borderRadius: 8,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Place the card at Slot A on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      slotARef.current?.measureInWindow((x, y) => {
        translateX.value = x;
        translateY.value = y;
        setInitialized(true);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => {
    const toRef = inSlotB ? slotARef : slotBRef;

    toRef.current?.measureInWindow((tx, ty) => {
      const config = { duration: 400, easing: Easing.out(Easing.quad) };
      translateX.value = withTiming(tx, config);
      translateY.value = withTiming(ty, config);
      setInSlotB(!inSlotB);
    });
  };

  return (
    <View style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
      <Text style={{ color: '#fff', fontSize: 14 }}>Reanimated 4 FLIP Test</Text>
      <View style={{ flexDirection: 'row', width: 500, maxWidth: '100%', justifyContent: 'space-between' }}>
        <Pressable onPress={toggle}>
          <View
            ref={slotARef}
            style={{
              width: boxSize, height: boxSize,
              borderWidth: 2, borderColor: '#3b82f6',
              borderRadius: 8, borderStyle: 'dashed',
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ color: '#3b82f6', fontSize: 10 }}>Slot A</Text>
          </View>
        </Pressable>

        <Pressable onPress={toggle}>
          <View
            ref={slotBRef}
            style={{
              width: boxSize, height: boxSize,
              borderWidth: 2, borderColor: '#ef4444',
              borderRadius: 8, borderStyle: 'dashed',
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ef4444', fontSize: 10 }}>Slot B</Text>
          </View>
        </Pressable>
      </View>

      {/* Animated card overlay - uses screen coordinates */}
      {initialized && (
        <Animated.View
          style={[
            { position: 'fixed' as any, top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' },
            animStyle,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 24,
  },
  testButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
