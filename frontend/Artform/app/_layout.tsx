import { Slot, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const customFonts = {
  'SansitaSwashed-Regular': require('../assets/fonts/SansitaSwashed-Regular.ttf'),
  'SansitaSwashed-Bold': require('../assets/fonts/SansitaSwashed-Bold.ttf'),
  'SansitaSwashed-Medium': require('../assets/fonts/SansitaSwashed-Medium.ttf'),
};

function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(customFonts);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
