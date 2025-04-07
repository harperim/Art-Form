// app/(app)/convert.tsx
import { Text } from 'react-native';
import { useModel } from '~/context/ModelContext';
import ConvertScreen from '~/screens/ConvertScreen';

export default function ConvertPage() {
  const { selectedModel } = useModel();

  if (!selectedModel) {
    return <Text>모델을 찾을 수 없습니다.</Text>;
  }

  return <ConvertScreen model={selectedModel} />;
}
