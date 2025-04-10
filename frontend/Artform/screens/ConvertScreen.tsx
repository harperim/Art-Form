// screens/ConvertScreen.tsx
import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, BackHandler, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { ModelWithThumbnail } from '~/types/model';
import colors from '~/constants/colors';
import UploadOptionModal from '~/components/UploadOptionModal';
import GenerateByTextModal from '~/components/GenerateByTextModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useModel } from '~/context/ModelContext';
import LoadingModal from '~/components/LoadingModal';
import { ICONS } from '~/constants/icons';
import { applyImg2Img, applyText2Img } from '~/services/convertService';
import { fetchPresignedImageUrl, getValidUrl } from '~/services/imageService';

type Props = {
  model: ModelWithThumbnail;
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

  useEffect(() => {
    return () => {
      setSelectedModel(null);
    };
  }, []);

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
      setIsLoading(true);

      // 1. 파일명 만들기
      const filename = resultImage.substring(resultImage.lastIndexOf('/') + 1);

      // 2. 캐시 디렉토리에 다운로드
      const localUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadRes = await FileSystem.downloadAsync(resultImage, localUri);

      // 3. MediaLibrary에 저장
      await MediaLibrary.saveToLibraryAsync(downloadRes.uri);

      Alert.alert('✅ 저장 완료', '이미지가 갤러리에 저장되었습니다!');
    } catch (error) {
      console.debug('이미지 저장 오류:', error);
      Alert.alert('오류 발생', '이미지를 저장하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false); // ⬅️ 로딩 종료
    }
  };

  const handleSubmit = async () => {
    if (!userImage) {
      Alert.alert('이미지 없음', '변환할 이미지를 먼저 업로드해 주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const result = await applyImg2Img({
        imageUri: userImage,
        modelId: String(model.model.modelId),
        // strength: '0.8',
      });

      const imageUrl = getValidUrl(await fetchPresignedImageUrl(result.imageId));

      setResultImage(imageUrl); // API에서 받은 변환 결과 URL
      setIsDone(true);
    } catch (error) {
      console.error('변환 실패:', error);
      Alert.alert('변환 실패', '이미지 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateByText = async () => {
    if (!prompt.trim()) {
      Alert.alert('프롬프트를 입력해 주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const imageUri = await applyText2Img({
        prompt,
        modelId: String(model.model.modelId),
        // strength: '0.8',
      });

      console.log('text2img 결과:', imageUri);

      const imageUrl = getValidUrl(await fetchPresignedImageUrl(imageUri.imageId));

      setResultImage(imageUrl);
      setTextModalVisible(false);
      setIsDone(true);
      setPrompt('');
    } catch (err) {
      console.error('text2img 실패:', err);
      Alert.alert('실패', '이미지를 생성하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
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
                  <ICONS.check width={24} height={24} style={styles.checkIcon} />
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
                    setIsDone(false);
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
              onSubmit={handleGenerateByText}
            />

            <View style={styles.modelCard}>
              <Image source={{ uri: model.thumbnailUrl }} style={styles.modelImage} />
              <View style={{ flex: 1, marginLeft: 18, marginTop: -10 }}>
                <Text style={styles.label}>선택한 모델</Text>
                <Text style={styles.modelTitle}>{model.model.modelName}</Text>
                <Text style={styles.artistName}>by {model.userName}</Text>
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
  container: { padding: 24, flex: 1, backgroundColor: 'white', paddingTop: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
    gap: 4,
  },
  title: { fontSize: 18, fontFamily: 'Freesentation8' },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: '#ccc',
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholder: { alignItems: 'center' },
  placeholderText: { fontSize: 18, fontFamily: 'Freesentation8' },
  supportText: { marginTop: 2, color: '#9C9DA0', fontFamily: 'Freesentation6' },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  modelCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F3F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  modelImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Freesentation6',
    marginBottom: 2,
  },
  modelTitle: {
    fontFamily: 'Freesentation8',
    fontSize: 18,
    marginBottom: 4,
    color: '#2C2D26',
  },
  artistName: {
    color: '#999',
    fontSize: 13,
    fontFamily: 'Freesentation7',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Freesentation7',
  },
  doneText: {
    fontSize: 18,
    fontFamily: 'Freesentation8',
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: 380,
    borderRadius: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#7EA4CC',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: 'white',
    fontFamily: 'Freesentation7',
    fontSize: 16,
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
    fontFamily: 'Freesentation7',
    fontSize: 16,
  },
  resultWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultButtons: {
    paddingTop: 10,
    marginBottom: 20,
  },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    marginRight: 12,
  },
});
