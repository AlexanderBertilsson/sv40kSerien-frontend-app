import { StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { Colors } from '../../constants/Colors';

export const LEVEL_GRADIENTS: Record<number, [string, string]> = {
  1: ['#EF4444', '#EA580C'],
  2: ['#EA580C', '#F59E0B'],
  3: ['#F59E0B', '#22C55E'],
  4: ['#22C55E', '#0EA5E9'],
  5: ['#0EA5E9', '#10B981'],
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#EF4444',  // red
  2: '#F59E0B',  // amber
  3: '#22C55E',  // green
  4: '#0EA5E9',  // sky blue
  5: '#10B981',  // emerald
};

export function getSportsmanshipColor(level: number): string {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS[1];
}

interface SportsmanshipBarProps {
  level: number;
  progress: number;
  compact?: boolean;
}

export function SportsmanshipBar({ level, progress, compact = false }: SportsmanshipBarProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const gradient = LEVEL_GRADIENTS[level] || LEVEL_GRADIENTS[1];
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.levelBadge, { backgroundColor: gradient[0] }]}>
        <MaterialCommunityIcons name="star-four-points" size={compact ? 14 : 16} color="#fff" />
        <ThemedText style={[styles.levelText, compact && styles.levelTextCompact]}>{level}</ThemedText>
      </View>
      <View style={styles.barWrapper}>
        <View style={[
          styles.barTrackOuter,
          level === 5 && styles.barTrackGlow,
        ]}>
        <View style={[styles.barTrack, { backgroundColor: theme.secondary }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barGradient}
          />
          <View
            style={[
              styles.barOverlay,
              { width: `${100 - clampedProgress}%`, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
            ]}
          />
        </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerCompact: {
    gap: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  levelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelTextCompact: {
    fontSize: 11,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  barTrackOuter: {
    borderRadius: 5,
  },
  barTrackGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  barOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default SportsmanshipBar;
