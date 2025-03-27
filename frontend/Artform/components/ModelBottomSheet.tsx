// components/ModelBottomSheet.tsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Text,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { ImageSourcePropType } from 'react-native';

import ICONS from '~/constants/icons';
import colors from '~/constants/colors';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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

const dummyData: ModelDetail[] = [
  {
    id: '1',
    title: '기억의 지속',
    image: require('~/assets/images/1.png'),
    artist: '살바도르 달리',
    liked: true,
    likes: 42,
    relatedImages: [
      require('~/assets/images/review1.png'),
      require('~/assets/images/review2.png'),
      require('~/assets/images/review3.png'),
      require('~/assets/images/review4.png'),
    ],
    reviews: [
      {
        id: 'r1',
        nickname: '시간여행자',
        comment: '달리의 감성이 그대로 묻어있어요. 멋집니다!',
        date: '2025.03.20',
        image: require('~/assets/images/review1.png'),
      },
      {
        id: 'r2',
        nickname: '이클립스',
        comment: '너무 좋아요!!',
        date: '2025.03.19',
        image: require('~/assets/images/review2.png'),
      },
      {
        id: 'r3',
        nickname: '모네마네미네',
        comment: '화가의 화풍을 적용하니까 사진 퀄리티가 달라졌어요! 감사합니당 ㅎㅎ',
        date: '2025.03.15',
        image: require('~/assets/images/review3.png'),
      },
    ],
  },
  {
    id: '2',
    title: '그랑드자트섬의 일요일 오후',
    image: require('~/assets/images/2.png'),
    artist: '조르주 쇠라',
    liked: false,
    likes: 33,
    relatedImages: [require('~/assets/images/review1.png'), require('~/assets/images/review2.png')],
    reviews: [
      {
        id: 'r2',
        nickname: '이클릴스',
        comment: '너무 좋아요!',
        date: '2025.03.19',
        image: require('~/assets/images/review1.png'),
      },
      {
        id: 'r3',
        nickname: '모네미네미네',
        comment: '화풍을 적용하니 사진이 다르게 느껴져요!',
        date: '2025.03.19',
        image: require('~/assets/images/review2.png'),
      },
    ],
  },
  {
    id: '3',
    title: '물랭 드 라 갈레트의 무도회',
    image: require('~/assets/images/3.png'),
    artist: '르누아르',
    liked: true,
    likes: 18,
    relatedImages: [],
    reviews: [],
  },
  {
    id: '4',
    title: '절규',
    image: require('~/assets/images/4.png'),
    artist: '에드바르 뭉크',
    liked: false,
    likes: 25,
    relatedImages: [],
    reviews: [],
  },
  {
    id: '5',
    title: '파리 거리, 비오는 날',
    image: require('~/assets/images/5.png'),
    artist: '귀스타브 카유보트',
    liked: false,
    likes: 12,
    relatedImages: [],
    reviews: [],
  },
  {
    id: '6',
    title: '우산 든 여인',
    image: require('~/assets/images/6.png'),
    artist: '클로드 모네',
    liked: true,
    likes: 58,
    relatedImages: [require('~/assets/images/review3.png'), require('~/assets/images/review2.png')],
    reviews: [
      {
        id: 'r4',
        nickname: '비오는날',
        comment: '이 느낌 너무 좋아요 ☔️',
        date: '2025.03.18',
        image: require('~/assets/images/review4.png'),
      },
    ],
  },
];

export type Model = {
  id: string;
  title: string;
  image: ImageSourcePropType;
};

type Review = {
  id: string;
  nickname: string;
  comment: string;
  date: string;
  image: ImageSourcePropType;
};

type ModelDetail = Model & {
  artist: string;
  liked: boolean;
  likes: number;
  relatedImages: ImageSourcePropType[];
  reviews: Review[];
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

  const innerRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => innerRef.current!);

  useEffect(() => {
    if (selected) {
      const model = dummyData.find((m) => m.id === selected.id);
      if (model) {
        setLiked(model.liked);
        setLikes(model.likes);
      }
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
  const model = dummyData.find((model) => model.id === selected.id);
  if (!model) return null;

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
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        {/* 제목 & 작가 & 좋아요 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{model.title}</Text>
            <Text style={styles.author}>by 부리</Text>
          </View>
        </View>

        {/* 대표 이미지 & 좋아요 버튼 */}
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

        <Pressable style={styles.useButton}>
          <Text style={styles.useButtonText}>사용해 보기</Text>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.subTitle}>리뷰 {model.reviews.length}개</Text>
          {model.reviews.map((review, index) => (
            <View key={review.id}>
              <View style={styles.reviewRow}>
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewer}>{review.nickname}</Text>
                  <Text style={styles.commentText}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Image source={review.image} style={styles.reviewImage} />
              </View>
              {index !== model.reviews.length - 1 && <View style={styles.reviewDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.commentInputContainer}>
          <TouchableOpacity style={styles.addImageButton}>
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
              // 여기서 댓글 전송 로직 처리 (예: API 호출)
              console.log('댓글 전송:', comment);
              setComment('');
            }}
          >
            <ICONS.send width={20} height={20} />
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
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
