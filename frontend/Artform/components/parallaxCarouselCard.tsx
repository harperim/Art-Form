import type { ImageSourcePropType } from 'react-native';
import { Text, View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

const OFFSET = 19;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = 247;

// ✅ props 타입 정의
interface CarouselItem {
  poster: ImageSourcePropType;
  title: string;
}

interface ParallaxCarouselCardProps {
  item: CarouselItem;
  id: number;
  scrollX: SharedValue<number>; // Reanimated 2에서 사용되는 공유 값 타입
  total: number;
}

const ParallaxCarouselCard: React.FC<ParallaxCarouselCardProps> = ({
  item,
  id,
  scrollX,
  total,
}) => {
  const inputRange = [(id - 1) * ITEM_WIDTH, id * ITEM_WIDTH, (id + 1) * ITEM_WIDTH];

  const translateStyle = useAnimatedStyle(() => {
    const translate = interpolate(scrollX.value, inputRange, [0.97, 1, 0.97], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    return {
      transform: [{ scale: translate }],
      opacity,
    };
  });

  const translateImageStyle = useAnimatedStyle(() => {
    const translate = interpolate(
      scrollX.value,
      inputRange,
      [-ITEM_WIDTH * 0.2, 0, ITEM_WIDTH * 0.4],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: translate }],
    };
  });

  const translateTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          marginLeft: id === 0 ? OFFSET : undefined,
          marginRight: id === total - 1 ? OFFSET : undefined,
          overflow: 'hidden',
          borderRadius: 15,
        },
        translateStyle,
      ]}
    >
      <Animated.View style={translateImageStyle}>
        <ImageBackground source={item.poster} style={styles.imageBackground}>
          <Animated.View style={[styles.posterInfoView, translateTextStyle]}>
            <Text style={styles.posterTitle}>{item.title}</Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    resizeMode: 'cover',
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  posterInfoView: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 21,
    paddingVertical: 9,
    borderRadius: 12,
  },
  posterTitle: {
    fontSize: 18,
    fontFamily: 'Freesentation',
    fontWeight: '600',
  },
});

export default ParallaxCarouselCard;
