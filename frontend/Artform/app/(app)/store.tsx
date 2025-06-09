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

import { Alert } from 'react-native'; // 파일 상단에 이미 있을 수 있음

// 맨 위에 이미지 import 추가
import image5 from '../../assets/images/FE/라푼젤.jpg';
import image6 from '../../assets/images/FE/양산을쓴여인.jpg';
import image7 from '../../assets/images/FE/파리의거리.jpg';
import image8 from '../../assets/images/FE/진주귀고리소녀.jpg';
import image9 from '../../assets/images/FE/귀멸의칼날.jpg';
import image10 from '../../assets/images/FE/마음의소리.jpg';

import image11 from '../../assets/images/FE/유미의세포들.jpg';
import image12 from '../../assets/images/FE/동양화.png';
import image13 from '../../assets/images/FE/그랑드자트섬의-일요일-오후.jpg';
import image14 from '../../assets/images/FE/아따맘마.jpg';
import image15 from '../../assets/images/FE/짱구.jpg';
import image16 from '../../assets/images/FE/바른연애길잡이.webp';
import image17 from '../../assets/images/FE/별이빛나는밤.jpg';
import image18 from '../../assets/images/FE/키스.jpg';
import image19 from '../../assets/images/FE/절규.webp';
import image20 from '../../assets/images/FE/기억의지속.webp';
import image21 from '../../assets/images/FE/아따아따.webp';
import image22 from '../../assets/images/FE/스즈메의문단속.webp';
import image23 from '../../assets/images/FE/토이스토리.png';
import image24 from '../../assets/images/FE/크로키익스프레시브.png';
import image25 from '../../assets/images/FE/크로키.png'

import { Image } from 'react-native'; // Image.resolveAssetSource 사용을 위해

import ModelBottomSheet from '~/components/ModelBottomSheet';

