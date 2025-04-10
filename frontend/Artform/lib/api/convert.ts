// lib/api/convert.ts
import axios from 'axios';
import { getToken } from '../auth';

const convertApi = axios.create({
  baseURL: 'https://special-helping-mudfish.ngrok-free.app',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 100000,
});

// 인증 필요 시
convertApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token:', token);
  }
  return config;
});

convertApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[ConvertApi Error]', err);
    return Promise.reject(err);
  },
);

export default convertApi;
