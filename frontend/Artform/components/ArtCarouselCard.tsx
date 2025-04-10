import { BlurView } from 'expo-blur';
import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';

type Props = {
  image: string;
  title: string;
  subtitle?: string;
};

export default function ArtCarouselCard({ image, title, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View
        style={{
          width: 92,
          height: 28,
          borderColor: '#6E95BE',
          borderWidth: 1,
          borderRadius: 4,
          overflow: 'hidden', // 필수! 안 주면 radius가 적용 안 됨
        }}
      >
        <ImageBackground
          source={{ uri: image }}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
          resizeMode="cover"
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </BlurView>
        </ImageBackground>
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    height: 210,
    marginRight: 8,
    alignItems: 'center',
  },
  image: {
    width: 148,
    height: 184,
    borderRadius: 8,
    marginBottom: 6,
    borderColor: '#6E95BE',
    borderWidth: 0.53,
    resizeMode: 'cover',
    backgroundColor: '#eee', // ✅ 썸네일 없을 때 깜빡임 방지용
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Freesentation7',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
});
