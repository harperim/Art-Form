// components/ArtCarouselCard.tsx
import type { ImageSourcePropType } from 'react-native';
import { View, Image, Text, StyleSheet } from 'react-native';

type Props = {
  image: ImageSourcePropType; // ImageSourcePropType
  title: string;
  subtitle?: string;
};

export default function ArtCarouselCard({ image, title, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />
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
