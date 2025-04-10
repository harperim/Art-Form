// components/CustomTabBar.tsx
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TAB_ICONS } from '~/constants/icons';

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const iconSet = TAB_ICONS[route.name as keyof typeof TAB_ICONS];

        if (!iconSet) return null;
        const IconComponent = focused ? iconSet.filled : iconSet.outline;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabItem}
          >
            <View style={[styles.iconWrapper, focused && styles.focused]}>
              <IconComponent width={focused ? 30 : 24} height={focused ? 30 : 24} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: 'black',
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
    // zIndex: 99,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  focused: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 12,
  },
});
