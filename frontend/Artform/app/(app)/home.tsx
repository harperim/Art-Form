// app/(app)/home.tsx
import {
  Image,
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import TodayPickCarousel from '~/components/TodayPickCarousel';
import ArtCarouselSection from '~/components/ArtCarouselSection';
import ParallaxCarouselPagination from '~/components/ParallaxCarouselPagination';
import { router } from 'expo-router';
import { useModel } from '~/context/ModelContext';

import { useCallback, useEffect, useState } from 'react';
import { fetchHotModels, fetchRandomModels, fetchRecentModels } from '~/services/modelService';
import type { ModelWithThumbnail } from '~/types/model';
import { fetchPresignedImageUrl } from '~/services/imageService';

export default function Home() {
  const [todayData, setTodayData] = useState<ModelWithThumbnail[]>([]);
  const [hotModels, setHotModels] = useState<ModelWithThumbnail[]>([]);
  const [recentModels, setRecentModels] = useState<ModelWithThumbnail[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { setSelectedModel } = useModel();

  const OFFSET = 20;
  const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
  const scrollX = useSharedValue(0);

  const handleCardPress = (item: ModelWithThumbnail) => {
    setSelectedModel(item);
  };

  const loadModels = async () => {
    try {
      const [random, hot, recent] = await Promise.all([
        fetchRandomModels(5),
        fetchHotModels(1),
        fetchRecentModels(1),
      ]);

      const all = [...random, ...hot, ...recent];
      const urls = await Promise.all(
        all.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
      );

      const randomMerged = random.map((model, index) => ({
        ...model,
        thumbnailUrl: urls[index] ?? Image.resolveAssetSource(require('~/assets/logo.png')).uri,
      }));

      const hotMerged = hot.map((model, index) => ({
        ...model,
        thumbnailUrl:
          urls[random.length + index] ?? Image.resolveAssetSource(require('~/assets/logo.png')).uri,
      }));

      const recentMerged = recent.map((model, index) => ({
        ...model,
        thumbnailUrl:
          urls[random.length + hot.length + index] ??
          Image.resolveAssetSource(require('~/assets/logo.png')).uri,
      }));

      setTodayData(randomMerged);
      setHotModels(hotMerged);
      setRecentModels(recentMerged);
    } catch (err) {
      console.error('모델 데이터 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadModels();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.main}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* 오늘의 추천 */}
      <View style={styles.todayRecommend}>
        <Text style={styles.title}>오늘의 추천</Text>
        <View style={styles.parallaxCarouselView}>
          <ScrollView
            horizontal
            decelerationRate="fast"
            snapToInterval={ITEM_WIDTH}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            disableIntervalMomentum
            scrollEventThrottle={20}
            onScroll={(event) => {
              scrollX.value = event.nativeEvent.contentOffset.x;
            }}
          >
            {todayData.map((item, index) => (
              <TodayPickCarousel
                item={item}
                key={index}
                id={index}
                scrollX={scrollX}
                onPress={handleCardPress}
              />
            ))}
          </ScrollView>
          <ParallaxCarouselPagination data={todayData} scrollX={scrollX} />
        </View>
      </View>

      {/* 인기 모델 */}
      <View style={styles.popularModelView}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>인기모델</Text>
          <TouchableOpacity onPress={() => router.push('/store?sort=popular')}>
            <Text style={styles.seeMoreBtn}>더 보기</Text>
          </TouchableOpacity>
        </View>
        <ArtCarouselSection data={hotModels} onPress={handleCardPress} />
      </View>

      {/* 최신 모델 */}
      <View style={styles.newModelView}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>최신모델</Text>
          <TouchableOpacity onPress={() => router.push('/store?sort=latest')}>
            <Text style={styles.seeMoreBtn}>더 보기</Text>
          </TouchableOpacity>
        </View>
        <ArtCarouselSection data={recentModels} onPress={handleCardPress} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 132,
    height: 45,
  },
  todayRecommend: {
    marginTop: 40,
  },
  title: {
    color: '#2C2D26',
    fontSize: 22,
    fontFamily: 'Freesentation',
    fontWeight: '700',
  },
  parallaxCarouselView: {
    marginTop: 12,
  },
  popularModelView: {
    marginTop: 28,
  },
  newModelView: {
    marginTop: 28,
    marginBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  seeMoreBtn: {
    fontFamily: 'Freesentation',
    fontWeight: '600',
    color: '#59799B',
    fontSize: 13,
  },
});
