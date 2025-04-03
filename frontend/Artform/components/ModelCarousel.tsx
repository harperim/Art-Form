// components/ModelCarousel.tsx
import { LinearGradient } from 'expo-linear-gradient';
import type { ImageSourcePropType } from 'react-native';
import {
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  View,
} from 'react-native';

import Carousel from 'react-native-reanimated-carousel';
import ParallaxCarouselPagination from './ParallaxCarouselPagination';
import { useSharedValue } from 'react-native-reanimated';

export type ModelItem = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  artist: string;
};

type Props = {
  data: ModelItem[];
  onPress: (item: ModelItem) => void;
};

export default function ModelCarousel({ data, onPress }: Props) {
  const { width } = useWindowDimensions();
  const carouselWidth = width - 48;
  const carouselHeight = Math.round(carouselWidth * 1.0);

  const scrollX = useSharedValue(0);

  return (
    <View>
      <Carousel
        style={{ overflow: 'visible' }}
        data={data}
        width={carouselWidth}
        height={carouselHeight}
        mode="horizontal-stack"
        modeConfig={{
          snapDirection: 'left',
          stackInterval: 40, // 카드 간 간격 (조정 가능)
          scaleInterval: 0.15, // 스케일 비율 (중앙 카드와 양 옆 카드 크기 차이)
          showLength: 3, // 화면에 동시에 보여질 카드 수
        }}
        loop
        onProgressChange={(_, absoluteProgress) => {
          scrollX.value = absoluteProgress * carouselWidth;
        }}
        renderItem={({ item }) => (
          <Animated.View key={item.id} style={styles.card}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
              <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
                locations={[0, 0.2, 0.8]}
                style={styles.cardTitleOverlay}
              >
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={styles.cardArtist} numberOfLines={1} ellipsizeMode="tail">
                  by {item.artist}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
      {/* ✅ Pagination 컴포넌트 사용 */}
      <ParallaxCarouselPagination data={data} scrollX={scrollX} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '80%',
    height: '100%',
    borderRadius: 20,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    paddingTop: 12,
    fontWeight: '800',
    textAlign: 'center',
    borderRadius: 20,
  },
  cardArtist: {
    fontSize: 14,
    color: '#999',
    paddingTop: 2,
    padding: 6,
    fontWeight: '500',
    textAlign: 'center',
    borderRadius: 20,
  },
  cardTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 1,
    borderRadius: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
});
