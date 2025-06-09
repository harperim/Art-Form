// app/(auth)/login.tsx
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingLabelInput from '~/components/FloatingLabelInput';
import { useAuthActions } from '~/hooks/useAuthActions';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  // const { handleLogin } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  // ✅ 타이틀/부제목 애니메이션
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateX = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // const onLogin = async () => {
  //   try {
  //     const loginSuccess = await handleLogin(email, password);
  //     if (loginSuccess) {
  //       console.debug('로그인 성공');
  //       router.replace('/home');
  //     }
  //   } catch (err) {
  //     console.debug('로그인 실패', err);
  //   }
  // };

  const onLogin = async () => {
    // 하드코딩된 로그인 조건
    if (email === 'ssafy@naver.com' && password === 'ssafy123') {
      console.debug('✅ 테스트 로그인 성공');
      router.replace('/home'); // 로그인 성공 시 홈 화면으로 이동
    } else {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.debug('❌ 테스트 로그인 실패');
    }
  };


  return (
    <ImageBackground
      source={require('~/assets/images/splash1.png')}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)', // 0%: 완전 투명
          'rgba(0,0,0,0.4)', // 20%: 반투명
          'rgba(0,0,0,0.7)', // 70%: 거의 검정
          'rgba(0,0,0,1)', // 100%: 완전 검정
        ]}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
            ]}
          >
            ArtForm
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: subtitleOpacity, transform: [{ translateX: subtitleTranslateX }] },
            ]}
          >
            당신의 순간, AI로 완성하다
          </Animated.Text>
        </View>

        <FloatingLabelInput label="Email" value={email} onChangeText={setEmail} />

        <FloatingLabelInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          rightIcon={
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          }
        />

        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>

        <Text style={styles.signupPrompt}>아직 회원이 아니신가요?</Text>
        <TouchableOpacity onPress={() => router.replace('/register')}>
          <Text style={styles.signupText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
  },
  container: {
    width: '85%',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 58,
    color: '#fff',
    fontFamily: 'SansitaSwashed-Bold',
    textShadowColor: '#6E95BE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    bottom: 12,
    left: 32,
    fontSize: 18,
    color: '#F5F5DC',
    fontFamily: 'Freesentation7',
    textShadowColor: '#6E95BE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  loginButton: {
    backgroundColor: '#6E95BE',
    padding: 15,
    borderRadius: 8,
    width: 300,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupPrompt: {
    color: '#ddd',
    textAlign: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#6E95BE',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
