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
     text: colors.silver,
    background: colors.darkNavy,
    secondary: colors.navy,
    tint: colors.orange,
    icon: colors.slate,
    tabIconDefault: colors.steel,
    tabIconSelected: colors.orange,
    ctaText: colors.silver,  // Bright text for CTAs
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
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
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};
