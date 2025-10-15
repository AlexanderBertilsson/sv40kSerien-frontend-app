import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: any;
  disabled?: boolean;
}

export function Button({ onPress, title, style, disabled }: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.tint }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText style={[styles.text, { color: theme.ctaText }]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
