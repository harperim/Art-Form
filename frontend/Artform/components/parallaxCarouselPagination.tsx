import { Dimensions, StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  interpolateColor,
} from 'react-native-reanimated';
import React from 'react';

const OFFSET = 20;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;

// ✅ PaginationDot props 타입 정의
interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
}

const PaginationDot: React.FC<PaginationDotProps> = ({ index, scrollX }) => {
  const inputRange = [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH];

  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      scrollX.value,
      inputRange,
      [10, 20, 10],
      Extrapolation.CLAMP,
    );
    const opacityAnimation = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );
    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, ITEM_WIDTH, 2 * ITEM_WIDTH],
      ['#c78200', '#c78200', '#c78200'],
    );
    return {
      backgroundColor,
    };
  });

  return <Animated.View style={[styles.dots, animatedDotStyle, animatedColor]} />;
};

// ✅ ParallaxCarouselPagination props 타입 정의
interface ParallaxCarouselPaginationProps {
  data: object[]; // 필요한 경우 더 구체적인 타입 정의 가능
  scrollX: SharedValue<number>;
}

const ParallaxCarouselPagination: React.FC<ParallaxCarouselPaginationProps> = ({
  data,
  scrollX,
}) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <PaginationDot index={index} scrollX={scrollX} key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },

  dots: {
    height: 10,
    marginHorizontal: 4,
    borderRadius: 5,
    backgroundColor: 'green',
  },
});

export default ParallaxCarouselPagination;
