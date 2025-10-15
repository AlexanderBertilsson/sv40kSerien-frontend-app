import React from 'react';
import { Text, type TextProps, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const ThemedText = React.forwardRef<Text, ThemedTextProps>(
  ({ style, type = 'default', ...rest }, ref) => {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const color = theme.text;

    const defaultText = {
      ...styles.default,
      color: theme.text
    }

    const titleText = {
      ...styles.title,
      color: theme.text
    }

    const defaultSemiBoldText = {
      ...styles.defaultSemiBold,
      color: theme.text
    }

    const subtitleText = {
      ...styles.subtitle,
      color: theme.text
    }

    const linkText = {
      ...styles.link,
      color: theme.tint
    }

    return (
      <Text
        ref={ref}
        style={[
          { color },
          type === 'default' ? defaultText : undefined,
          type === 'title' ? titleText : undefined,
          type === 'defaultSemiBold' ? defaultSemiBoldText : undefined,
          type === 'subtitle' ? subtitleText : undefined,
          type === 'link' ? linkText : undefined,
          style,
        ]}
        {...rest}
      />
    );
  }
);

export default ThemedText;

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
