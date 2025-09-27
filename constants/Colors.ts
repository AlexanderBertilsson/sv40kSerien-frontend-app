/**
 * Below are the colors that are used in the app. Colors are defined in theme.ts and mapped to light/dark modes here.
 */

import { colors } from './theme';

export function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

export const Colors = {
  light: {
    text: colors.darkNavy,
    background: colors.slate,
    secondary: colors.silver,
    tint: colors.orange,
    icon: colors.steel,
    tabIconDefault: colors.slate,
    tabIconSelected: colors.orange,
    ctaText: colors.silver,  // Bright text for CTAs
    success: '#4CAF50',
    error: '#F44336',
  },
  dark: {
    text: colors.silver,
    background: colors.darkNavy,
    secondary: colors.navy,
    tint: colors.orange,
    icon: colors.slate,
    tabIconDefault: colors.steel,
    tabIconSelected: colors.orange,
    ctaText: colors.silver,  // Bright text for CTAs
    success: '#4CAF50',
    error: '#F44336',
  },
};
