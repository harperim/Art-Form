import type { ImageSourcePropType } from 'react-native';

export type Model = {
  id: string;
  title: string;
  image: ImageSourcePropType;
};

export type Review = {
  id: string;
  nickname: string;
  comment: string;
  date: string;
  image: ImageSourcePropType;
};

export type ModelDetail = Model & {
  artist: string;
  liked: boolean;
  likes: number;
  relatedImages: ImageSourcePropType[];
  reviews: Review[];
};
