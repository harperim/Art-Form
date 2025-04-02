// app/(app)/model.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICONS } from '~/constants/icons';
import colors from '~/constants/colors';
import { mockModels } from '~/constants/mockModels';
import ModelCarousel from '~/components/ModelCarousel';

export default function ModelScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 상단 제목 + 아이콘 */}
        <View style={styles.header}>
          <Text style={styles.title}>최근에 사용한 모델</Text>
          <TouchableOpacity>
            <ICONS.grid width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* 모델 캐러셀 */}
        <ModelCarousel
          data={mockModels.map((model) => ({
            id: model.id,
            image: model.image,
            title: model.title,
            artist: model.artist,
          }))}
        />

        {/* 설명 텍스트 */}
        <Text style={styles.description}>나만의 모델을 만들어 보세요</Text>
      </ScrollView>

      {/* 새로 학습하기 버튼: 절대 위치로 네비게이션 위에 고정 */}
      <TouchableOpacity style={styles.learnButton}>
        <ICONS.plus width={18} height={18} />
        <Text style={styles.learnButtonText}>새로 학습하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', // 자식 요소의 절대 위치 기준
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // 버튼 높이 + 여유 공간 추가
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    color: '#6283A6',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  learnButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 80,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  learnButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
