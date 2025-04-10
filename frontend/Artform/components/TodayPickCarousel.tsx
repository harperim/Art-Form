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
import type { ModelWithThumbnail } from '~/types/model';
import { BlurView } from 'expo-blur';

const OFFSET = 20;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = Dimensions.get('window').height * 0.32;

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
            borderColor: '#6E95BE',
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            justifyContent: 'center',
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
            <BlurView
              intensity={60}
              tint="dark"
              style={[styles.posterInfoView, translateTextStyle]}
            >
              <View style={styles.textInfo}>
                <Text style={styles.posterTitle}>{item.model.modelName}</Text>
                <Text style={styles.userName}>by {item.userName}</Text>
              </View>
            </BlurView>
          </ImageBackground>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    overflow: 'hidden',
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  posterInfoView: {
    height: 48,
    overflow: 'hidden',
    borderRadius: 8,
    position: 'absolute',
    alignSelf: 'flex-end',
    paddingLeft: 28,
    paddingRight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 16,
    right: 16,
  },
  textInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  posterTitle: {
    fontSize: 16,
    color: '#ffff',
    fontFamily: 'Freesentation6',
  },
  userName: {
    fontSize: 8,
    color: '#DAD5D1',
    fontFamily: 'Freesentation4',
  },
});

export default TodayPickCarousel;
