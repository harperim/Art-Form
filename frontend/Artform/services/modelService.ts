// services/modelService.ts
import modelApi from '~/lib/api/model';
import type { Model } from '~/types/model';

// 오늘의 추천 (랜덤) 모델 조회
export const fetchRandomModels = async (count: number = 5): Promise<Model[]> => {
  try {
    const res = await modelApi.get('/model/random', {
      params: { count },
    });

    return res.data.data as Model[];
  } catch (err) {
    console.debug('랜덤 모델 조회 실패:', err);
    throw new Error('오늘의 추천 모델을 불러오지 못했습니다.');
  }
};

// 인기 모델 조회
export const fetchHotModels = async (page: number = 1): Promise<Model[]> => {
  try {
    const res = await modelApi.get('/model/hot', {
      params: { page },
    });

    return res.data.data as Model[];
  } catch (err) {
    console.debug('인기 모델 조회 실패:', err);
    throw new Error('인기 모델을 불러오지 못했습니다.');
  }
};

// 최신 모델 조회
export const fetchRecentModels = async (page: number = 1): Promise<Model[]> => {
  try {
    const res = await modelApi.get('/model/recent', {
      params: { page },
    });

    return res.data.data as Model[];
  } catch (err) {
    console.debug('최신 모델 조회 실패:', err);
    throw new Error('최신 모델을 불러오지 못했습니다.');
  }
};

// 내가 만든 모델 조회
export const fetchMyModels = async (page: number = 1): Promise<Model[]> => {
  try {
    const res = await modelApi.get('/model/my-model', {
      params: { page },
    });
    return res.data.data as Model[];
  } catch (err) {
    console.error('내 모델 조회 실패:', err);
    throw new Error('내 모델을 불러오지 못했습니다.');
  }
};

export const fetchMyLikeModel = async (page: number = 1): Promise<Model[]> => {
  try {
    const res = await modelApi.get('/model/like', {
      params: { page },
    });
    return res.data.data as Model[];
  } catch (err) {
    console.error('좋아요한 모델 조회 실패:', err);
    throw new Error('좋아요한한 모델을 불러오지 못했습니다.');
  }
};
