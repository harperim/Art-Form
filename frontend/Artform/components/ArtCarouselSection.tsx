// components/ArtCarouselSection.tsx
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ArtCarouselCard from './ArtCarouselCard';
import type { ModelWithThumbnail } from '~/types/model';

type Props = {
  data: ModelWithThumbnail[];
  onPress: (item: ModelWithThumbnail) => void;
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
        <TouchableOpacity
          key={item.model.modelId}
          activeOpacity={0.9}
          onPress={() => onPress(item)}
        >
          <ArtCarouselCard
            image={item.thumbnailUrl}
            title={item.model.modelName}
            // subtitle={item.userName}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    top: -4,
    paddingVertical: 10,
  },
});
