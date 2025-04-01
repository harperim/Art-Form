// app/(app)/home.tsx
import { Image, View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

import TodayPickCarousel from '~/components/TodayPickCarousel';
import ArtCarouselSection from '~/components/ArtCarouselSection';
import ParallaxCarouselPagination from '~/components/ParallaxCarouselPagination';
import { mockModels } from '~/constants/mockModels';

export default function Home() {
  const OFFSET = 20;
  const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

  const scrollX = useSharedValue(0);

  const todayData = mockModels.slice(0, 4); // 첫 4개만 사용

  const modelData = todayData.map((model) => ({
    id: model.id,
    image: model.image,
    title: model.title,
    artist: `♥ ${model.likes}`,
  }));

  const modelData2 = todayData.map((model) => ({
    id: model.id,
    image: model.image,
    title: model.title,
  }));

  return (
    <Animated.ScrollView style={styles.main}>
      {/* logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* 오늘의 추천 */}
      <View style={styles.todayRecommend}>
        <Text style={styles.title}>오늘의 추천</Text>
        <View style={styles.parallaxCarouselView}>
          <Animated.ScrollView
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
              <TodayPickCarousel item={item} key={index} id={index} scrollX={scrollX} />
            ))}
          </Animated.ScrollView>
          <ParallaxCarouselPagination data={todayData} scrollX={scrollX} />
        </View>
      </View>

      {/* 인기 모델 */}
      <View style={styles.popularModelView}>
        <Text style={styles.title}>인기모델</Text>
        <Text style={styles.seeMoreBtn}>더 보기</Text>
        <ArtCarouselSection data={modelData2} />
      </View>

      {/* 최신 모델 */}
      <View style={styles.newModelView}>
        <Text style={styles.title}>최신모델</Text>
        <Text style={styles.seeMoreBtn}>더 보기</Text>
        <ArtCarouselSection data={modelData2} />
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 20,
    backgroundColor: '#F7F4F1',
  },
  logo: {
    marginTop: 40,
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
    fontWeight: '800',
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
  seeMoreBtn: {
    position: 'absolute',
    right: 0,
    top: 5,
    fontFamily: 'Freesentation',
    fontWeight: '700',
    color: '#59799B',
  },
});
