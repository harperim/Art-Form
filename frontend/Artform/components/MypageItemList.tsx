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
import { useModel } from '~/context/ModelContext';
import { useAuth } from '~/lib/auth-context';
import { fetchPresignedImageUrl } from '~/services/imageService';
import { fetchModelInfo } from '~/services/modelService';
import type { ModelWithThumbnail, MyModelItem } from '~/types/model';

type Props = {
  item: MyModelItem[];
  disableAnimation?: MyModelItem | null;
};

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height / 5;
const GRID_ITEM_WIDTH = width / 2;

export default function MypageItemList({ item, disableAnimation = null }: Props) {
  const { userInfo } = useAuth();

  const { setSelectedModel } = useModel();

  const handleCardPress = async (item: MyModelItem) => {
    try {
      const modelInfo = await fetchModelInfo(item.modelId);
      const thumbnailUrl = (await fetchPresignedImageUrl(modelInfo.model.thumbnailId)) || '';

      const formattedModel: ModelWithThumbnail = {
        ...modelInfo,
        thumbnailUrl,
      };

      setSelectedModel(formattedModel);
    } catch (error) {
      console.error('모델 조회 실패:', error);
    }
  };

  const renderGridItem = ({ item, index }: { item: MyModelItem; index: number }) => (
    <Animated.View
      entering={disableAnimation ? undefined : FadeInDown.delay(index * 30).springify()}
      style={styles.card}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(item)}>
        <Image style={styles.cardImage} source={{ uri: item.url }} />
        <Text style={styles.modelName}>{item.modelName}</Text>
        {item.userName !== userInfo.nickname ? (
          <Text style={styles.modelArtist}>by {item.userName}</Text>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.mainContentItem}>
      <FlatList
        data={item}
        numColumns={2}
        keyExtractor={(item) => item.modelId.toString()}
        columnWrapperStyle={{ gap: 12, marginBottom: 16 }}
        renderItem={renderGridItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

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
    borderWidth: 1,
    borderColor: '#2C2D26',
  },
  modelName: { marginTop: 4, fontSize: 18, fontFamily: 'Freesentation7', color: '#2C2D26' },
  modelArtist: { fontSize: 14, fontFamily: 'Freesentation6', color: '#6E95BE' },
});
