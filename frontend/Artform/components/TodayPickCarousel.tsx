// components/TodayPickCarousel.tsx
import type { ImageSourcePropType } from 'react-native';
import { Text, StyleSheet, ImageBackground, Dimensions, View } from 'react-native';
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ICONS } from '~/constants/icons';

const OFFSET = 20;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = Dimensions.get('window').height * 0.36;

// props 타입 정의
interface CarouselItem {
  image: ImageSourcePropType;
  title: string;
  likes: number;
}

interface ParallaxCarouselCardProps {
  item: CarouselItem;
  id: number;
  scrollX: SharedValue<number>;
}

const TodayPickCarousel: React.FC<ParallaxCarouselCardProps> = ({ item, id, scrollX }) => {
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
      [-ITEM_WIDTH * 0.2, 0, ITEM_WIDTH * 0.2],
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
          overflow: 'hidden',
          borderRadius: 15,
        },
        translateStyle,
      ]}
    >
      <Animated.View style={translateImageStyle}>
        <ImageBackground source={item.image} style={styles.imageBackground} resizeMode="cover">
          <Animated.View
            style={[styles.posterInfoView, translateTextStyle, { width: ITEM_WIDTH - OFFSET * 4 }]}
          >
            <Text style={styles.posterTitle}>{item.title}</Text>
            <View style={styles.heartBox}>
              <ICONS.heart.filled
                width={20}
                height={20}
                style={[{ position: 'relative', top: 1 }]}
              />
              <Text style={styles.likesCount}>{item.likes}</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  posterInfoView: {
    height: 44,
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    minWidth: 200,
  },
  heartBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  posterTitle: {
    fontSize: 16,
    fontFamily: 'Freesentation',
    fontWeight: '700',
  },
  likesCount: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '700',
    fontFamily: 'Freesentation',
  },
});

export default TodayPickCarousel;
