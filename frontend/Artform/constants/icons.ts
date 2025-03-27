// constants/icons.ts
import HeartIcon from '~/assets/icons/heart-outline.svg';
import HeartIconFilled from '~/assets/icons/heart-filled.svg';

import HomeIcon from '~/assets/icons/home-outline.svg';
import HomeIconFilled from '~/assets/icons/home-filled.svg';

import StoreIcon from '~/assets/icons/store-outline.svg';
import StoreIconFilled from '~/assets/icons/store-filled.svg';

import ModelIcon from '~/assets/icons/model-outline.svg';
import ModelIconFilled from '~/assets/icons/model-filled.svg';

import MyPageIcon from '~/assets/icons/mypage-outline.svg';
import MyPageIconFilled from '~/assets/icons/mypage-filled.svg';

import SendIcon from '~/assets/icons/send.svg';

export const ICONS = {
  home: { outline: HomeIcon, filled: HomeIconFilled },
  store: { outline: StoreIcon, filled: StoreIconFilled },
  model: { outline: ModelIcon, filled: ModelIconFilled },
  mypage: { outline: MyPageIcon, filled: MyPageIconFilled },
  heart: { outline: HeartIcon, filled: HeartIconFilled },
  send: SendIcon,
};

export const TAB_ICONS = {
  home: { outline: HomeIcon, filled: HomeIconFilled },
  store: { outline: StoreIcon, filled: StoreIconFilled },
  model: { outline: ModelIcon, filled: ModelIconFilled },
  mypage: { outline: MyPageIcon, filled: MyPageIconFilled },
} as const;
