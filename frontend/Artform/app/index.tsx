import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions(); // 창 크기 감지
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  return (
    <ImageBackground
      source={require('../assets/splash1.png')}
      style={[styles.background, { width, height }]} // 창 크기에 맞춤
      resizeMode="cover"
    >
      {/* 그라데이션 레이어 추가 */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} // 투명 → 검은색
        style={styles.gradient}
      />

      <View style={styles.container}>
        <Text style={styles.title}>ArtForm</Text>
        <Text style={styles.subtitle}>당신의 순간, AI로 완성하다</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>

        <Text style={styles.signupPrompt}>아직 회원이 아니신가요?</Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.signupText}>회원가입</Text>
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
    bottom: 0,
    width: '100%',
    height: '150%', // 하단 40%에만 그라데이션 적용
  },
  container: {
    width: '85%',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'regular',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'SansitaSwashed',
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#ddd',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: '#4A73E8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
    color: '#4A73E8',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
