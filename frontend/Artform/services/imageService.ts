// services/imageService.ts
import modelApi from '~/lib/api/model';
import type { PresignedImageResponse } from '~/types/image';
import { Image } from 'react-native';

export const getValidUrl = (url: string | null | undefined): string => {
  const fallback = Image.resolveAssetSource(require('~/assets/logo.png')).uri;
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return fallback;
  }
  return url;
};

// 개별 이미지 다운로드 presigned URL 요청
export const fetchPresignedImageUrl = async (imageId: number): Promise<string | null> => {
  if (!imageId) return null;

  try {
    const res = await modelApi.get<{ data: PresignedImageResponse }>(
      `/image/${imageId}/presigned-url`,
    );
    const url = res.data.data.presignedUrl;

    // presignedUrl이 undefined, null, 빈 문자열일 때 방어
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.warn(`presigned-url 비어 있음: 이미지 ID ${imageId}`, url);
      return null;
    }

    return url;
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
