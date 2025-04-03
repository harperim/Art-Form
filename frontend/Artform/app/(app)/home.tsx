// app/(app)/home.tsx
import {
  Image,
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import TodayPickCarousel from '~/components/TodayPickCarousel';
import ArtCarouselSection from '~/components/ArtCarouselSection';
import ParallaxCarouselPagination from '~/components/ParallaxCarouselPagination';
import { mockModels } from '~/constants/mockModels';
import { router } from 'expo-router';

export default function Home() {
  const OFFSET = 20;
  const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

  const scrollX = useSharedValue(0);

  const todayData = mockModels;

  const modelData = todayData.map((model) => ({
    id: model.id,
    image: model.image,
    title: model.title,
  }));

  return (
    <ScrollView style={styles.main}>
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
              <TodayPickCarousel item={item} key={index} id={index} scrollX={scrollX} />
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
        <ArtCarouselSection data={modelData} />
      </View>

      {/* 최신 모델 */}
      <View style={styles.newModelView}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>최신모델</Text>
          <TouchableOpacity onPress={() => router.push('/store?sort=latest')}>
            <Text style={styles.seeMoreBtn}>더 보기</Text>
          </TouchableOpacity>
        </View>
        <ArtCarouselSection data={modelData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 20,
    backgroundColor: '#F7F4F1',
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
