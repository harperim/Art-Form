// app/(app)/train.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 24 * 2 - 12 * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type AssetWithLocalUri = MediaLibrary.Asset & { localUri?: string };

export default function TrainScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<AssetWithLocalUri[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const hasPermission = await requestMediaPermission();
      if (hasPermission) {
        loadPhotos(); // 첫 로딩
      }
    })();
  }, []);

  const requestMediaPermission = async (): Promise<boolean> => {
    const { granted } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (!granted) {
      Alert.alert(
        '사진 접근 권한 필요',
        '모든 사진을 불러오기 위해 갤러리 접근 권한이 필요합니다.',
      );
      return false;
    }
    return true;
  };

  const loadPhotos = async (after: string | null = null) => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);

    try {
      const assetResult = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: [['modificationTime', false]],
        first: 30,
        after: after ?? undefined,
      });

      const newAssets = assetResult.assets;
      const existingIds = new Set(photos.map((p) => p.id));
      const uniqueAssets = newAssets.filter((p) => !existingIds.has(p.id));

      const enriched: AssetWithLocalUri[] = await Promise.all(
        uniqueAssets.map(async (asset) => {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          return {
            ...asset,
            localUri: info.localUri || asset.uri,
          };
        }),
      );

      setPhotos((prev) => [...prev, ...enriched]);
      setEndCursor(assetResult.endCursor ?? null);
      setHasNextPage(assetResult.hasNextPage);
    } catch (error) {
      console.warn('사진 불러오기 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleSelect = async (item: AssetWithLocalUri) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else if (next.size < 20) {
        next.add(item.id);
      }
      return next;
    });

    // localUri 없으면 다시 불러오기
    if (!item.localUri) {
      const info = await MediaLibrary.getAssetInfoAsync(item);
      setPhotos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, localUri: info.localUri || item.uri } : p)),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>모델 학습하기</Text>
      </View>

      <Text style={styles.subtitle}>사진 10장을 선택해 주세요.</Text>

      <FlatList
        data={photos}
        extraData={photos}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        keyExtractor={(item) => `${item.id}-${item.localUri ?? ''}`}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (endCursor) loadPhotos(endCursor);
        }}
        initialNumToRender={30}
        windowSize={10}
        removeClippedSubviews
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#888" />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity onPress={() => toggleSelect(item)}>
              <View style={styles.imageWrapper}>
                {item.localUri ? (
                  <Image source={{ uri: item.localUri }} style={styles.image} />
                ) : (
                  <View style={[styles.image, { backgroundColor: '#eee' }]} />
                )}
                {isSelected && (
                  <View style={styles.overlay}>
                    <Ionicons name="checkmark-circle" size={36} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.trainButton, { backgroundColor: selected.size === 10 ? '#7EA4CC' : '#ccc' }]}
        disabled={selected.size < 10}
        onPress={() => {
          const selectedUris = photos.filter((p) => selected.has(p.id)).map((p) => p.localUri);
          console.log('선택된 사진 URI:', selectedUris);
          router.push('/create-model');
        }}
      >
        <Text style={styles.trainButtonText}>학습하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: 'white' },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: { fontSize: 18, fontFamily: 'Freesentation7' },
  subtitle: { fontSize: 16, fontFamily: 'Freesentation6', marginBottom: 12 },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8 },
  imageWrapper: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderColor: '#ddd',
    borderWidth: 0.8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  trainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
