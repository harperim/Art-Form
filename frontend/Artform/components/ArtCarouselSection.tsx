// components/ArtCarouselSection.tsx
import type { ImageSourcePropType } from 'react-native';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ArtCarouselCard from './ArtCarouselCard';

type Item = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  artist?: string;
};

type Props = {
  data: Item[];
  onPress: (item: Item) => void;
};

export default function ArtCarouselSection({ data, onPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={160}
      decelerationRate="fast"
      style={styles.scroll}
    >
      {data.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={() => onPress(item)}>
          <ArtCarouselCard image={item.image} title={item.title} subtitle={item.artist} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 10,
  },
});
