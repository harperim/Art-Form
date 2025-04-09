// services/modelService.ts
import modelApi from '~/lib/api/model';
import type { Model, MyLikeModel } from '~/types/model';

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
export const fetchHotModels = async (page: number = 0): Promise<Model[]> => {
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
export const fetchRecentModels = async (page: number = 0): Promise<Model[]> => {
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
export const fetchMyModels = async (page: number = 0): Promise<Model[]> => {
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

// 내가 좋아요한 모델 조회
export const fetchMyLikeModel = async (page: number = 0): Promise<MyLikeModel[]> => {
  try {
    const res = await modelApi.get('/model/like', {
      params: { page },
    });

    return res.data.data as MyLikeModel[];
  } catch (err) {
    console.error('좋아요한 모델 조회 실패:', err);
    throw new Error('좋아요한한 모델을 불러오지 못했습니다.');
  }
};

// 모델 상세 조회
export const fetchModelInfo = async (modelId: number): Promise<Model> => {
  const res = await modelApi.get(`/model/${modelId}/metadata`);
  return res.data.data;
};

// 좋아요 클릭
export const likeModel = async (modelId: number): Promise<boolean> => {
  try {
    const res = await modelApi.post(`/model/like/${modelId}`);
    return res.data.data;
  } catch (err) {
    console.error(`모델 좋아요 실패 (modelId: ${modelId}):`, err);
    throw new Error('모델에 좋아요를 누를 수 없습니다.');
  }
};

// 모델 좋아요 여부 확인
export const fetchModelLikeStatus = async (modelId: number): Promise<boolean> => {
  try {
    const res = await modelApi.get(`/model/like/${modelId}`);
    return res.data.data === true;
  } catch (err) {
    console.error(`좋아요 여부 확인 실패 (modelId: ${modelId}):`, err);
    throw new Error('모델 좋아요 여부를 확인할 수 없습니다.');
  }
};
