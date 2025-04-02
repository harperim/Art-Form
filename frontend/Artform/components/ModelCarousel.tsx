import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { View, Text, Image, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

export type ModelItem = {
  id: string;
  image: ImageSourcePropType; // ImageSourcePropType 등으로 타입 지정 가능
  title: string;
  artist: string;
};

type ModelCarouselProps = {
  data: ModelItem[];
};

export default function ModelCarousel({ data }: ModelCarouselProps) {
  const { width } = useWindowDimensions();
  const carouselWidth = width - 48;
  const carouselHeight = Math.round(carouselWidth * 1.0);

  return (
    <Carousel
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
      renderItem={({ item }) => (
        <Animated.View style={styles.card}>
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
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 12,
    position: 'relative',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    paddingTop: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardArtist: {
    fontSize: 14,
    color: '#999',
    paddingTop: 2,
    padding: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
