// types/image.ts
import type { RawModel } from './model';

export type ImageData = {
  imageId: number;
  model: RawModel;
  userId: number;
  uploadFileName: string;
  createdAt: string;
  deletedAt: string | null;
  public: boolean;
};

export type PresignedImageResponse = {
  image: ImageData;
  presignedUrl: string;
};
