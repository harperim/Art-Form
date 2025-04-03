// screens/ConvertScreen.tsx
import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, BackHandler, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { ModelDetail } from '~/types/model';
import colors from '~/constants/colors';
import UploadOptionModal from '~/components/UploadOptionModal';
import GenerateByTextModal from '~/components/GenerateByTextModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useModel } from '~/context/ModelContext';
import LoadingModal from '~/components/LoadingModal';
import { ICONS } from '~/constants/icons';

type Props = {
  model: ModelDetail;
};

export default function ConvertScreen({ model }: Props) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [uploadOptionVisible, setUploadOptionVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false); // 변환 완료 여부
  const [resultImage, setResultImage] = useState<string | null>(null); // 결과 이미지

  const { setSelectedModel } = useModel();

  const router = useRouter();

  useEffect(() => {
    const onBackPress = () => {
      setSelectedModel(model);
      router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router, model]);

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

  const handleSave = async () => {
    if (!resultImage) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지를 저장하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    try {
      // 파일명 만들기
      const filename = resultImage.substring(resultImage.lastIndexOf('/') + 1);

      // 파일을 앱의 캐시 디렉토리에 복사 (이미 웹 URL이거나 카메라에서 온 경우 대비)
      const localUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: resultImage,
        to: localUri,
      });

      // 갤러리에 저장
      await MediaLibrary.saveToLibraryAsync(localUri);

      Alert.alert('✅ 저장 완료', '이미지가 갤러리에 저장되었습니다!');
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      Alert.alert('오류 발생', '이미지를 저장하는 중 문제가 발생했습니다.');
    }
  };

  const handleSubmit = () => {
    // if (!userImage) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true); // ✅ 완료 상태로 전환
      setResultImage(userImage || ''); // 실제 변환 이미지로 교체
    }, 3000);
  };

  return (
    <>
      <View style={styles.container}>
        {isDone ? (
          <>
            <View style={styles.resultWrapper}>
              {/* ✅ 변환 완료 화면 */}
              <View style={styles.resultContent}>
                <View style={styles.doneRow}>
                  <ICONS.check width={20} height={20} style={styles.checkIcon} />
                  <Text style={styles.doneText}>정상적으로 완료되었습니다.</Text>
                </View>
                {resultImage && <Image source={{ uri: resultImage }} style={styles.resultImage} />}
              </View>

              <View style={styles.resultButtons}>
                <Pressable style={styles.primaryButton} onPress={handleSave}>
                  <Text style={styles.primaryText}>저장하기</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setIsDone(false); // ✅ 다시 입력 상태로 복구
                    setUserImage(null);
                    setPrompt('');
                  }}
                >
                  <Text style={styles.secondaryText}>다시 변환하기</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => {
                  setSelectedModel(model);
                  router.back();
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </Pressable>
              <Text style={styles.title}>변환할 이미지</Text>
            </View>

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
              onClose={() => {
                setPrompt('');
                setTextModalVisible(false);
                setUploadOptionVisible(true);
              }}
              value={prompt}
              onChange={setPrompt}
              onSubmit={() => {
                console.log('입력된 프롬프트:', prompt);
                setTextModalVisible(false);
                setPrompt('');
                // 이미지 생성 로직 시작!
              }}
            />

            <View style={styles.modelCard}>
              <Image source={model.image} style={styles.modelImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>선택한 모델</Text>
                <Text style={styles.modelTitle}>{model.title}</Text>
                <Text style={styles.artistName}>by {model.artist}</Text>
              </View>
            </View>

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>변환하기</Text>
            </Pressable>
          </>
        )}
      </View>
      <LoadingModal visible={isLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, backgroundColor: 'white' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
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
  artistName: {
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
  doneText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#7EA4CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#7EA4CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#7EA4CC',
    fontWeight: 'bold',
  },
  resultWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'white',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultButtons: {
    paddingTop: 20,
  },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkIcon: {
    marginTop: 3,
    marginRight: 8,
  },
});
