import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, TouchableOpacityProps, TextProps } from 'react-native';
import { usePairingTheme } from '@/src/theme/pairingTheme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  textStyle?: TextStyle;
}

export const Button = React.forwardRef<View, ButtonProps>(
  ({ variant = 'primary', size = 'md', style, textStyle, children, ...props }, ref) => {
    const theme = usePairingTheme();

    const getVariantStyle = (): ViewStyle => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: theme.colors.primary,
          };
        case 'secondary':
          return {
            backgroundColor: theme.colors.secondary,
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
          };
        default:
          return {};
      }
    };

    const getSizeStyle = (): ViewStyle => {
      switch (size) {
        case 'sm':
          return {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
          };
        case 'lg':
          return {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
          };
        default:
          return {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
          };
      }
    };

    const getTextSize = (): number => {
      switch (size) {
        case 'sm':
          return theme.typography.sizes.sm;
        case 'lg':
          return theme.typography.sizes.lg;
        default:
          return theme.typography.sizes.md;
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.sm,
          },
          getVariantStyle(),
          getSizeStyle(),
          style,
        ]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text
            style={[
              {
                color: variant === 'outline' ? theme.colors.primary : theme.colors.white,
                fontSize: getTextSize(),
                fontWeight: theme.typography.weights.medium as TextStyle['fontWeight'],
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

interface TextComponentProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
}

export const StyledText = ({ variant = 'body', style, ...props }: TextComponentProps) => {
  const theme = usePairingTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: theme.typography.sizes.xxxl,
          fontWeight: theme.typography.weights.bold as TextStyle['fontWeight'],
          marginBottom: theme.spacing.md,
        };
      case 'h2':
        return {
          fontSize: theme.typography.sizes.xxl,
          fontWeight: theme.typography.weights.bold as TextStyle['fontWeight'],
          marginBottom: theme.spacing.sm,
        };
      case 'h3':
        return {
          fontSize: theme.typography.sizes.xl,
          fontWeight: theme.typography.weights.medium as TextStyle['fontWeight'],
          marginBottom: theme.spacing.sm,
        };
      case 'h4':
        return {
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.medium as TextStyle['fontWeight'],
          marginBottom: theme.spacing.xs,
        };
      case 'caption':
        return {
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.gray[600],
        };
      default:
        return {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.sizes.md * 1.5,
        };
    }
  };

  return (
    <Text
      style={[
        {
          color: theme.colors.text,
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    />
  );
};

