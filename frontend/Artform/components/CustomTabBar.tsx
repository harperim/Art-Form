// components/CustomTabBar.tsx
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeIcon from '~/assets/icons/home-outline.svg';
import StoreIcon from '~/assets/icons/store-outline.svg';
import ModelIcon from '~/assets/icons/model-outline.svg';
import MyPageIcon from '~/assets/icons/mypage-outline.svg';
import HomeIconFilled from '~/assets/icons/home-filled.svg';
import StoreIconFilled from '~/assets/icons/store-filled.svg';
import ModelIconFilled from '~/assets/icons/model-filled.svg';
import MyPageIconFilled from '~/assets/icons/mypage-filled.svg';

const ICONS = {
  home: { outline: HomeIcon, filled: HomeIconFilled },
  store: { outline: StoreIcon, filled: StoreIconFilled },
  model: { outline: ModelIcon, filled: ModelIconFilled },
  mypage: { outline: MyPageIcon, filled: MyPageIconFilled },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const iconSet = ICONS[route.name as keyof typeof ICONS];
        const IconComponent = focused ? iconSet.filled : iconSet.outline;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
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
    height: 70,
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
    zIndex: 99,
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