export default function StoreScreen() {
  const { sort: sortParam } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [models, setModels] = useState<ModelWithThumbnail[]>([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { selectedModel, setSelectedModel } = useModel();

  // const handleCardPress = (item: ModelWithThumbnail) => {
  //   setSelectedModel(item);
  // };

  const handleCardPress = (item: ModelWithThumbnail) => {
    if (sort === 'popular' && item.model.modelName === '유미의 세포들') {
      setSelectedModel(item); // ✅ 상세보기 열기 조건 충족 시에만
    } else {
      // 원하면 경고창이나 로그 출력 가능
      console.log('상세보기는 인기순의 "유미의 세포들"만 지원됩니다.');
    }
  };

  useEffect(() => {
    if (sortParam === 'latest' || sortParam === 'popular') {
      setSort(sortParam);
    }
  }, [sortParam]);

  useEffect(() => {
    loadInitialModels();
  }, [sort]);

  // fakeModel 함수 정의
  const fakeModel = (
    modelId: number,
    modelName: string,
    image: any,
    userName: string
  ): ModelWithThumbnail => ({
    model: {
      modelId,
      userId: 1,
      modelName,
      description: `요즘 제가 빠진 화풍이에요 :)
‘유미의 세포들’처럼 말랑말랑하고 귀여운 느낌을 살리고 싶어서
전체적으로 부드러운 색감에 동글동글한 3D 스타일로 만들어봤어요.

그림자도 강하지 않게 톤을 눌러서
전체적으로 따뜻하고 감성적인 분위기가 나도록 신경 썼고,
캐릭터 표정에 감정이 살아 있는 느낌을 주려고 했어요.

딱 봤을 때 “아, 뭔가 사랑스럽고 포근하다” 싶은 느낌!
그걸 목표로 만든 화풍입니다 💛`,
      likeCount: 0,
      uploadFileName: `${modelName}.jpg`,
      thumbnailId: modelId,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      public: true,
    },
    userName,
    thumbnailUrl: Image.resolveAssetSource(image).uri,
  });

  // const loadInitialModels = async () => {
  //   try {
  //     const fetchModelsBySort = sort === 'latest' ? fetchRecentModels : fetchHotModels;
  //     const data = await fetchModelsBySort(0);

  //     const urls = await Promise.all(
  //       data.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
  //     );

  //     const merged = data.map((model, index) => ({
  //       ...model,
  //       thumbnailUrl: getValidUrl(urls[index]),
  //     }));

  //     setModels(merged);
  //     setPage(1);
  //     setHasMore(data.length > 0);
  //   } catch (err) {
  //     console.error('모델 불러오기 실패:', err);
  //   }
  // };

  const loadInitialModels = async () => {
    // 인기순 더미 데이터 (기존 + 추가)
    const dummyLatest = [
      fakeModel(5, '라푼젤', image5, '디즈니'),
      fakeModel(6, '양산을 쓴 여인', image6, '모네'),
      fakeModel(7, '파리의 거리', image7, '카유보트'),
      fakeModel(8, '진주 귀고리 소녀', image8, '베르메르'),
      fakeModel(9, '귀멸의 칼날', image9, '고토게 코요하루'),
      fakeModel(17, '별이 빛나는 밤', image17, '반 고흐'),
      fakeModel(10, '마음의 소리', image10, '조석'),
      fakeModel(24, '크로키 익스프레시브', image24, '디지털 일러스트'),
      fakeModel(18, '키스', image18, '클림트'),
      fakeModel(19, '절규', image19, '뭉크'),
      fakeModel(20, '기억의 지속', image20, '살바도르 달리'),
      fakeModel(11, '유미의 세포들', image11, '스튜디오드래곤'),
      fakeModel(12, '동양화', image12, '김홍도'),
      fakeModel(14, '아따맘마', image14, '이영식'),
      fakeModel(13, '그랑드 자트섬의 일요일 오후', image13, '쇠라'),
      fakeModel(15, '짱구는 못말려', image15, '우스이 요시토'),
      fakeModel(16, '바른연애 길잡이', image16, '남수'),
      fakeModel(22, '스즈메의 문단속', image22, '신카이 마코토'),
      fakeModel(21, '아따아따', image21, '원작 미확인'),
      fakeModel(23, '토이 스토리', image23, '픽사'),
      fakeModel(25, '크로키', image25, '연필 스케치'),
    ];

    // 최신순 더미 데이터 (기존 + 추가)
    const dummyPopular = [
      fakeModel(11, '유미의 세포들', image11, '스튜디오드래곤'),
      fakeModel(12, '동양화', image12, '김홍도'),
      fakeModel(15, '짱구는 못말려', image15, '우스이 요시토'),
      fakeModel(16, '바른연애 길잡이', image16, '남수'),
      fakeModel(13, '그랑드 자트섬의 일요일 오후', image13, '쇠라'),
      fakeModel(14, '아따맘마', image14, '이영식'),
      
      fakeModel(21, '아따아따', image21, '원작 미확인'),
      fakeModel(22, '스즈메의 문단속', image22, '신카이 마코토'),
      fakeModel(24, '크로키 익스프레시브', image24, '디지털 일러스트'),
      fakeModel(23, '토이 스토리', image23, '픽사'),
      fakeModel(25, '크로키', image25, '연필 스케치'),
      fakeModel(5, '라푼젤', image5, '디즈니'),
      fakeModel(9, '귀멸의 칼날', image9, '고토게 코요하루'),
      fakeModel(6, '양산을 쓴 여인', image6, '모네'),
      fakeModel(7, '파리의 거리', image7, '카유보트'),
      fakeModel(8, '진주 귀고리 소녀', image8, '베르메르'),
      fakeModel(10, '마음의 소리', image10, '조석'),
      fakeModel(17, '별이 빛나는 밤', image17, '반 고흐'),
      fakeModel(18, '키스', image18, '클림트'),
      fakeModel(19, '절규', image19, '뭉크'),
    ];

    const selectedData = sort === 'popular' ? dummyPopular : dummyLatest;

    setModels(selectedData);
    setPage(1);
    setHasMore(false);
  };

  const loadMoreModels = async () => {
    // if (isFetchingMore || !hasMore) return;

    // setIsFetchingMore(true);
    // try {
    //   const fetchModelsBySort = sort === 'latest' ? fetchRecentModels : fetchHotModels;
    //   const data = await fetchModelsBySort(page);

    //   const urls = await Promise.all(
    //     data.map((model) => fetchPresignedImageUrl(model.model.thumbnailId)),
    //   );

    //   const merged = data.map((model, index) => ({
    //     ...model,
    //     thumbnailUrl: getValidUrl(urls[index]),
    //   }));

    //   setModels((prev) => [...prev, ...merged]);
    //   setPage((prev) => prev + 1);
    //   if (data.length === 0) setHasMore(false);
    // } catch (err) {
    //   console.error('더 불러오기 실패:', err);
    // } finally {
    //   setIsFetchingMore(false);
    // }
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
