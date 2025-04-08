import {
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { ICONS } from '~/constants/icons';
import type { ModelWithThumbnail } from '~/types/model';

const OFFSET = 20;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = Dimensions.get('window').height * 0.38;

interface ParallaxCarouselCardProps {
  item: ModelWithThumbnail;
  id: number;
  scrollX: SharedValue<number>;
  onPress: (item: ModelWithThumbnail) => void;
}

const TodayPickCarousel: React.FC<ParallaxCarouselCardProps> = ({ item, id, scrollX, onPress }) => {
  const inputRange = [(id - 1) * ITEM_WIDTH, id * ITEM_WIDTH, (id + 1) * ITEM_WIDTH];

  const translateStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.97, 1, 0.97], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const translateImageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-ITEM_WIDTH * 0.2, 0, ITEM_WIDTH * 0.2],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX }],
    };
  });

  const translateTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
      <Animated.View
        style={[
          {
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            overflow: 'hidden',
            borderColor: '#ddd',
            borderRadius: 8,
            justifyContent: 'center',
            borderWidth: 0.5,
          },
          translateStyle,
        ]}
      >
        <Animated.View style={translateImageStyle}>
          <ImageBackground
            source={{ uri: item.thumbnailUrl }}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <Animated.View
              style={[styles.posterInfoView, translateTextStyle, { width: ITEM_WIDTH - OFFSET }]}
            >
              <View style={styles.textInfo}>
                <Text style={styles.posterTitle}>{item.model.modelName}</Text>
                <Text style={styles.userName}>by {item.userName}</Text>
              </View>
              <View style={styles.heartBox}>
                <ICONS.heart.filled
                  width={20}
                  height={20}
                  style={{ position: 'relative', top: 1 }}
                />
                <Text style={styles.likesCount}>{item.model.likeCount}</Text>
              </View>
            </Animated.View>
          </ImageBackground>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  posterInfoView: {
    height: 60,
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 200,
  },
  textInfo: {
    flexDirection: 'column',
    marginRight: 8,
  },
  posterTitle: {
    fontSize: 16,
    fontFamily: 'Freesentation7',
    fontWeight: '700',
  },
  userName: {
    fontSize: 12,
    color: '#6E95BE',
    fontFamily: 'Freesentation7',
  },
  heartBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesCount: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '700',
    fontFamily: 'Freesentation',
  },
});

export default TodayPickCarousel;
