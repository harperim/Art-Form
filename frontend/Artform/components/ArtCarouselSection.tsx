// components/ArtCarouselSection.tsx
import type { ImageSourcePropType } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import ArtCarouselCard from './ArtCarouselCard';

type Item = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  artist?: string;
};

type Props = {
  data: Item[];
};

export default function ArtCarouselSection({ data }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={160}
      decelerationRate="fast"
      style={styles.scroll}
    >
      {data.map((item) => (
        <ArtCarouselCard
          key={item.id}
          image={item.image}
          title={item.title}
          subtitle={item.artist}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 10,
  },
});
