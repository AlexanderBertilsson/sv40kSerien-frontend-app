import { View, TouchableOpacity, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';

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

  return (
    <View style={[styles.container, { backgroundColor: theme.secondary }, style]}>
      {tabs.map((tab) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
});

export default TabSwitcher;
