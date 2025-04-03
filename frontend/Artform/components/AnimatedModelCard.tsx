// components/AnimatedModelCard.tsx
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Model } from '~/types/model';

type Props = {
  item: Model;
  index: number;
  onPress: () => void;
  disableAnimation: Model | null;
};

export default function AnimatedModelCard({ item, index, onPress, disableAnimation }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View
        entering={disableAnimation ? undefined : FadeInDown.delay(index * 100).springify()}
        style={styles.card}
      >
        <Image source={item.image} style={styles.cardImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.4, 1]}
          style={styles.cardTitleOverlay}
        >
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 12,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 190,
    resizeMode: 'cover',
  },
  cardTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  cardTitle: {
    color: 'white',
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
