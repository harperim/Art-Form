import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function createModel() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>모델 학습하기</Text>
      </View>
      <View style={styles.mainContent}>
        <Text style={styles.statusMessage}>현재 학습 중입니다.</Text>
        <Text style={styles.statusSubtext}>학습이 완료되면 알림이 발송됩니다.</Text>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('~/assets/animation/loadingAnimation.json')}
            autoPlay
            loop
            style={{ width: 380, height: 380 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#F5F3EF',
  },
  headerRow: {
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  title: { fontSize: 18, marginLeft: 8, fontFamily: 'Freesentation7' },
  mainContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 160,
  },
  statusMessage: {
    fontFamily: 'Freesentation8',
    fontSize: 25,
    color: '#C27B7A',
  },
  statusSubtext: { fontFamily: 'Freesentation7', fontSize: 18, paddingBottom: 20 },
  animationContainer: {
    width: '90%',
    aspectRatio: 1,
    backgroundColor: 'rgba(201, 122, 109, 0.10);',
    borderRadius: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
