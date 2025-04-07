// types/model.ts

export type RawModel = {
  modelId: number;
  userId: number;
  modelName: string;
  description: string;
  likeCount: number;
  uploadFileName: string;
  thumbnailId: number;
  createdAt: string;
  deletedAt: string | null;
  public: boolean;
};

export type Model = {
  model: RawModel;
  userName: string;
};

export type ModelWithThumbnail = Model & {
  thumbnailUrl: string;
};

export type MyModelItem = {
  modelId: number;
  userName: string;
  modelName: string;
  url: string;
};

export type MyLikeModel = {
  imageSrc: string;
  userId: string;
  modelId: string;
  modelName: string;
};
