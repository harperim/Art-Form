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
import type { ModelWithThumbnail } from '~/types/model';

// 이미지 import
import image1 from '../../assets/images/FE/개양귀비.jpg';
import image2 from '../../assets/images/FE/물랭드라갈레트의무도회.jpg';
import image3 from '../../assets/images/FE/엘리멘탈.jpg';
import image4 from '../../assets/images/FE/지브리.jpg';
import image5 from '../../assets/images/FE/라푼젤.jpg';
import image6 from '../../assets/images/FE/양산을쓴여인.jpg';
import image7 from '../../assets/images/FE/파리의거리.jpg';
import image8 from '../../assets/images/FE/유미의세포들.jpg';
import image9 from '../../assets/images/FE/동양화.png';
import image10 from '../../assets/images/FE/그랑드자트섬의-일요일-오후.jpg';

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

  useEffect(() => {
    const fakeModel = (
      modelId: number,
      modelName: string,
      image: any,
      userName: string
    ): ModelWithThumbnail => ({
      model: {
        modelId,
        userId: 1,
        modelName,
        description: `${modelName}에 대한 설명입니다.`,
        likeCount: 0,
        uploadFileName: `${modelName}.jpg`,
        thumbnailId: modelId,
        createdAt: new Date().toISOString(),
        deletedAt: null,
        public: true,
      },
      userName,
      thumbnailUrl: Image.resolveAssetSource(image).uri,
    });

    const dummyToday = [
      fakeModel(1, '개양귀비', image1, '모네'),
      fakeModel(2, '물랭드라갈레트의무도회', image2, '르누아르'),
      fakeModel(3, '엘리멘탈', image3, '픽사'),
      fakeModel(4, '지브리', image4, '미야자키 하야오'),
    ];

    const dummyHot = [
      fakeModel(5, '라푼젤', image5, '디즈니'),
      fakeModel(6, '양산을 쓴 여인', image6, '모네'),
      fakeModel(7, '파리의 거리', image7, '카유보트'),
    ];

    const dummyRecent = [
      fakeModel(8, '유미의 세포들', image8, '스튜디오드래곤'),
      fakeModel(9, '동양화', image9, '김홍도'),
      fakeModel(10, '그랑드자트섬의 일요일 오후', image10, '쇠라'),
    ];

    setTodayData(dummyToday);
    setHotModels(dummyHot);
    setRecentModels(dummyRecent);
  }, []);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
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
            scrollEventThrottle={16}
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
          <TouchableOpacity onPress={() => router.push('/store?sort=latest')}>
            <Text style={styles.seeMoreBtn}>더 보기</Text>
          </TouchableOpacity>
        </View>
        <ArtCarouselSection data={hotModels} onPress={handleCardPress} />
      </View>

      {/* 최신 모델 */}
      <View style={styles.newModelView}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>최신모델</Text>
          <TouchableOpacity onPress={() => router.push('/store?sort=popular')}>
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
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  logo: {
    width: 132,
    height: 45,
  },
  todayRecommend: {
    marginTop: 32,
  },
  title: {
    color: '#2C2D26',
    fontSize: 18,
    fontFamily: 'Freesentation',
    fontWeight: '700',
  },
  parallaxCarouselView: {
    marginTop: 8,
  },
  popularModelView: {
    marginTop: 16,
  },
  newModelView: {
    marginTop: 16,
    marginBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  seeMoreBtn: {
    fontFamily: 'Freesentation7',
    fontWeight: '600',
    color: '#59799B',
    fontSize: 15,
    top: 2,
  },
});
