import { View, Text, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePairingTheme } from '@/src/theme/pairingTheme';

interface RotateDeviceOverlayProps {
  minWidth?: number;
}

/**
 * Shows an overlay prompting user to rotate their device to landscape
 * when screen width is below minWidth (default 600px)
 */
export default function RotateDeviceOverlay({ minWidth = 600 }: RotateDeviceOverlayProps) {
  const { width, height } = useWindowDimensions();
  const theme = usePairingTheme();

  // Only show if width is below minimum AND we're in portrait mode (width < height)
  const isPortrait = width < height;
  const isTooNarrow = width <= minWidth;

  if (!isPortrait || !isTooNarrow) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: theme.spacing.lg,
      }}
    >
      <MaterialCommunityIcons
        name="phone-rotate-landscape"
        size={80}
        color={theme.colors.primary}
        style={{ marginBottom: theme.spacing.lg }}
      />
      <Text
        style={{
          fontSize: theme.typography.sizes.xl,
          fontWeight: theme.typography.weights.bold as any,
          color: theme.colors.text,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        Please Rotate Your Device
      </Text>
      <Text
        style={{
          fontSize: theme.typography.sizes.md,
          color: theme.colors.gray[600],
          textAlign: 'center',
        }}
      >
        This app works best in landscape mode
      </Text>
    </View>
  );
}
