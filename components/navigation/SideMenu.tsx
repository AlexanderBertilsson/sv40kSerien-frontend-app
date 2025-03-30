import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Text } from 'react-native';

const MENU_WIDTH = 200;
const BUTTON_WIDTH = 44;

export function SideMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'web' && isExpanded) {
      toggleMenu();
    }
  }, [pathname]);

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
    setIsExpanded(!isExpanded);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View 
      style={[
        styles.container,
        {
          height: '100%',
          top: 0,
        }
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.menuWrapper,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-MENU_WIDTH, 0],
                }),
              },
            ],
            width: MENU_WIDTH,
            height: '100%',
          },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <View 
          style={[styles.menu, { backgroundColor: theme.background }]}
          pointerEvents="auto"
        >
          <Animated.View style={{ opacity: opacityAnim }}>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="log-in-outline" size={24} color={theme.text} />
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </Animated.View>
      
      <View 
        style={[styles.buttonContainer]}
        pointerEvents="box-none"
      >
        <Animated.View 
          style={[
            styles.buttonWrapper,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, MENU_WIDTH],
                  }),
                },
              ],
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: theme.background }
            ]}
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.text}
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    zIndex: 100,
    width: '100%',
  },
  menuWrapper: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    zIndex: 101,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    top: 50,
    width: '100%',
    height: 48,
    zIndex: 102,
  },
  buttonWrapper: {
    position: 'absolute',
    left: 0,
  },
  menu: {
    height: '100%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  menuText: {
    fontSize: 16,
  },
  toggleButton: {
    padding: 12,
    height: 48,
    width: 44,
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
