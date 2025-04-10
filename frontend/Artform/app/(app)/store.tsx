// app/(app)/store.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import colors from '~/constants/colors';
import type { ModelWithThumbnail } from '~/types/model';
import { useModel } from '~/context/ModelContext';
import { useLocalSearchParams } from 'expo-router';

import AnimatedModelCard from '~/components/AnimatedModelCard';
import { fetchHotModels, fetchRecentModels } from '~/services/modelService';
import { fetchPresignedImageUrl, getValidUrl } from '~/services/imageService';

export default function StoreScreen() {
  const { sort: sortParam } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [models, setModels] = useState<ModelWithThumbnail[]>([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { selectedModel, setSelectedModel } = useModel();

  const handleCardPress = (item: ModelWithThumbnail) => {
    setSelectedModel(item);
  };

  useEffect(() => {
    if (sortParam === 'latest' || sortParam === 'popular') {
      setSort(sortParam);
    }
  }, [sortParam]);

  useEffect(() => {
    loadInitialModels();
  }, [sort]);

  const loadInitialModels = async () => {
    try {
      const fetchModelsBySort = sort === 'latest' ? fetchRecentModels : fetchHotModels;
      const data = await fetchModelsBySort(0);

      const urls = await Promise.all(
        data.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
      );

      const merged = data.map((model, index) => ({
        ...model,
        thumbnailUrl: getValidUrl(urls[index]),
      }));

      setModels(merged);
      setPage(1);
      setHasMore(data.length > 0);
    } catch (err) {
      console.error('모델 불러오기 실패:', err);
    }
  };

  const loadMoreModels = async () => {
    if (isFetchingMore || !hasMore) return;

    setIsFetchingMore(true);
    try {
      const fetchModelsBySort = sort === 'latest' ? fetchRecentModels : fetchHotModels;
      const data = await fetchModelsBySort(page);

      const urls = await Promise.all(
        data.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
      );

      const merged = data.map((model, index) => ({
        ...model,
        thumbnailUrl: getValidUrl(urls[index]),
      }));

      setModels((prev) => [...prev, ...merged]);
      setPage((prev) => prev + 1);
      if (data.length === 0) setHasMore(false);
    } catch (err) {
      console.error('더 불러오기 실패:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const filtered = models.filter((item) =>
    item.model.modelName.toLowerCase().includes(search.toLowerCase()),
  );

  const leftColumn = filtered.filter((_, i) => i % 2 === 0);
  const rightColumn = filtered.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색 */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="모델명을 검색해 보세요."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* 정렬 */}
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[styles.sortBtn, sort === 'latest' && styles.activeSort]}
          onPress={() => setSort('latest')}
        >
          <Text style={sort === 'latest' ? styles.activeSortText : styles.sortText}>최신순</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sort === 'popular' && styles.activeSort]}
          onPress={() => setSort('popular')}
        >
          <Text style={sort === 'popular' ? styles.activeSortText : styles.sortText}>인기순</Text>
        </TouchableOpacity>
      </View>

      {/* 카드 */}
      {filtered.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContainer}
          scrollEventThrottle={100}
          showsVerticalScrollIndicator={false} // 👈 스크롤 바 숨기기
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isNearBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            if (isNearBottom) loadMoreModels();
          }}
        >
          <View style={styles.columns}>
            <View style={styles.column}>
              {leftColumn.map((item, index) => (
                <AnimatedModelCard
                  key={`${item.model.modelId}-${sort}`}
                  item={item}
                  index={index}
                  onPress={() => handleCardPress(item)}
                  disableAnimation={selectedModel}
                />
              ))}
            </View>
            <View style={[styles.column, { marginTop: 40 }]}>
              {rightColumn.map((item, index) => (
                <AnimatedModelCard
                  key={`${item.model.modelId}-${sort}`}
                  item={item}
                  index={index + 0.5}
                  onPress={() => handleCardPress(item)}
                  disableAnimation={selectedModel}
                />
              ))}
            </View>
          </View>
          {/* 로딩 인디케이터 */}
          {isFetchingMore && (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ textAlign: 'center', color: '#999' }}>불러오는 중...</Text>
            </View>
          )}
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBox: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderColor: '#EAEAEA',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Freesentation6',
    fontSize: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  sortText: {
    color: '#555',
    fontFamily: 'Freesentation7',
  },
  activeSort: {
    backgroundColor: colors.primary,
  },
  activeSortText: {
    color: 'white',
    fontFamily: 'Freesentation7',
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  columns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
});
