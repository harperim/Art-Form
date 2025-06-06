// components/ModelCarousel.tsx
import { LinearGradient } from 'expo-linear-gradient';
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
import type { ModelWithThumbnail } from '~/types/model';

type Props = {
  data: ModelWithThumbnail[];
  onPress: (item: ModelWithThumbnail) => void;
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
          stackInterval: 36, // 카드 간 간격 (조정 가능)
          scaleInterval: 0.15, // 스케일 비율 (중앙 카드와 양 옆 카드 크기 차이)
          showLength: 3, // 화면에 동시에 보여질 카드 수
        }}
        loop
        onProgressChange={(_, absoluteProgress) => {
          scrollX.value = absoluteProgress * carouselWidth;
        }}
        renderItem={({ item }) => (
          <Animated.View key={item.model.modelId.toString()} style={styles.card}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
                locations={[0, 0.2, 0.8]}
                style={styles.cardTitleOverlay}
              >
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.model.modelName}
                </Text>
                <Text style={styles.cardArtist} numberOfLines={1} ellipsizeMode="tail">
                  by {item.userName}
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
    borderRadius: 12,
    borderColor: '#6E95BE',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    paddingTop: 16,
    fontFamily: 'Freesentation7',
    textAlign: 'center',
  },
  cardArtist: {
    fontSize: 14,
    color: '#999',
    paddingBottom: 10,
    fontFamily: 'Freesentation7',
    textAlign: 'center',
  },
  cardTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 1,
    borderRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
});
