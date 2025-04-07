import modelApi from '~/lib/api/model';

export const getImageUploadUrl = async (fileName: string, fileType: string) => {
  const res = await modelApi.get('/image/presigned-url', {
    params: {
      fileName,
      fileType,
    },
  });

  return res.data.data as { presignedUrl: string; uploadFileName: string };
};

export const uploadToS3 = async (presignedUrl: string, fileUri: string, fileType: string) => {
  const blob = await (await fetch(fileUri)).blob();

  await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType,
    },
    body: blob,
  });
};

export const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream'; // fallback
  }
};
