// app/(app)/model.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICONS } from '~/constants/icons';
import ModelCarousel from '~/components/ModelCarousel';
import AnimatedModelCard from '~/components/AnimatedModelCard';
import { useModel } from '~/context/ModelContext';
import type { ModelWithThumbnail } from '~/types/model';
import { fetchPresignedImageUrl, getValidUrl } from '~/services/imageService';
import { fetchRecentModels } from '~/services/modelService';
import { router } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 24 * 2 - 12) / 2;
const GRID_ITEM_HEIGHT = GRID_ITEM_WIDTH * 1.3;

type Props = {
  item: ModelWithThumbnail;
  index: number;
};

export default function ModelScreen() {
  const [isGrid, setIsGrid] = useState(false);
  const [models, setModels] = useState<ModelWithThumbnail[]>([]);
  const { isTraining } = useModel();

  const toggleView = () => setIsGrid((prev) => !prev);

  const { setSelectedModel } = useModel();

  const handleCardPress = (item: ModelWithThumbnail) => {
    setSelectedModel(item);
  };

  const renderGridItem = ({ item, index }: Props) => (
    <View style={{ width: GRID_ITEM_WIDTH }}>
      <AnimatedModelCard
        item={item}
        index={index}
        onPress={() => handleCardPress(item)}
        disableAnimation={null}
      />
    </View>
  );

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await fetchRecentModels(0);
        const urls = await Promise.all(
          data.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
        );
        const enriched = data.map((model, i) => ({
          ...model,
          thumbnailUrl: getValidUrl(urls[i]),
        }));
        setModels(enriched);
      } catch (err) {
        console.error('모델 불러오기 실패:', err);
      }
    };
    loadModels();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 + 아이콘 */}
      <View style={styles.header}>
        <Text style={styles.title}>최근에 사용한 모델</Text>
        <TouchableOpacity onPress={toggleView}>
          <ICONS.grid width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* 캐러셀 or 그리드 */}
      {models.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>모델이 없습니다.</Text>

          <Text style={styles.description}>나만의 모델을 만들어 보세요</Text>
          <TouchableOpacity style={styles.learnButton}>
            <View style={styles.iconLeft}>
              <ICONS.plus width={20} height={20} />
            </View>
            <Text style={styles.learnButtonText}>새로 학습하기</Text>
          </TouchableOpacity>
        </View>
      ) : isGrid ? (
        <FlatList
          data={models}
          numColumns={2}
          keyExtractor={(item) => String(item.model.modelId)}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
          renderItem={renderGridItem}
        />
      ) : (
        <View style={styles.scrollContent}>
          <ModelCarousel data={models} onPress={handleCardPress} />

          <Text style={styles.description}>나만의 모델을 만들어 보세요</Text>

          {isTraining ? (
            <TouchableOpacity
              style={styles.trainingButton}
              onPress={() => router.push('/create-model')}
            >
              <View style={styles.iconLeft}>
                <ICONS.learn width={20} height={20} />
              </View>
              <Text style={styles.trainingButtonText}>모델이 학습 중입니다.</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.learnButton} onPress={() => router.push('/train')}>
              <View style={styles.iconLeft}>
                <ICONS.plus width={20} height={20} />
              </View>
              <Text style={styles.learnButtonText}>새로 학습하기</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    textAlign: 'center',
    color: '#6283A6',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  learnButton: {
    flexDirection: 'row',
    backgroundColor: '#7EA4CC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  learnButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  trainingButton: {
    flexDirection: 'row',
    borderColor: '#C7A635',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  trainingButtonText: {
    color: '#C7A635',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  gridWrapper: {
    flex: 1,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_HEIGHT,
    justifyContent: 'flex-end',
  },
  imageBorder: {
    borderRadius: 12,
  },
  gridOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  gridTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  iconLeft: {
    position: 'absolute',
    left: 20,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 150,
  },
});
