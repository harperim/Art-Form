// lib/auth-helper.ts
import { router } from 'expo-router';
import { removeToken } from './auth';

export const forceLogout = async (message = '세션이 만료되었습니다. 다시 로그인해주세요.') => {
  await removeToken();
  alert(message);
  router.replace('/login');
};
