import ParallaxCarouselCard from '~/components/parallaxCarouselCard';
import ParallaxCarouselPagination from '~/components/parallaxCarouselPagination';
import { Image, View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

export default function Home() {
  const OFFSET = 19;
  const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
  const ITEM_HEIGHT = 247;

  const data = [
    {
      poster: require('../../assets/images/splash1.png'),
      title: '별이 빛나는 밤',
    },
    {
      poster: require('../../assets/images/splash2.png'),
      title: '진주 귀걸이를 한 소녀',
    },
    {
      poster: require('../../assets/images/splash3.png'),
      title: '최후의 만찬',
    },
    {
      poster: require('../../assets/images/splash4.png'),
      title: '나폴레옹',
    },
  ];

  const scrollX = useSharedValue(0);

  return (
    <View style={styles.main}>
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
            disableIntervalMomentum
            scrollEventThrottle={21}
            onScroll={(event) => {
              scrollX.value = event.nativeEvent.contentOffset.x;
            }}
          >
            {data.map((item, index) => (
              <ParallaxCarouselCard
                item={item}
                key={index}
                id={index}
                scrollX={scrollX}
                total={data.length}
              />
            ))}
          </Animated.ScrollView>
          <ParallaxCarouselPagination data={data} scrollX={scrollX} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Freesentation-6SemiBold',
    fontWeight: 'bold',
  },
  parallaxCarouselView: {
    paddingTop: 6,
  },
  todayRecommend: {
    marginTop: 30,
  },
});
