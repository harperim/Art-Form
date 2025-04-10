// services/userService.ts
import userApi from '~/lib/api/user';
import type { User } from '~/types/user';

export const fetchMyInfo = async (): Promise<User> => {
  const res = await userApi.get('/user');
  return res.data.data;
};

export const fetchUserInfo = async (userId: number): Promise<User> => {
  const response = await userApi.get(`/user/${userId}`);
  return response.data.data;
};
