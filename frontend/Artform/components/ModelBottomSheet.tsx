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
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { ICONS } from '~/constants/icons';
import colors from '~/constants/colors';
import { useModel } from '~/context/ModelContext';
import { useAuth } from '~/lib/auth-context';

import { getImageUploadUrl, postImageMetadata } from '~/services/imageService';
import { deleteModelReview, fetchModelReviews, postModelReview } from '~/services/reviewService';
import { uploadToS3, getFileTypeFromUri } from '~/utils/uploadImageToS3';
import type { ModelWithThumbnail } from '~/types/model';
import type { Review } from '~/types/review';
import { fetchModelLikeStatus, likeModel } from '~/services/modelService';

export default function ModelBottomSheet() {
  const snapPoints = useMemo(() => ['85%'], []);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
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

  useEffect(() => {
    const init = async () => {
      if (!model) return;

      setPage(0);
      setHasMore(true);
      loadReviews(0, true);
      setLikes(model.model.likeCount);

      try {
        const liked = await fetchModelLikeStatus(model.model.modelId);
        setLiked(liked);
      } catch (err) {
        console.warn('좋아요 여부 불러오기 실패:', err);
        setLiked(false);
      }
    };

    init(); // async 실행
  }, [model]);

  useEffect(() => {
    if (!selectedModel) return;

    let cancelled = false;

    const refreshIfNeeded = async () => {
      const updatedModel = await refreshSelectedModel();

      if (!cancelled && updatedModel) {
        bottomSheetRef.current?.present();
      }
    };

    refreshIfNeeded();

    return () => {
      cancelled = true;
    };
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
          bottomSheetRef.current.close();
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
        onPress: async () => {
          try {
            await deleteModelReview(reviewId);
            setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
          } catch (err) {
            console.warn('리뷰 삭제 실패:', err);
            alert('리뷰 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const loadReviews = async (nextPage = 0, reset = false) => {
    if (isFetchingMore || !model || (!hasMore && nextPage !== 0)) return;

    setIsFetchingMore(true);
    try {
      const { data, reviewCount } = await fetchModelReviews(model.model.modelId, nextPage);

      setReviewCount(reviewCount);

      setReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r.reviewId));
        const filtered = data.filter((r) => !existingIds.has(r.reviewId));
        return reset || nextPage === 0 ? data : [...prev, ...filtered];
      });

      setPage(nextPage + 1);
      setHasMore((nextPage + 1) * data.length < reviewCount); // 페이지당 개수로 남은 여부 계산
    } catch (err) {
      console.debug('리뷰 불러오기 실패:', err);

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
      let uploadFileName: string | undefined;
      if (commentImage) {
        const fileUri = commentImage.uri;
        const fileName = fileUri.split('/').pop()!;
        const fileType = getFileTypeFromUri(fileUri);

        const { presignedUrl, uploadFileName: fileKey } = await getImageUploadUrl(
          fileName,
          fileType,
          'review',
        );
        await uploadToS3(presignedUrl, fileUri, fileType);
        uploadFileName = fileKey;

        await postImageMetadata({
          modelId: model.model.modelId,
          userId: model.model.userId,
          uploadFileName,
          public: true,
        });
      }

      await postModelReview(model.model.modelId, comment, uploadFileName);

      setComment('');
      inputRef.current?.clear?.();
      setCommentImage(null);
      loadReviews(0, true);
    } catch (err) {
      console.debug('리뷰 등록 실패:', err);
      alert('리뷰 등록 중 오류가 발생했습니다.');
    }
  };

  if (!model) return null;

  return (
    <>
      {previewImageUri && (
        <TouchableOpacity
          style={styles.fullscreenModal}
          onPress={() => setPreviewImageUri(null)}
          activeOpacity={1}
        >
          <Image
            source={{ uri: previewImageUri }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
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
          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{model.model.modelName}</Text>
              <Text style={styles.author}>by {model.userName}</Text>
            </View>
          </View>

          {/* 대표 이미지 */}
          <View style={styles.mainImageWrapper}>
            <TouchableOpacity onPress={() => setPreviewImageUri(model.thumbnailUrl)}>
              <Image source={{ uri: model.thumbnailUrl }} style={styles.mainImage} />
            </TouchableOpacity>
          </View>

          {/* 좋아요 버튼 (설명 아래로 이동) */}
          <View style={styles.likesContainer}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={async () => {
                try {
                  const isLiked = await likeModel(model.model.modelId);
                  setLiked(isLiked);
                  setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
                } catch (err) {
                  console.warn('좋아요 처리 실패:', err);
                  setLiked((prev) => !prev);
                  setLikes((prev) => (liked ? prev + 1 : prev - 1));
                }
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
              >＋</Text>
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
  commentBox: { flex: 1, height: 50, borderRadius: 8, ...shadowStyle },
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
    borderRadius: 12,
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
