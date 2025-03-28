// screens/ConvertScreen.tsx
import { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { Model } from '~/types/model';
import colors from '~/constants/colors';
import UploadOptionModal from '~/components/UploadOptionModal';
import GenerateByTextModal from '~/components/GenerateByTextModal';

type Props = {
  model: Model;
};

export default function ConvertScreen({ model }: Props) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [uploadOptionVisible, setUploadOptionVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [prompt, setPrompt] = useState('');

  const openLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      setUserImage(result.assets[0].uri);
    }
    setUploadOptionVisible(false);
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      setUserImage(result.assets[0].uri);
    }
    setUploadOptionVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>변환할 이미지</Text>

      <Pressable style={styles.uploadBox} onPress={() => setUploadOptionVisible(true)}>
        {userImage ? (
          <Image source={{ uri: userImage }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>여기에 이미지를 업로드하세요.</Text>
            <Text style={styles.supportText}>( JPG, JPEG, PNG 유형 지원 )</Text>
          </View>
        )}
      </Pressable>

      {/* 모달 */}
      <UploadOptionModal
        visible={uploadOptionVisible}
        onClose={() => setUploadOptionVisible(false)}
        onPickFromLibrary={openLibrary}
        onPickFromCamera={openCamera}
        onGenerateByText={() => {
          setUploadOptionVisible(false);
          setTextModalVisible(true);
        }}
      />
      <GenerateByTextModal
        visible={textModalVisible}
        onClose={() => setTextModalVisible(false)}
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => {
          console.log('입력된 프롬프트:', prompt);
          setTextModalVisible(false);
          // 이미지 생성 로직 시작!
        }}
      />

      <View style={styles.modelCard}>
        <Image source={model.image} style={styles.modelImage} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.label}>선택한 모델</Text>
          <Text style={styles.modelTitle}>{model.title}</Text>
          <Text style={styles.changePrompt}>모델을 변경하시겠습니까?</Text>
        </View>
      </View>

      <Pressable style={styles.submitButton}>
        <Text style={styles.submitText}>변환하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    borderColor: '#ccc',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  placeholder: { alignItems: 'center' },
  placeholderText: { fontWeight: 'bold', fontSize: 16 },
  supportText: { marginTop: 4, color: '#666' },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  modelCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F3F5',
    borderRadius: 20,
    padding: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  modelImage: {
    width: 80,
    height: 100,
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  modelTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  changePrompt: {
    color: '#999',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
