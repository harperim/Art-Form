import type { ImageSourcePropType } from 'react-native';
import { Text, StyleSheet, Image, Dimensions, View } from 'react-native';
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

const OFFSET = 12; // 이미지 양쪽 여백
const ITEM_WIDTH = 148;
const ITEM_HEIGHT = 184; // 전체 카드 높이

interface CarouselItem {
  poster: ImageSourcePropType;
  title: string;
  likes: number;
}

interface ParallaxCarouselCardProps {
  item: CarouselItem;
  id: number;
  scrollX: SharedValue<number>;
}

const ArtCarouselSection: React.FC<ParallaxCarouselCardProps> = ({ item, id, scrollX }) => {

  return (
    <Animated.View style={[styles.cardContainer]}>
      <Image source={item.poster} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT + 30,
    marginHorizontal: OFFSET / 3,
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Freesentation',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ArtCarouselSection;
