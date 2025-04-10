// app/(auth)/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(isLoggedIn ? '/home' : '/login');
    }
  }, [loading, isLoggedIn]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
