export type Review = {
  reviewId: number;
  modelId: number;
  modelName: string;
  reviewImageName: string;
  presignedUrl: string;
  userId: number;
  content: string;
  createdAt: string;
};
