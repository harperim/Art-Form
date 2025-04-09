// app/(app)/mypage.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '~/lib/auth-context';
import { FlatList } from 'react-native-gesture-handler';

import MyPageItemList from '~/components/MypageItemList';
import { fetchPresignedImageUrl, getValidUrl } from '~/services/imageService';
import { fetchMyModels, fetchMyLikeModel } from '~/services/modelService';
import { ICONS } from '~/constants/icons';

import type { MyModelItem } from '~/types/model';

export default function MyPageScreen() {
  type MyContentFilter = '내가 만든 그림' | '내가 만든 모델' | '내가 좋아요한 모델';
  type ImageItem = {
    id: number; // imageId
    url: string; // presignedUrl
  };

  const { userInfo } = useAuth();
  const [selectedTab, setSelectedTab] = useState<MyContentFilter>('내가 만든 그림');
  const [imageUrls, setImageUrls] = useState<ImageItem[]>([]);
  const [myModels, setMyModels] = useState<MyModelItem[]>([]); // 내가 만든 모델
  const [myLikeModels, setMyLikeModels] = useState<MyModelItem[]>([]); // 내가 만든 모델
  const [, setLoading] = useState(true);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  // 내 사진 불러오기
  const loadImages = async () => {
    const maxId = 10;
    const newItems: ImageItem[] = [];

    for (let i = 1; i <= maxId; i++) {
      const url = await fetchPresignedImageUrl(i);
      if (url) {
        newItems.push({ id: i, url });
      } else {
        break;
      }
    }
    setImageUrls(newItems);
    setLoading(false); // ✅ 데이터 로딩 완료
  };

  // 내 모델 불러오기
  const loadMyModels = async () => {
    const rawItems = await fetchMyModels();
    const newModelInfo: MyModelItem[] = [];
    for (const item of rawItems) {
      const modelId = item.model.modelId;
      const userName = item.userName;
      const thumbnailId = item.model.thumbnailId;
      const modelName = item.model.modelName;
      const url = await fetchPresignedImageUrl(thumbnailId);
      if (!url) {
        continue;
      }
      newModelInfo.push({
        modelId,
        userName,
        modelName,
        url,
      });
    }
    setMyModels(newModelInfo); // ✅ 상태에 저장
  };

  const LoadMyLikeModel = async () => {
    const myLikeModeList = await fetchMyLikeModel();
    const newMyLikeModel: MyModelItem[] = [];
    for (const MyLikeModel of myLikeModeList) {
      const formattedModel: MyModelItem = {
        modelId: Number(MyLikeModel.modelId),
        userName: `user-${MyLikeModel.userId}`, // 임시 처리. 실제 닉네임 있으면 교체
        modelName: MyLikeModel.modelName,
        url: MyLikeModel.imageSrc,
      };
      newMyLikeModel.push(formattedModel);
    }
    setMyLikeModels(newMyLikeModel);
  };

  useEffect(() => {
    loadImages();
    loadMyModels();
    LoadMyLikeModel();
  }, []);

  const renderItem = ({ item, index }: { item: ImageItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <TouchableOpacity onPress={() => setPreviewImageUri(item.url)}>
        <Image
          source={{ uri: item.url }}
          style={{
            flex: 1,
            width: itemSize,
            height: itemSize,
            resizeMode: 'cover',
            borderRadius: 4,
            borderWidth: 0.5,
            borderColor: '#6E95BE',
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const screenWidth = Dimensions.get('window').width;
  const itemSpacing = 12;
  const numColumns = 3;
  const itemSize = (screenWidth - itemSpacing * (numColumns + 1)) / numColumns;

  const content = useMemo(() => {
    switch (selectedTab) {
      case '내가 만든 그림':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {imageUrls.length}개</Text>
            <FlatList
              data={imageUrls}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              columnWrapperStyle={{ gap: 4, marginBottom: 4 }}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 20, display: 'flex', width: '100%' }}
            />
          </View>
        );
      case '내가 만든 모델':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {myModels.length}개</Text>
            <MyPageItemList item={myModels} disableAnimation={null} />
          </View>
        );
      case '내가 좋아요한 모델':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {myLikeModels.length}개</Text>
            <MyPageItemList item={myLikeModels} disableAnimation={null} />
          </View>
        );

      default:
        return <Text>1</Text>;
    }
  }, [selectedTab, imageUrls, myModels]);

  const router = useRouter();

  return (
    <View style={styles.container}>
      {previewImageUri && (
        <TouchableOpacity
          style={styles.fullscreenModal}
          onPress={() => setPreviewImageUri(null)}
          activeOpacity={1}
        >
          <Image
            source={{ uri: getValidUrl(previewImageUri) }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {/* 유저 프로필 */}
      <View style={styles.menuIconWrapper}>
        <TouchableOpacity onPress={() => router.push('/setting')}>
          <ICONS.Menu width={32} height={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.userProfile}>
        <Image source={require('~/assets/images/review2.png')} style={styles.userProfileImage} />
        <View style={styles.userProfileInfo}>
          <Text style={styles.userName}>{userInfo.nickname} 님</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <View style={styles.userFollowInfo}>
            <Text style={styles.userFollowTextStyle}>following 80</Text>
            <Text style={styles.userFollowTextStyle}>follower 100+</Text>
          </View>
        </View>
      </View>
      {/* 메인 컨텐츠 */}
      <View>
        <View style={styles.contentSelector}>
          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => setSelectedTab('내가 만든 그림')}
          >
            <Text
              style={[styles.unselectedTab, selectedTab === '내가 만든 그림' && styles.selectedTab]}
            >
              내가 만든 그림
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => setSelectedTab('내가 만든 모델')}
          >
            <Text
              style={[styles.unselectedTab, selectedTab === '내가 만든 모델' && styles.selectedTab]}
            >
              내가 만든 모델
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => setSelectedTab('내가 좋아요한 모델')}
          >
            <Text
              style={[
                styles.unselectedTab,
                selectedTab === '내가 좋아요한 모델' && styles.selectedTab,
              ]}
            >
              좋아요한 모델
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
  },
  menuIconWrapper: {
    position: 'absolute',
    top: 40, // SafeArea 고려
    right: 20,
    zIndex: 10, // 프로필보다 위에 표시
  },
  userProfile: {
    marginTop: 80,
    flexDirection: 'row',
  },
  userProfileInfo: {
    marginTop: 18,
    marginLeft: 24,
  },
  userProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  userName: {
    fontSize: 16,
    color: '#2C2D26',
    fontFamily: 'Freesentation7',
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Freesentation4',
    color: '#CBB7AF',
  },
  userFollowInfo: {
    marginTop: 8,
    flexDirection: 'row',
  },
  userFollowTextStyle: {
    fontFamily: 'Freesentation8',
    color: '#2C2D26',
    marginRight: 10,
    fontSize: 14,
  },
  contentSelector: {
    width: '100%',
    marginTop: 12,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#F2D7D0',
    display: 'flex',
  },
  selectorContainer: {
    flex: 1,
    width: '100%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedTab: {
    fontFamily: 'Freesentation5',
    fontSize: 16,
    color: '#F2D7D0',
  },
  selectedTab: {
    fontFamily: 'Freesentation6',
    fontSize: 16,
    color: '#5C89B2',
  },
  mainContentView: {
    paddingTop: 20,
    paddingBottom: 350,
  },
  mainContentTitle: {
    fontFamily: 'Freesentation7',
    fontSize: 18,
    color: '#2C2D26',
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
});
