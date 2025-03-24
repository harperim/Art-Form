// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'none',
        headerShown: false,
        contentStyle: {
          backgroundColor: 'black',
        },
      }}
    />
  );
}
