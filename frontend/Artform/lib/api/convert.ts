// lib/api/convert.ts
import axios from 'axios';

const convertApi = axios.create({
  baseURL: 'https://special-helping-mudfish.ngrok-free.app',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 10000,
});

convertApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[ConvertApi Error]', err);
    return Promise.reject(err);
  },
);

export default convertApi;
