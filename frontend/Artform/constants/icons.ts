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
import PaletteIcon from '~/assets/icons/palette.svg';
import TextIcon from '~/assets/icons/text.svg';
import GalleryIcon from '~/assets/icons/gallery.svg';
import CameraIcon from '~/assets/icons/camera.svg';
import CheckIcon from '~/assets/icons/check.svg';
import GridIcon from '~/assets/icons/grid.svg';
import PlusIcon from '~/assets/icons/plus.svg';
import Menu from '~/assets/icons/menu.svg';

import Settings from '~/assets/icons/settings.svg';
import User from '~/assets/icons/user.svg';
import LogOut from '~/assets/icons/log-out.svg';
import Message from '~/assets/icons/message.svg';

export const ICONS = {
  home: { outline: HomeIcon, filled: HomeIconFilled },
  store: { outline: StoreIcon, filled: StoreIconFilled },
  model: { outline: ModelIcon, filled: ModelIconFilled },
  mypage: { outline: MyPageIcon, filled: MyPageIconFilled },
  heart: { outline: HeartIcon, filled: HeartIconFilled },
  send: SendIcon,
  palette: PaletteIcon,
  text: TextIcon,
  gallery: GalleryIcon,
  camera: CameraIcon,
  check: CheckIcon,
  grid: GridIcon,
  plus: PlusIcon,
  Menu: Menu,
  setting: Settings,
  user: User,
  logout: LogOut,
  message: Message,
};

export const TAB_ICONS = {
  home: { outline: HomeIcon, filled: HomeIconFilled },
  store: { outline: StoreIcon, filled: StoreIconFilled },
  model: { outline: ModelIcon, filled: ModelIconFilled },
  mypage: { outline: MyPageIcon, filled: MyPageIconFilled },
} as const;
