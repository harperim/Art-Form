// app/(app)/mypage.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/auth-context';
import { useState, useMemo } from 'react';
import MyPageItemList from '~/components/MypageItemList';
import type { Model } from '~/types/model';

export default function MyPageScreen() {
  type MyContentFilter = '내가 만든 그림' | '내가 만든 모델' | '내가 좋아요한 모델';
  const [selectedTab, setSeletedTab] = useState<MyContentFilter>('내가 만든 그림');

  // const mainContentItem = () => (
  //   <View style={styles.mainContentView}>
  //     <Text style={styles.mainContentTitle}>{mainContentData.length}개</Text>
  //     <View style={styles.mainContentItem}>
  //       <FlatList
  //         data={mainContentData}
  //         numColumns={2}
  //         keyExtractor={(item) => item.id}
  //         columnWrapperStyle={{ gap: 12 }}
  //         contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
  //         renderItem={renderGridItem}
  //       />
  //     </View>
  //   </View>
  // );

  const mainContentData = [
    {
      id: '1',
      title: '기억의 지속',
      image: require('~/assets/images/splash1.png'),
      artist: '살바도르 달리',
      liked: true,
      likes: 42,
    },
    {
      id: '2',
      title: '그랑드자트섬의 일요일 오후',
      image: require('~/assets/images/splash3.png'),
      artist: '조르주 쇠라',
      liked: false,
      likes: 33,
    },
    {
      id: '3',
      title: '물랭 드 라 갈레트의 무도회',
      image: require('~/assets/images/splash4.png'),
      artist: '르누아르',
      liked: true,
      likes: 18,
      relatedImages: [],
    },
    {
      id: '4',
      title: '절규',
      image: require('~/assets/images/splash1.png'),
      artist: '에드바르 뭉크',
      liked: false,
      likes: 25,
    },
    {
      id: '5',
      title: '파리 거리, 비오는 날',
      image: require('~/assets/images/splash2.png'),
      artist: '귀스타브 카유보트',
      liked: false,
      likes: 12,
    },
    {
      id: '6',
      title: '우산 든 여인',
      image: require('~/assets/images/splash1.png'),
      artist: '클로드 모네',
      liked: true,
      likes: 58,
    },
  ];

  const seleteContentSection = useMemo(() => {
    switch (selectedTab) {
      case '내가 만든 그림':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {mainContentData.length - 1}개</Text>
            <MyPageItemList />
          </View>
        );
      case '내가 만든 모델':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {mainContentData.length + 1}개</Text>
            <MyPageItemList item={mainContentData} disableAnimation={null} />
          </View>
        );
      case '내가 좋아요한 모델':
        return (
          <View style={styles.mainContentView}>
            <Text style={styles.mainContentTitle}>총 {mainContentData.length}개</Text>
            <MyPageItemList />
          </View>
        );

      default:
        return <Text>1</Text>;
    }
  }, [selectedTab]);

  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const userProfileData = {
    profileImage: require('~/assets/images/review2.png'),
    username: '부리부리',
    eamil: 'ssafy@naver.com',
    follower: 0,
    following: 1,
  };

  const handleCardPress = (item: Model) => {
    // setSelectedModel(item);
    undefined;
  };

  return (
    <View style={styles.container}>
      {/* 유저 프로필 */}
      <View style={styles.userProfile}>
        <Image source={userProfileData.profileImage} style={styles.userProfileImage} />
        <View style={styles.userProfileInfo}>
          <Text style={styles.userName}>{userProfileData.username} 님</Text>
          <Text style={styles.userEmail}>{userProfileData.eamil}</Text>
          <View style={styles.userFollowInfo}>
            <Text style={styles.userFollowTextStyle}>following {userProfileData.following}</Text>
            <Text style={styles.userFollowTextStyle}>follower {userProfileData.follower}</Text>
          </View>
        </View>
      </View>
      {/* 메인 컨텐츠 */}
      <View>
        <View style={styles.contentSelector}>
          <TouchableOpacity
            style={styles.seletorContainner}
            onPress={() => setSeletedTab('내가 만든 그림')}
          >
            <Text
              style={[styles.unselectedTab, selectedTab === '내가 만든 그림' && styles.selectedTab]}
            >
              내가 만든 그림
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.seletorContainner}
            onPress={() => setSeletedTab('내가 만든 모델')}
          >
            <Text
              style={[styles.unselectedTab, selectedTab === '내가 만든 모델' && styles.selectedTab]}
            >
              내가 만든 모델
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.seletorContainner}
            onPress={() => setSeletedTab('내가 좋아요한 모델')}
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
      {seleteContentSection}
      {/* <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#F5F3EF',
  },

  userProfile: {
    marginTop: 80,
    flexDirection: 'row',
  },
  userProfileInfo: {
    marginTop: 20,
    marginLeft: 24,
  },
  userProfileImage: {
    width: 122,
    height: 122,
    borderRadius: 100,
  },
  userName: {
    fontSize: 20,
    color: '#2C2D26',
    fontFamily: 'Freesentation7',
  },
  userEmail: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: 'Freesentation4',
    color: '#CBB7AF',
  },
  userFollowInfo: {
    marginTop: 12,
    flexDirection: 'row',
  },
  userFollowTextStyle: {
    fontFamily: 'Freesentation7',
    color: '#2C2D26',
    marginRight: 16,
    fontSize: 16,
  },
  contentSelector: {
    width: '100%',
    marginTop: 28,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#F2D7D0',
    display: 'flex',
  },
  seletorContainner: {
    flex: 1,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedTab: {
    fontFamily: 'Freesentation5',
    fontSize: 20,
    color: '#F2D7D0',
  },
  selectedTab: {
    fontFamily: 'Freesentation6',
    fontSize: 20,
    color: '#5C89B2',
  },
  mainContentView: {
    paddingTop: 30,
    paddingBottom: 350,
  },
  mainContentTitle: {
    fontFamily: 'Freesentation7',
    fontSize: 20,
    color: '#2C2D26',
  },

  button: {
    backgroundColor: '#4A73E8',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
