// components/CustomTabBar.tsx
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TAB_ICONS } from '~/constants/icons';

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const hiddenRoutes = ['convert', 'train', 'create-model', 'setting'];

  const currentRouteName = state.routes[state.index].name;

  const [keyboardVisible, setKeyboardVisible] = useState(false);


  if (hiddenRoutes.includes(currentRouteName)) return null;

  // ✅ 키보드 리스너 등록
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ✅ 숨김 조건: 키보드 보이거나 숨겨야 하는 라우트일 때
  if (keyboardVisible || hiddenRoutes.includes(currentRouteName)) return null;

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
