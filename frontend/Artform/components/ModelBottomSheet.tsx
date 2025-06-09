import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image as RNImage
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { ICONS } from '~/constants/icons';
import colors from '~/constants/colors';
import { useModel } from '~/context/ModelContext';
import { useAuth } from '~/lib/auth-context';

import { getImageUploadUrl } from '~/services/imageService';
import { deleteModelReview, fetchModelReviews, postModelReview } from '~/services/reviewService';
import { uploadToS3, getFileTypeFromUri } from '~/utils/uploadImageToS3';
import type { ModelWithThumbnail } from '~/types/model';
import type { Review } from '~/types/review';
import { fetchModelLikeStatus, likeModel } from '~/services/modelService';

import image11 from '../assets/images/FE/유미의세포들.jpg';


export default function ModelBottomSheet() {
  const snapPoints = useMemo(() => ['85%'], []);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(42);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState('');
  const [commentImage, setCommentImage] = useState<{ uri: string } | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const { userInfo } = useAuth();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { selectedModel, setSelectedModel, refreshSelectedModel, setBottomSheetClosed } =
    useModel();
  const model = selectedModel as ModelWithThumbnail;

  // 검색 
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ModelWithThumbnail[]>([]); // 검색 결과 리스트

  const dummyModels: ModelWithThumbnail[] = [
    {
      model: {
        modelId: 1,
        modelName: '유미의 세포들',
        likeCount: 42,
        description: '세포들의 세계를 그린 따뜻한 그림입니다.',
        createdAt: new Date().toISOString(),
      },
      thumbnailUrl: '',
      userName: '작가1',
    },
    {
      model: {
        modelId: 2,
        modelName: '픽셀 꿈의 숲',
        likeCount: 10,
        description: '환상적인 숲을 그린 픽셀 아트 스타일',
        createdAt: new Date().toISOString(),
      },
      thumbnailUrl: '',
      userName: '작가2',
    },
  ];

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    const filtered = dummyModels.filter((model) =>
      model.model.modelName.toLowerCase().includes(text.toLowerCase()),
    );
    setSearchResults(filtered);
  }, []);


  // useEffect(() => {
  //   const init = async () => {
  //     if (!model) return;

  //     setPage(0);
  //     setHasMore(true);
  //     loadReviews(0, true);
  //     setLikes(model.model.likeCount);

  //     try {
  //       const liked = await fetchModelLikeStatus(model.model.modelId);
  //       setLiked(liked);
  //     } catch (err) {
  //       console.warn('좋아요 여부 불러오기 실패:', err);
  //       setLiked(false);
  //     }
  //   };

  //   init(); // async 실행
  // }, [model]);

    // 해당 코드 주석 처리 또는 조건문 추가
    useEffect(() => {
    if (!model) return;

    setPage(0);
    setHasMore(true);
    loadReviews(0, true);

    // setLikes(model.model.likeCount);
    setLikes(42);
    setLiked(false); // 처음엔 false로 시작
  }, [model]);


  useEffect(() => {
    if (!selectedModel) return;

    // 강제로 dismiss 후 다시 present
    bottomSheetRef.current?.dismiss();
    setTimeout(() => {
      bottomSheetRef.current?.present();
    }, 100); // 짧은 지연 후 재호출
  }, [selectedModel]);


  useEffect(() => {
    const hideSub = Keyboard.addListener('keyboardDidHide', () => inputRef.current?.blur());
    return () => hideSub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (inputRef.current?.isFocused()) {
          inputRef.current.blur();
          return true;
        }
        if (bottomSheetRef.current) {
          bottomSheetRef.current.dismiss();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }, []),
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCommentImage({ uri: result.assets[0].uri });
    }
  };

  const alertDelete = (reviewId: number) => {
    Alert.alert('리뷰 삭제', '이 리뷰를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          console.log('더미 리뷰 삭제', reviewId);
          setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
          setReviewCount((prev) => prev - 1);
        },
      },
    ]);
  };


  const loadReviews = async (nextPage = 0, reset = false) => {
    if (isFetchingMore || !model || (!hasMore && nextPage !== 0)) return;

    setIsFetchingMore(true);
    try {
      const dummyReviews = [
        {
          reviewId: 1,
          content: '보자마자 미소 지었어요 ㅠㅠ 이런 따뜻한 그림 너무 좋아요',
          createdAt: new Date().toISOString(),
          presignedUrl: null,
          userId: 123,
          userName: '솜솜이',
        },
        {
          reviewId: 2,
          content: '진짜 감정이 살아 있는 느낌… 이게 바로 세포들의 세계인가요?',
          createdAt: new Date().toISOString(),
          presignedUrl: null,
          userId: 456,
          userName: '날아라슈퍼보드',
        },
      ];

      setReviewCount(dummyReviews.length);
      setReviews(reset || nextPage === 0 ? dummyReviews : [...reviews, ...dummyReviews]);
      setPage(nextPage + 1);
      setHasMore(false); // 더미니까 더 불러올 건 없다고 처리
    } catch (err) {
      console.debug('더미 리뷰 로딩 실패:', err);
      setReviews([]);
      setReviewCount(0);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };


  const handleSendComment = async () => {
    if (!comment.trim()) return;
    try {
      // 실제 업로드 생략
      console.log('리뷰 등록 (더미)', comment, commentImage?.uri);

      const newReview: Review = {
        reviewId: Date.now(), // 고유 ID 대체
        content: comment,
        createdAt: new Date().toISOString(),
        presignedUrl: commentImage?.uri ?? null,
        userId: Number(userInfo.userId),
        userName: userInfo.nickname || '픽셀도깨비',
      };

      // 리뷰 목록에 새 댓글 추가
      setReviews((prev) => [...prev, newReview]);
      setReviewCount((prev) => prev + 1);

      // 입력 초기화
      setComment('');
      inputRef.current?.clear?.();
      setCommentImage(null);
    } catch (err) {
      console.debug('리뷰 등록 실패:', err);
      alert('리뷰 등록 중 오류가 발생했습니다.');
    }
  };



  if (!model) return null;

  const localThumbnailUrl =
    model.model.modelName === '유미의 세포들'
      ? RNImage.resolveAssetSource(image11).uri
      : model.thumbnailUrl;

  return (
    <>
      {previewImageUri && (
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => {
            const nextLiked = !liked;
            setLiked(nextLiked);
            setLikes((prev) => prev + (nextLiked ? 1 : -1));
          }}
        >
          {liked ? (
            <ICONS.heart.filled width={24} height={24} />
          ) : (
            <ICONS.heart.outline width={24} height={24} />
          )}
          <Text style={styles.likeText}>{likes}</Text>
        </TouchableOpacity>
      )}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        onDismiss={() => {
          setSelectedModel(null);
          setBottomSheetClosed(true);
        }}
        android_keyboardInputMode="adjustResize"
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{ borderRadius: 20 }}
      >
        <BottomSheetScrollView
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isNearBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            if (isNearBottom && !isFetchingMore && hasMore) loadReviews(page);
          }}
          contentContainerStyle={styles.container}
        >
          {/* 모델 검색창 */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={searchText}
              onChangeText={handleSearch}
              placeholder="모델 검색하기..."
              style={{
                backgroundColor: '#F0F0F0',
                borderRadius: 12,
                paddingHorizontal: 16,
                height: 44,
                fontFamily: 'Freesentation7',
              }}
            />
          </View>

          {/* 검색 결과 리스트 */}
          {searchText.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subTitle}>검색 결과</Text>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.model.modelId}
                  style={{ paddingVertical: 8 }}
                  onPress={() => {
                    setSelectedModel(item);
                    setSearchText('');
                    setSearchResults([]);
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Freesentation6' }}>
                    {item.model.modelName}
                  </Text>
                </TouchableOpacity>
              ))}
              {searchResults.length === 0 && (
                <Text style={{ color: '#888', marginTop: 4 }}>검색 결과가 없습니다.</Text>
              )}
            </View>
          )}


          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{model.model.modelName}</Text>
              <Text style={styles.author}>by {model.userName}</Text>
            </View>
          </View>

          {/* 대표 이미지 */}
          {/* <View style={styles.mainImageWrapper}>
            <TouchableOpacity onPress={() => setPreviewImageUri(model.thumbnailUrl)}>
              <Image source={{ uri: model.thumbnailUrl }} style={styles.mainImage} />
            </TouchableOpacity>
          </View> */}
          {/* 대표 이미지 */}
          <View style={styles.mainImageWrapper}>
            <TouchableOpacity onPress={() => setPreviewImageUri(localThumbnailUrl)}>
              <Image
                source={
                  model.model.modelName === '유미의 세포들'
                    ? image11
                    : { uri: model.thumbnailUrl }
                }
                style={styles.mainImage}
              />
            </TouchableOpacity>
          </View>

          {/* 좋아요 버튼 (설명 아래로 이동) */}
          <View style={styles.likesContainer}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => {
                const nextLiked = !liked;
                setLiked(nextLiked);
                setLikes((prev) => prev + (nextLiked ? 1 : -1));
              }}
            >
              {liked ? (
                <ICONS.heart.filled width={24} height={24} />
              ) : (
                <ICONS.heart.outline width={24} height={24} />
              )}
              <Text style={styles.likeText}>{likes.toLocaleString()}</Text>
            </TouchableOpacity>

            <ICONS.message width={24} height={24} style={{ marginRight: 6 }} />
            <Text style={styles.likeText}>{reviewCount}</Text>
          </View>

          {/* 모델 설명 */}
          <View style={styles.descriptionWrapper}>
            <Text style={styles.descriptionText}>{model.model.description}</Text>
            <Text style={styles.createdAtText}>
              {new Date(model.model.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* 사용 버튼 */}
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              router.push({ pathname: '/convert', params: { modelId: model.model.modelId } });
            }}
          >
            <Text style={styles.useButtonText}>사용해 보기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 리뷰 목록 */}
          <View style={styles.section}>
            <Text style={styles.subTitle}>리뷰 {reviewCount}개</Text>
            {reviews.map((item, index) => (
              <View key={item.reviewId}>
                <Pressable
                  style={styles.reviewRow}
                  onLongPress={() => {
                    if (item.userId !== Number(userInfo.userId)) return;
                    alertDelete(item.reviewId);
                  }}
                >
                  <View style={styles.reviewContent}>
                    <Text style={styles.reviewer}>{item.userName}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {!!item.presignedUrl && (
                    <TouchableOpacity onPress={() => setPreviewImageUri(item.presignedUrl)}>
                      <Image source={{ uri: item.presignedUrl }} style={styles.reviewImage} />
                    </TouchableOpacity>
                  )}
                </Pressable>
                {index !== reviews.length - 1 && <View style={styles.reviewDivider} />}
              </View>
            ))}
          </View>

          {/* 댓글 입력 */}
          {commentImage && (
            <View style={styles.previewContainer}>
              <Image source={commentImage} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setCommentImage(null)}>
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentInputContainer}>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Text
                style={{
                  fontSize: 25,
                  color: '#555',
                  fontFamily: 'Freesentation8',
                  lineHeight: 34,
                }}
              >
                ＋
              </Text>
            </TouchableOpacity>
            <View style={styles.commentBox}>
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder="댓글 작성하기..."
                placeholderTextColor="#999"
                onChangeText={setComment}
              />
            </View>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
              <ICONS.send width={20} height={20} />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  borderRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 10 },
  title: { fontSize: 18, fontFamily: 'Freesentation8' },
  author: { color: '#999', marginTop: -1, fontFamily: 'Freesentation6', marginBottom: 10 },
  mainImageWrapper: { position: 'relative' },
  mainImage: {
    width: '100%',
    height: 280,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  section: { marginBottom: 20 },
  subTitle: { fontFamily: 'Freesentation7', fontSize: 18, marginBottom: 4 },
  useButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    height: 56,
    justifyContent: 'center'
  },
  useButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: -20, marginVertical: 20 },
  reviewRow: { flexDirection: 'row', marginVertical: 12 },
  reviewImage: { width: 60, height: 80, borderRadius: 4, marginRight: 10 },
  reviewer: { fontWeight: 'bold' },
  reviewContent: { flex: 1, justifyContent: 'space-between' },
  commentText: { marginVertical: 1, fontSize: 14, fontFamily: 'Freesentation5' },
  reviewDate: { fontSize: 12, color: '#aaa', marginTop: 4, alignSelf: 'flex-start' },
  reviewDivider: { height: 1, backgroundColor: '#E0E0E0' },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addImageButton: {
    width: 40,
    height: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },
  previewContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    position: 'relative',
    overflow: 'visible',
    backgroundColor: '#fff',
    ...shadowStyle,
  },
  previewImage: { width: 80, height: 80, borderRadius: 12 },
  removeImageBtn: {
    position: 'absolute',
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: { color: '#fff', fontSize: 16, lineHeight: 16 },
  commentBox: { flex: 1, height: 50, ...shadowStyle },
  commentInput: {
    flex: 1,
    height: 50,
    fontFamily: 'Freesentation7',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },
  fullscreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fullscreenImage: { width: '100%', height: '100%' },
  descriptionWrapper: {
    padding: 4,
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 15,
    lineHeight: 19,
    marginBottom: 4,
    fontFamily: 'Freesentation6',
  },

  createdAtText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Freesentation6',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  likeButton: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },

  likeText: {
    fontSize: 16,
    color: '#6E95BE',
    fontFamily: 'Freesentation7',
  },
});
