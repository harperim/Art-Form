// lib/auth.ts
import {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} from '../utils/storage';

export const setToken = async (accessToken: string, refreshToken?: string) => {
  await saveAccessToken(accessToken);
  if (refreshToken) {
    await saveRefreshToken(refreshToken);
  }
};

export const getToken = async (): Promise<string | null> => {
  return await getAccessToken();
};

export const getStoredRefreshToken = async (): Promise<string | null> => {
  return await getRefreshToken();
};

export const removeToken = async (): Promise<void> => {
  await removeAccessToken();
  await removeRefreshToken();
};
