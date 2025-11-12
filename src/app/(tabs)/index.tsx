import { View, StyleSheet, useColorScheme, Pressable, Text } from 'react-native';
import { useState, useRef } from 'react';
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
