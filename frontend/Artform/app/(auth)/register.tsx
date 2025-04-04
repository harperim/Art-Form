// app/(auth)/register.tsx
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  Animated,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import { useAuthActions } from '~/hooks/useAuthActions';

export default function RegisterScreen() {
  const { handleRegister, checkNickname, checkEmail } = useAuthActions();
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [securePw, setSecurePw] = useState(true);
  const [securePwConfirm, setSecurePwConfirm] = useState(true);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ 애니메이션 for title & subtitle
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateX = useRef(new Animated.Value(30)).current;
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const backAction = () => {
      router.replace('/login');
      return true; // ✅ 기본 동작 막기
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  // 이메일 중복 체크
  useEffect(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      setEmailAvailable(null);
      return;
    }

    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    emailDebounceRef.current = setTimeout(async () => {
      const result = await checkEmail(email);
      setEmailAvailable(result);
    }, 500);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [email]);

  // 닉네임 중복 체크
  useEffect(() => {
    // 최소 글자 수 이상일 때만 검사
    if (nickname.length < 2) {
      setNicknameAvailable(null);
      return;
    }

    // 디바운스: 입력 후 500ms 동안 변화 없을 때만 체크
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const isAvailable = await checkNickname(nickname);
      setNicknameAvailable(isAvailable);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [nickname]);

  const onSubmit = () => {
    handleRegister(email, pw, pwConfirm, nickname);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/splash1.png')}
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

        <FloatingLabelInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {email.length >= 5 && emailAvailable !== null && (
          <Text style={{ color: emailAvailable ? '#00E676' : '#FF5252', marginBottom: 6 }}>
            {emailAvailable ? '사용 가능한 이메일입니다.' : '사용할 수 없는 이메일입니다.'}
          </Text>
        )}
        <FloatingLabelInput
          label="Password"
          value={pw}
          onChangeText={setPw}
          secureTextEntry={securePw}
          rightIcon={
            <TouchableOpacity onPress={() => setSecurePw(!securePw)}>
              <Ionicons name={securePw ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          }
        />
        <FloatingLabelInput
          label="Password confirm"
          value={pwConfirm}
          onChangeText={setPwConfirm}
          secureTextEntry={securePwConfirm}
          rightIcon={
            <TouchableOpacity onPress={() => setSecurePwConfirm(!securePwConfirm)}>
              <Ionicons name={securePwConfirm ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          }
        />
        <FloatingLabelInput label="Nickname" value={nickname} onChangeText={setNickname} />
        {nickname.length >= 2 && nicknameAvailable !== null && (
          <Text style={{ color: nicknameAvailable ? '#00E676' : '#FF5252' }}>
            {nicknameAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
          </Text>
        )}
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.backText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
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
  },

  titleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 60,
    color: '#fff',
    fontFamily: 'SansitaSwashed-Bold',
  },
  subtitle: {
    bottom: 5,
    left: 80,
    fontSize: 20,
    color: '#F2E6E6',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6E95BE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 15,
    color: '#6E95BE',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
