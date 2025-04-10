// services/imageService.ts
import modelApi from '~/lib/api/model';
import type { PresignedImageResponse } from '~/types/image';

export const fetchPresignedImageUrl = async (imageId: number): Promise<string | null> => {
  if (!imageId) return null;

  try {
    const res = await modelApi.get<{ data: PresignedImageResponse }>(
      `/image/${imageId}/presigned-url`,
    );
    return res.data.data.presignedUrl;
  } catch (err) {
    console.warn(`presigned-url 요청 실패: 이미지 ID ${imageId}`, err);
    return null;
  }
};
