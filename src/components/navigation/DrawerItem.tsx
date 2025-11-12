import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hexToRgba } from '@/src/constants/Colors';

interface DrawerItemProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: {
    text: string;
    tint: string;
    secondary: string;
  };
}

export default function DrawerItem({ label, iconName, onPress, theme }: DrawerItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const pressableStyle = {
    ...styles.pressable,
    backgroundColor: isHovered ? hexToRgba(theme.text, 0.1) : theme.secondary,
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={pressableStyle}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={isHovered ? theme.tint : theme.text}
        style={{ marginRight: 18 }}
      />
      <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginTop: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});