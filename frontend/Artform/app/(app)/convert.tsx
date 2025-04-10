// app/(app)/convert.tsx
import { useGlobalSearchParams } from 'expo-router';
import { mockModels } from '~/constants/mockModels';
import { Text } from 'react-native';
import ConvertScreen from '~/screens/ConvertScreen';

export default function ConvertPage() {
  const { modelId } = useGlobalSearchParams();
  const model = mockModels.find((m) => m.id === modelId);

  if (!model) return <Text>모델을 찾을 수 없습니다.</Text>;

  return <ConvertScreen model={model} />;
}
