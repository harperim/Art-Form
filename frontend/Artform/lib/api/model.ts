// lib/api/model.ts
import axios from 'axios';
import { getToken } from '../auth';

const modelApi = axios.create({
  baseURL: 'https://j12d103.p.ssafy.io/core',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// 인증 필요 시
modelApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log('token:', token);
  return config;
});

export default modelApi;
