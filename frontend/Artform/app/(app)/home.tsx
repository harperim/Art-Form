import TodayPickCarousel from '~/components/TodayPickCarousel';
import ArtCarouselSection from '~/components/ArtCarouselSection ';
import ParallaxCarouselPagination from '~/components/parallaxCarouselPagination';
import { Image, View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

export default function Home() {
  const OFFSET = 20;
  const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

  const data = [
    {
      poster: require('../../assets/images/splash1.png'),
      title: '별이 빛나는 밤',
      likes: 40,
    },
    {
      poster: require('../../assets/images/splash2.png'),
      title: '진주 귀걸이를 한 소녀',
      likes: 30,
    },
    {
      poster: require('../../assets/images/splash3.png'),
      title: '최후의 만찬',
      likes: 20,
    },
    {
      poster: require('../../assets/images/splash4.png'),
      title: '나폴레옹',
      likes: 27,
    },
    {
      poster: require('../../assets/images/splash1.png'),
      title: '별이 빛나는 밤',
      likes: 40,
    },
  ];

  const data1 = [
    {
      poster: require('../../assets/images/splash1.png'),
      title: '별이 빛나는 밤',
      likes: 40,
    },
    {
      poster: require('../../assets/images/splash2.png'),
      title: '진주 귀걸이를 한 소녀',
      likes: 30,
    },
    {
      poster: require('../../assets/images/splash3.png'),
      title: '최후의 만찬',
      likes: 20,
    },
    {
      poster: require('../../assets/images/splash4.png'),
      title: '나폴레옹',
      likes: 27,
    },
    {
      poster: require('../../assets/images/splash1.png'),
      title: '별이 빛나는 밤',
      likes: 40,
    },
    {
      poster: require('../../assets/images/splash2.png'),
      title: '진주 귀걸이를 한 소녀',
      likes: 30,
    },
    {
      poster: require('../../assets/images/splash3.png'),
      title: '최후의 만찬',
      likes: 20,
    },
    {
      poster: require('../../assets/images/splash4.png'),
      title: '나폴레옹',
      likes: 27,
    },
  ];

  const scrollX = useSharedValue(0);
  const scrollX2 = useSharedValue(0);

  return (
    <Animated.ScrollView style={styles.main}>
      {/* logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* main content */}
      <View style={styles.todayRecommend}>
        {/* 오늘의 추천 */}
        <Text style={styles.title}>오늘의 추천</Text>
        <View style={styles.parallaxCarouselView}>
          <Animated.ScrollView
            horizontal // 스크롤 방향을 가로로 설정합니다.
            decelerationRate={'fast'} // 스크롤을 멈추는 감속 속도를 빠르게 설정합니다.
            snapToInterval={ITEM_WIDTH}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            disableIntervalMomentum
            scrollEventThrottle={20}
            onScroll={(event) => {
              scrollX.value = event.nativeEvent.contentOffset.x;
            }}
          >
            {data.map((item, index) => (
              <TodayPickCarousel item={item} key={index} id={index} scrollX={scrollX} />
            ))}
          </Animated.ScrollView>
          <ParallaxCarouselPagination data={data} scrollX={scrollX} />
        </View>
      </View>
      {/* 인기 모델 */}
      <View style={styles.popularModelView}>
        <Text style={styles.title}>인기모델</Text>
        <Text style={styles.seeMoreBtn}>더 보기</Text>
        <View style={styles.parallaxCarouselView}>
          <Animated.ScrollView
            horizontal
            decelerationRate="fast"
            snapToInterval={148}
            bounces={false}
            disableIntervalMomentum
            scrollEventThrottle={20}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              scrollX2.value = event.nativeEvent.contentOffset.x;
            }}
          >
            {data1.map((item, index) => (
              <ArtCarouselSection item={item} key={index} id={index} scrollX={scrollX2} />
            ))}
          </Animated.ScrollView>
        </View>
      </View>
      <View style={styles.newModelView}>
        <Text style={styles.title}>최신모델</Text>
        <Text style={styles.seeMoreBtn}>더 보기</Text>
        <View style={styles.parallaxCarouselView}>
          <Animated.ScrollView
            horizontal
            decelerationRate="fast"
            snapToInterval={148}
            bounces={false}
            disableIntervalMomentum
            scrollEventThrottle={20}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              scrollX2.value = event.nativeEvent.contentOffset.x;
            }}
          >
            {data1.map((item, index) => (
              <ArtCarouselSection item={item} key={index} id={index} scrollX={scrollX2} />
            ))}
          </Animated.ScrollView>
        </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 20,
  },
  logo: {
    width: 128,
    height: 40,
  },
  todayRecommend: {
    marginTop: 28,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Freesentation-6SemiBold',
    fontWeight: 'bold',
  },
  parallaxCarouselView: {
    marginTop: 12,
  },
  popularModelView: {
    marginTop: 20,
  },
  newModelView: {
    marginTop: 20,
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
