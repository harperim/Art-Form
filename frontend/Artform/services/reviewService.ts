import modelApi from '~/lib/api/model';
import type { Review } from '~/types/review';

export const fetchModelReviews = async (modelId: number): Promise<Review[]> => {
  const res = await modelApi.get(`/model/review/${modelId}`);
  return res.data.data;
};

export const postModelReview = async (
  modelId: number,
  content: string,
  uploadFileName?: string,
) => {
  try {
    const res = await modelApi.post(`/model/review/${modelId}`, {
      content,
      uploadFileName,
    });

    return res.data;
  } catch (err) {
    console.error('리뷰 등록 실패:', err);
    throw new Error('리뷰 등록 중 문제가 발생했습니다.');
  }
};
