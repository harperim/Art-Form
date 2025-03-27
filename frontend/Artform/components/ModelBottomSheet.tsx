// components/ModelBottomSheet.tsx
import { forwardRef, useMemo } from 'react';
import { Text, Image, Dimensions, StyleSheet, View, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';

export type Model = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  // artist: string;
  // liked: boolean;
  // likes: number;
  // relatedImages: ImageSourcePropType[];
  // reviews: {
  //   id: string;
  //   nickname: string;
  //   comment: string;
  //   date: string;
  //   avatar: ImageSourcePropType;
  // }[];
};

// type Review = {
//   id: string;
//   nickname: string;
//   comment: string;
//   date: string;
//   avatar: ImageSourcePropType;
// };

// type RelatedImage = ImageSourcePropType;

// type ModelDetail = Model & {
//   artist: string;
//   liked: boolean;
//   likes: number;
//   relatedImages: RelatedImage[];
//   reviews: Review[];
// };

type Props = {
  selected: Model | null;
  onDismiss: () => void;
};

const ModelBottomSheet = forwardRef<BottomSheetModal, Props>(({ selected, onDismiss }, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);

  if (!selected) return null;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleComponent={null}
      // handleIndicatorStyle={{ backgroundColor: '#ccc' }}
      onDismiss={onDismiss}
    >
      <BottomSheetView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.handleBar} />
          <TouchableOpacity onPress={onDismiss} style={styles.closeIcon}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 제목 & 작가 */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{selected.title}</Text>
            {/* <Text style={styles.subtitle}>by {selected.artist}</Text> */}
          </View>
          <View style={styles.likes}>
            {/* <Ionicons
              name={selected.liked ? 'heart' : 'heart-outline'}
              size={20}
              color={colors.gray[300]}
            /> */}
            {/* <Text style={{ marginLeft: 4 }}>{selected.likes}</Text> */}
          </View>
        </View>

        {/* 대표 이미지 */}
        <Image source={selected.image} style={styles.mainImage} />

        {/* 나머지 영역은 이후 추가 */}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default ModelBottomSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    top: -4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    marginTop: 2,
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainImage: {
    width: Dimensions.get('window').width - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
});
