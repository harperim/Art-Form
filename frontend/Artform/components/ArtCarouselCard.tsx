import { View, Image, Text, StyleSheet } from 'react-native';

type Props = {
  image: string;
  title: string;
  subtitle?: string;
};

export default function ArtCarouselCard({ image, title, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    height: 210,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  image: {
    width: 148,
    height: 184,
    borderRadius: 12,
    marginBottom: 6,
    resizeMode: 'cover',
    backgroundColor: '#eee', // ✅ 썸네일 없을 때 깜빡임 방지용
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
});
