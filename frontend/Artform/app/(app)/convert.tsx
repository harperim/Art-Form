// app/(app)/convert.tsx
import { useGlobalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ConvertScreen from '~/screens/ConvertScreen';
import { fetchPresignedImageUrl } from '~/services/imageService';
import { fetchModelInfo } from '~/services/modelService';
import type { ModelWithThumbnail } from '~/types/model';

export default function ConvertPage() {
  const { modelId } = useGlobalSearchParams();

  const [model, setModel] = useState<ModelWithThumbnail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModel = async () => {
      if (!modelId) return;

      try {
        setLoading(true);

        // modelId 기반 모델 정보 요청
        const apiResponse = await fetchModelInfo(Number(modelId));

        const thumbnailUrl = (await fetchPresignedImageUrl(apiResponse.model.thumbnailId)) || '';

        const formattedModel: ModelWithThumbnail = {
          ...apiResponse,
          thumbnailUrl,
        };

        setModel(formattedModel);
      } catch (err) {
        console.error('모델 조회 실패:', err);
        setError('모델을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, [modelId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !model) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error || '모델을 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  return <ConvertScreen model={model} />;
}
