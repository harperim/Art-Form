// components/ModelBottomSheet.tsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Text,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  TextInput,
  BackHandler,
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';

import { ICONS } from '~/constants/icons';
import colors from '~/constants/colors';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { mockModels } from '~/constants/mockModels';
import type { Model, Review } from '~/types/model';

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,

  elevation: 2,
};

type Props = {
  selected: Model | null;
  onDismiss: () => void;
};

const ModelBottomSheet = forwardRef<BottomSheetModal, Props>(({ selected, onDismiss }, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');

  const [commentImage, setCommentImage] = useState<ImageSourcePropType | null>(null);
  const [visibleReviews, setVisibleReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 2;

  const innerRef = useRef<BottomSheetModal>(null);
  const router = useRouter();

  useImperativeHandle(ref, () => innerRef.current!);

  useEffect(() => {
    if (!selected) return;
    const found = mockModels.find((m) => m.id === selected.id);
    if (found) {
      setLiked(found.liked);
      setLikes(found.likes);
    }
  }, [selected]);

  // Lazy Load 리뷰 함수
  useEffect(() => {
    if (model) {
      const start = 0;
      const end = REVIEWS_PER_PAGE;
      setVisibleReviews(model.reviews.slice(start, end));
    }
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (innerRef.current) {
          innerRef.current.close(); // 바텀시트를 닫음
          return true; // 뒤로가기 이벤트 소비
        }
        return false;
      });

      return () => backHandler.remove();
    }, []),
  );

  if (!selected) return null;
  const model = mockModels.find((model) => model.id === selected.id);
  if (!model) return null;

  const loadMoreReviews = () => {
    if (!model) return;
    const nextPage = reviewPage + 1;
    const newReviews = model.reviews.slice(0, nextPage * REVIEWS_PER_PAGE);
    if (newReviews.length > visibleReviews.length) {
      setVisibleReviews(newReviews);
      setReviewPage(nextPage);
    }
  };

  // 이미지 선택 함수
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCommentImage({ uri: result.assets[0].uri });
    }
  };

  return (
    <BottomSheetModal
      ref={innerRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      backgroundStyle={{ borderRadius: 20 }}
    >
      <BottomSheetFlatList
        contentContainerStyle={styles.container}
        data={visibleReviews}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreReviews}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <View>
            <View style={styles.reviewRow}>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewer}>{item.nickname}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
                <Text style={styles.reviewDate}>{item.date}</Text>
              </View>
              <Image source={item.image} style={styles.reviewImage} />
            </View>
            {index !== visibleReviews.length - 1 && <View style={styles.reviewDivider} />}
          </View>
        )}
        ListHeaderComponent={
          <View>
            {/* 제목 & 작가 & 좋아요 */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{model.title}</Text>
                <Text style={styles.author}>by 부리</Text>
              </View>
            </View>

            {/* 대표 이미지 */}
            <View style={styles.mainImageWrapper}>
              <Image source={model.image} style={styles.mainImage} />
              <Pressable
                style={styles.heartButton}
                onPress={() => {
                  setLiked((prev) => !prev);
                  setLikes((prev) => (liked ? prev - 1 : prev + 1));
                }}
              >
                {liked ? (
                  <ICONS.heart.filled width={24} height={24} />
                ) : (
                  <ICONS.heart.outline width={24} height={24} />
                )}
                <Text style={{ marginLeft: 4 }}>{likes}</Text>
              </Pressable>
            </View>

            {/* 관련 이미지 */}
            <View style={styles.section}>
              <Text style={styles.subTitle}>이 모델로 만든 이미지</Text>
              <FlatList
                horizontal
                data={model.relatedImages}
                keyExtractor={(_, index) => `image-${index}`}
                renderItem={({ item }) => <Image source={item} style={styles.thumbImage} />}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* 사용 버튼 */}
            <Pressable
              style={styles.useButton}
              onPress={() => {
                if (!model.image) return;

                router.push({
                  pathname: '/convert',
                  params: {
                    modelId: model.id,
                  },
                });
              }}
            >
              <Text style={styles.useButtonText}>사용해 보기</Text>
            </Pressable>

            <View style={styles.divider} />

            {/* 리뷰 타이틀 */}
            <View style={styles.section}>
              <Text style={styles.subTitle}>리뷰 {model.reviews.length}개</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            {/* 선택된 이미지 미리보기 */}
            {commentImage && (
              <View style={styles.previewContainer}>
                <Image source={commentImage} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setCommentImage(null)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 댓글 입력창 */}
            <View style={styles.commentInputContainer}>
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Text style={{ fontSize: 22, color: '#555' }}>＋</Text>
              </TouchableOpacity>

              <View style={styles.commentBox}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="댓글 작성하기..."
                  placeholderTextColor="#999"
                  value={comment}
                  onChangeText={setComment}
                />
              </View>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  if (!comment.trim()) return;
                  console.log('댓글 전송:', comment, commentImage);
                  setComment('');
                  setCommentImage(null);
                }}
              >
                <ICONS.send width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </BottomSheetModal>
  );
});

export default ModelBottomSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  author: {
    color: '#999',
    marginTop: 4,
    marginLeft: 2,
  },
  mainImageWrapper: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  section: {
    marginBottom: 20,
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  useButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 10,
    backgroundColor: '#E0E0E0',
    marginHorizontal: -20,
    marginVertical: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  reviewImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  reviewer: {
    fontWeight: 'bold',
  },
  reviewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  commentText: {
    marginVertical: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addImageButton: {
    width: 40,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },
  previewContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: '#fff',
    ...shadowStyle,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 16,
  },
  commentBox: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    ...shadowStyle,
  },
  commentInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 14,
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
});
