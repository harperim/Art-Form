// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { AuthProvider } from '../lib/auth-context';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ModelProvider } from '~/context/ModelContext';

const customFonts = {
  'SansitaSwashed-Regular': require('../assets/fonts/SansitaSwashed-Regular.ttf'),
  'SansitaSwashed-Bold': require('../assets/fonts/SansitaSwashed-Bold.ttf'),
  'SansitaSwashed-Medium': require('../assets/fonts/SansitaSwashed-Medium.ttf'),
  'Freesentation-5Medium': require('~/assets/fonts/Freesentation-5Medium.ttf'),
  Freesentation4: require('~/assets/fonts/Freesentation-4Regular.ttf'),
  Freesentation5: require('~/assets/fonts/Freesentation-5Medium.ttf'),
  Freesentation6: require('~/assets/fonts/Freesentation-6SemiBold.ttf'),
  Freesentation7: require('~/assets/fonts/Freesentation-7Bold.ttf'),
  Freesentation8: require('~/assets/fonts/Freesentation-8ExtraBold.ttf'),
};

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ModelProvider>
            <Slot />
          </ModelProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
