// lib/api/user.ts
import axios from 'axios';
import { getToken, getStoredRefreshToken, setToken } from '../auth';
import { forceLogout } from '../auth-helper';

const userApi = axios.create({
  baseURL: 'http://j12d103.p.ssafy.io:8082',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// 🔐 accessToken 삽입
userApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 자동 재발급
userApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/user/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getStoredRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post('http://j12d103.p.ssafy.io:8082/user/auth/oauth/accesstoken', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data;
        await setToken(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return userApi(originalRequest);
      } catch (err) {
        await forceLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default userApi;
