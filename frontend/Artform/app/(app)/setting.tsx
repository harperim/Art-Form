import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ICONS } from '~/constants/icons';

export default function setting() {
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
      <View style={{ marginTop: 120 }}>
        <TouchableOpacity style={styles.textBotton}>
          <ICONS.user width={28} height={28} />
          <Text style={styles.text}>계정 정보 확인 및 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textBotton}>
          <ICONS.setting width={28} height={28} />
          <Text style={styles.text}>기본 설정정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.textBotton, { marginTop: 20, paddingLeft: 2 }]}>
          <ICONS.logout width={24} height={24} />
          <Text style={[styles.text, { color: '#BE6E6E' }]}>로그아웃</Text>
        </TouchableOpacity>
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
  },
  headerRow: {
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  title: { fontSize: 18, marginLeft: 8, fontFamily: 'Freesentation7' },
  textBotton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  text: { fontFamily: 'Freesentation7', fontSize: 18, color: '#2C2D26', marginLeft: 12 },
});
