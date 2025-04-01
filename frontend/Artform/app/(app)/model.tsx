// app/(app)/model.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ICONS } from '~/constants/icons';
import ArtCarouselSection from '~/components/ArtCarouselSection';
import colors from '~/constants/colors';
import { mockModels } from '~/constants/mockModels';

export default function ModelScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 제목 + 아이콘 */}
      <View style={styles.header}>
        <Text style={styles.title}>최근에 사용한 모델</Text>
        <TouchableOpacity>
          <ICONS.grid width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* 모델 캐러셀 */}
      <ArtCarouselSection
        data={mockModels.map((model) => ({
          id: model.id,
          image: model.image,
          title: model.title,
          artist: `by ${model.artist}`,
        }))}
      />

      {/* 설명 텍스트 */}
      <Text style={styles.description}>나만의 모델을 만들어 보세요</Text>

      {/* 새로 학습하기 버튼 */}
      <TouchableOpacity style={styles.learnButton}>
        <ICONS.plus width={18} height={18} />
        <Text style={styles.learnButtonText}>새로 학습하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 36,
    textAlign: 'center',
    color: '#6283A6',
    marginBottom: 12,
  },
  learnButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  learnButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
