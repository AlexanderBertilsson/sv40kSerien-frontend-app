// Bridge layer that adapts Colors[colorScheme] to the theme structure expected by pairing components
import { Colors } from '@/src/constants/Colors';
import { colors as baseColors } from '@/src/constants/theme';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const usePairingTheme = () => {
  const colorScheme = 'dark';
  const themeColors = Colors[colorScheme];

  return {
    colors: {
      primary: themeColors.tint, // orange (#E59500)
      secondary: baseColors.steel,
      background: themeColors.background,
      card: colorScheme === 'dark' ? baseColors.navy : '#F5F9FF',
      text: themeColors.text,
      border: baseColors.steel,
      white: '#FFFFFF',
      black: '#000000',
      error: themeColors.error,
      success: themeColors.success,
      warning: themeColors.warning,
      info: themeColors.info,
      gray: {
        100: colorScheme === 'dark' ? baseColors.silver : '#F5F9FF',
        200: colorScheme === 'dark' ? baseColors.slate : '#E3F2FD',
        300: colorScheme === 'dark' ? baseColors.steel : '#BBDEFB',
        400: baseColors.steel,
        500: baseColors.slate,
        600: baseColors.steel,
        700: baseColors.navy,
        800: baseColors.navy,
        900: baseColors.darkNavy,
      },
    },
    spacing,
    typography,
    borderRadius,
    shadows,
  };
};

export type PairingTheme = ReturnType<typeof usePairingTheme>;
