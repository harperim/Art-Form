// app/(app)/mypage.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/auth-context';
import { useState, useMemo } from 'react';
import Animated from 'react-native-reanimated';

export default function MyPageScreen() {
  type MyContentFilter = '내가 만든 그림' | '내가 만든 모델' | '내가 좋아요한 모델';
  const [selectedTab, setSeletedTab] = useState<MyContentFilter>('내가 만든 그림');
  const content = useMemo(() => {
    switch (selectedTab) {
      case '내가 만든 그림':
        return <Text>1</Text>;
      case '내가 만든 모델':
        return <Text>2</Text>;
      case '내가 좋아요한 모델':
        return <Text>3</Text>;
    }
  });

  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const data = {
    profileImage: require('~/assets/images/review2.png'),
    username: '부리부리',
    eamil: 'ssafy@naver.com',
    follower: 0,
    following: 1,
  };

  return (
    <View style={styles.container}>
      {/* 유저 프로필 */}
      <View style={styles.userProfile}>
        <Image source={data.profileImage} style={styles.userProfileImage} />
        <View style={styles.userProfileInfo}>
          <Text style={styles.userName}>{data.username} 님</Text>
          <Text style={styles.userEmail}>{data.eamil}</Text>
          <View style={styles.userFollowInfo}>
            <Text style={styles.userFollowTextStyle}>following {data.following}</Text>
            <Text style={styles.userFollowTextStyle}>follower {data.follower}</Text>
          </View>
        </View>
      </View>
      {/* 메인 컨텐츠츠 */}
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
      <View style={styles.mainContent}>
        <Text style={styles.mainContentTitle}>전체 그림 3개</Text>
        <Animated.ScrollView style={{ display: 'flex' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text>ff</Text>
          </View>
        </Animated.ScrollView>
      </View>

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
    fontFamily: 'Freesentation7',
    fontSize: 20,
    color: '#5C89B2',
  },
  // 옮길거
  mainContent: {
    paddingTop: 30,
  },
  mainContentTitle: {
    fontFamily: 'Freesentation8',
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
