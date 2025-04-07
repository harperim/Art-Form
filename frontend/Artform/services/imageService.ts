// services/imageService.ts
import modelApi from '~/lib/api/model';
import type { PresignedImageResponse } from '~/types/image';

// 개별 이미지 다운로드 presigned URL 요청
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

// 이미지 업로드 presigned URL 요청
export const getImageUploadUrl = async (fileName: string, fileType: string, service: string) => {
  const res = await modelApi.get('/image/presigned-url', {
    params: {
      fileName,
      fileType,
      service,
    },
  });

  return res.data.data as { presignedUrl: string; uploadFileName: string };
};

// 이미지 메타데이터 업로드
export const postImageMetadata = async (params: {
  modelId: number;
  userId: number;
  uploadFileName: string;
  public: boolean;
}) => {
  try {
    const res = await modelApi.post('/image/metadata', params);
    return res.data.data; // 성공 시 imageId와 model 정보 포함
  } catch (err) {
    console.error('이미지 메타데이터 업로드 실패:', err);
    throw err;
  }
};
