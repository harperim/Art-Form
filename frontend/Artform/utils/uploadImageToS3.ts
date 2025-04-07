// utils/uploadImageToS3.ts

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

export const getFileTypeFromUri = (uri: string): string => {
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
