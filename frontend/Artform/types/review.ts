// types/review.ts

export type Review = {
  reviewId: number;
  modelId: number;
  modelName: string;
  reviewImageName: string;
  presignedUrl: string;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
};

export type Reviews = {
  data: Review[];
  reviewCount: number;
};
