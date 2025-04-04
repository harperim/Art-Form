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
import { mockModels } from '~/constants/mockModels';

import AnimatedModelCard from '~/components/AnimatedModelCard';

export default function StoreScreen() {
  const { sort: sortParam } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const { selectedModel, setSelectedModel } = useModel();

  const handleCardPress = (item: ModelWithThumbnail) => {
    setSelectedModel(item);
  };

  useEffect(() => {
    if (sortParam === 'latest' || sortParam === 'popular') {
      setSort(sortParam);
    }
  }, [sortParam]);

  const sortedData = [...mockModels].sort((a, b) => {
    if (sort === 'popular') {
      // likes 높은 순으로 정렬 (내림차순)
      return (b.likes ?? 0) - (a.likes ?? 0);
    }
    // 최신순은 id 기준 내림차순 (문자열이지만 id가 시간순이라면)
    return Number(b.id) - Number(a.id);
  });

  const filtered = sortedData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
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
        <Animated.ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.columns}>
            <View style={styles.column}>
              {leftColumn.map((item, index) => (
                <AnimatedModelCard
                  key={`${item.id}-${sort}`}
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
                  key={`${item.id}-${sort}`}
                  item={item}
                  index={index + 0.5}
                  onPress={() => handleCardPress(item)}
                  disableAnimation={selectedModel}
                />
              ))}
            </View>
          </View>
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
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EAEAEA',
  },
  sortText: {
    color: '#555',
    fontWeight: 'bold',
  },
  activeSort: {
    backgroundColor: colors.primary,
  },
  activeSortText: {
    color: 'white',
    fontWeight: 'bold',
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
