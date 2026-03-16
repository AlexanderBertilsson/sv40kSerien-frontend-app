import { useState, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, TextStyle, ViewStyle, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Tab<T extends string> {
  key: T;
  label: string;
}

export interface TabSwitcherProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  style?: ViewStyle;
}

export function TabSwitcher<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  style,
}: TabSwitcherProps<T>) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const tabWidthsRef = useRef<number[]>([]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setCanScrollLeft(contentOffset.x > 4);
    setCanScrollRight(contentOffset.x < contentSize.width - layoutMeasurement.width - 4);
  }, []);

  const handleContentSizeChange = useCallback((contentWidth: number, _contentHeight: number) => {
    setCanScrollRight(contentWidth > 0);
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;
    setCanScrollRight((prev) => prev && containerWidth > 0);
  }, []);

  const isNavigating = useRef(false);

  const handleChevronPress = (direction: 'left' | 'right') => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    const nextIndex = direction === 'right'
      ? Math.min(currentIndex + 1, tabs.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex === currentIndex) {
      isNavigating.current = false;
      return;
    }

    onTabChange(tabs[nextIndex].key);

    // Scroll to make the new tab visible
    const padding = 4;
    const gap = 4;
    let offset = padding;
    for (let i = 0; i < nextIndex; i++) {
      offset += (tabWidthsRef.current[i] || 0) + gap;
    }
    scrollRef.current?.scrollTo({ x: Math.max(0, offset - 20), animated: true });

    setTimeout(() => { isNavigating.current = false; }, 300);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {canScrollLeft && (
        <TouchableOpacity
          style={[styles.chevronButton, { backgroundColor: hexToRgba(theme.text, 0.08) }]}
          onPress={() => handleChevronPress('left')}
        >
          <MaterialCommunityIcons name="chevron-left" size={16} color={hexToRgba(theme.text, 0.4)} />
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollContainer, { backgroundColor: theme.secondary }]}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        scrollEventThrottle={16}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.tint : 'transparent',
                },
              ]}
              onPress={() => onTabChange(tab.key)}
              onLayout={(e) => {
                tabWidthsRef.current[index] = e.nativeEvent.layout.width;
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? '#fff' : theme.text,
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {canScrollRight && (
        <TouchableOpacity
          style={[styles.chevronButton, { backgroundColor: hexToRgba(theme.text, 0.08) }]}
          onPress={() => handleChevronPress('right')}
        >
          <MaterialCommunityIcons name="chevron-right" size={16} color={hexToRgba(theme.text, 0.4)} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  scrollContainer: {
    borderRadius: 12,
    flexGrow: 0,
    flexShrink: 1,
  },
  contentContainer: {
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  chevronButton: {
    width: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabSwitcher;
