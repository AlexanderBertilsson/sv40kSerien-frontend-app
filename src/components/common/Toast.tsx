import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Animated, Pressable } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  onHide?: () => void;
}

const TOAST_COLORS = {
  success: {
    background: '#10B981',
    text: '#FFFFFF',
    icon: 'checkmark-circle' as const,
  },
  error: {
    background: '#EF4444',
    text: '#FFFFFF',
    icon: 'close-circle' as const,
  },
  warning: {
    background: '#F59E0B',
    text: '#FFFFFF',
    icon: 'warning' as const,
  },
  info: {
    background: '#3B82F6',
    text: '#FFFFFF',
    icon: 'information-circle' as const,
  },
};

export default function Toast({ 
  visible, 
  message, 
  type = 'info', 
  position = 'bottom-left',
  duration = 3000,
  onHide 
}: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  const handleHide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onHide) {
        onHide();
      }
    });
  }, [fadeAnim, slideAnim, onHide]);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    } else if (isVisible) {
      // Only hide if we were previously visible
      handleHide();
    }
  }, [visible, duration, fadeAnim, slideAnim, handleHide, isVisible, message]);

  if (!isVisible) {
    return null;
  }

  const colors = TOAST_COLORS[type];
  const positionStyle = getPositionStyle(position);

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable 
        style={styles.content}
        onPress={handleHide}
      >
        <Ionicons name={colors.icon} size={24} color={colors.text} />
        <ThemedText style={[styles.message, { color: colors.text }]}>
          {message}
        </ThemedText>
        <Pressable onPress={handleHide} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function getPositionStyle(position: ToastPosition): any {
  const base = {
    position: 'fixed' as const,
    zIndex: 9999,
  };

  switch (position) {
    case 'top-left':
      return { ...base, top: 20, left: 20 };
    case 'top-right':
      return { ...base, top: 20, right: 20 };
    case 'bottom-left':
      return { ...base, bottom: 20, left: 20 };
    case 'bottom-right':
      return { ...base, bottom: 20, right: 20 };
    case 'top-center':
      return { ...base, top: 20, left: '50%', marginLeft: -150 };
    case 'bottom-center':
      return { ...base, bottom: 20, left: '50%', marginLeft: -150 };
    default:
      return { ...base, bottom: 20, left: 20 };
  }
}

const styles = StyleSheet.create({
  container: {
    minWidth: 300,
    maxWidth: 400,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});
