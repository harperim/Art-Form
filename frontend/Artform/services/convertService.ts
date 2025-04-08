import convertApi from '~/lib/api/convert';
import { getFileTypeFromUri } from '~/utils/uploadImageToS3';

export const applyImg2Img = async ({
  imageUri,
  modelId,
  strength,
}: {
  imageUri: string;
  modelId: string;
  strength?: string;
}): Promise<{ imageId: number; uploadFileName: string }> => {
  const fileName = imageUri.split('/').pop()!;
  const fileType = getFileTypeFromUri(imageUri);

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: fileName,
    type: fileType,
  } as unknown as Blob);

  formData.append('model_id', modelId);
  if (strength) formData.append('strength', strength);

  try {
    const res = await convertApi.post('/apply/img2img/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, data } = res.data;
    if (!success || !data?.result) {
      throw new Error('이미지 변환 실패: 서버 응답이 올바르지 않습니다.');
    }

    return {
      imageId: data.result.imageId,
      uploadFileName: data.result.uploadFileName,
    };
  } catch (err: any) {
    console.error('applyImg2Img error:', err?.response?.data || err.message);
    throw new Error('이미지 변환에 실패했습니다.');
  }
};

export const applyText2Img = async ({
  prompt,
  modelId,
  strength,
}: {
  prompt: string;
  modelId: string;
  strength?: string;
}): Promise<{ uploadFileName: string; imageId: number }> => {
  try {
    const params = new URLSearchParams();
    params.append('prompt', prompt);
    params.append('model_id', modelId);
    if (strength) params.append('strength', strength);

    console.log('modelId: ', modelId);

    const res = await convertApi.post('/apply/text2img/', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    const { success, data } = res.data;
    if (!success || !data) {
      throw new Error('서버 응답이 올바르지 않습니다.');
    }

    console.log('applyText2Img response:', data);

    return {
      uploadFileName: data.uploadFileName,
      imageId: data.imageId,
    };
  } catch (err: any) {
    console.error('applyText2Img error:', err?.response?.data || err.message);
    throw new Error('이미지 생성에 실패했습니다.');
  }
};
