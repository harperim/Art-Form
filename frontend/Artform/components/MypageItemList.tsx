// components/AnimatedModelCard.tsx
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  item: Model[];
  disableAnimation?: Model | null;
};
type Model = {
  id: string;
  title: string;
  artist: string;
  image: { uri: string };
};

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height / 5;
const GRID_ITEM_WIDTH = width / 2;

// const renderGridItem = (item, index, disableAnimation: {index: number }; ) => (
//   <Animated.View
//     entering={disableAnimation ? undefined : FadeInDown.delay(index * 100).springify()}
//     style={styles.card}
//   >
//     <TouchableOpacity activeOpacity={0.9} style={{ width: '100%', height: '100%' }}>
//       <Image style={{ width: '100%', height: '100%', borderRadius: 8 }} source={item.image} />
//       {/* <MyPageItemList
//             item={item.image}
//             index={index}
//             onPress={() => handleCardPress(item)}
//             disableAnimation={null}
//           /> */}
//       <Text style={{ marginTop: 10 }}>{item.artist}</Text>
//       <Text>ff</Text>
//     </TouchableOpacity>
//   </Animated.View>
// );

export default function AnimatedModelCard({ item, disableAnimation = null }: Props) {
  const renderGridItem = ({ item, index }: { item: Model; index: number }) => (
    <Animated.View
      entering={disableAnimation ? undefined : FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <Image style={styles.cardImage} source={item.image} />
        <Text style={styles.modelName}>{item.title}</Text>
        {item.artist ? <Text style={styles.modelArtist}>by {item.artist}</Text> : null}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.mainContentItem}>
      <FlatList
        data={item}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 12, marginBottom: 20 }}
        renderItem={renderGridItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
// onPress={onPress}
//   <Animated.View
//     entering={disableAnimation ? undefined : FadeInDown.delay(index * 100).springify()}
//     style={styles.card}
//   >
//     <Image source={item.image} style={styles.cardImage} />
//     <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
//       {item.title}
//     </Text>
//   </Animated.View>

const styles = StyleSheet.create({
  mainContentItem: {
    marginTop: 20,
  },
  card: { width: GRID_ITEM_WIDTH, flex: 1 },
  cardImage: {
    width: '100%',
    height: height,
    resizeMode: 'cover',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2C2D26',
  },
  modelName: { marginTop: 8, fontSize: 18, fontFamily: 'Freesentation7', color: '#2C2D26' },
  modelArtist: { fontSize: 14, fontFamily: 'Freesentation6', color: '#6E95BE' },
});
