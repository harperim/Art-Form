// app/(app)/_layout.tsx
import { Tabs } from 'expo-router';
import CustomTabBar from '~/components/CustomTabBar';

export default function AppTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="store" />
      <Tabs.Screen name="model" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
