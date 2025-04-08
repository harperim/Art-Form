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
}): Promise<string> => {
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

  const res = await convertApi.post('/apply/img2img/', formData);
  return res.data;
};

export const applyText2Img = async ({
  prompt,
  modelId,
  strength,
}: {
  prompt: string;
  modelId: string;
  strength?: string;
}): Promise<string> => {
  const params = new URLSearchParams();
  params.append('prompt', prompt);
  params.append('model_id', modelId);
  if (strength) params.append('strength', strength);

  const res = await convertApi.post('/apply/text2img/', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return res.data; // string (image URL or base64)
};
