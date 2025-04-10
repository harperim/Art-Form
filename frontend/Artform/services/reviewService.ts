// services/reviewService.ts
import modelApi from '~/lib/api/model';
import type { Reviews } from '~/types/review';

// 해당 모델의 리뷰 조회
export const fetchModelReviews = async (modelId: number, page: number = 0): Promise<Reviews> => {
  const res = await modelApi.get(`/model/review/${modelId}`, {
    params: { page },
  });
  return {
    data: res.data.data,
    reviewCount: res.data.reviewCount,
  };
};

// 리뷰 등록
export const postModelReview = async (
  modelId: number,
  content: string,
  uploadFileName?: string,
) => {
  try {
    console.log('리뷰 등록:', modelId, content);
    console.log('uploadFileName:', uploadFileName);

    const res = await modelApi.post(`/model/review/${modelId}`, {
      content,
      uploadFileName,
    });

    return res.data;
  } catch (err) {
    console.debug('리뷰 등록 실패:', err);
    throw new Error('리뷰 등록 중 문제가 발생했습니다.');
  }
};

// 리뷰 삭제
export const deleteModelReview = async (reviewId: number) => {
  await modelApi.delete(`/model/review/${reviewId}`);
};
