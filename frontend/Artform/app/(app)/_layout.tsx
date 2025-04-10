// app/(app)/_layout.tsx
import { Tabs } from 'expo-router';
import CustomTabBar from '~/components/CustomTabBar';

export default function AppTabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      backBehavior="history"
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
      <Tabs.Screen
        name="convert"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
