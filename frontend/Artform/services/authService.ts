// services/authService.ts
import userApi from '~/lib/api/user';

export const loginUser = async (email: string, password: string) => {
  const res = await userApi.post('/user/auth/login', { email, password });
  return res.data.jwtToken;
};

export const logoutUser = async () => {
  await userApi.post('/user/auth/logout');
};

export const signupUser = async ({
  email,
  password,
  nickname,
}: {
  email: string;
  password: string;
  nickname: string;
}) => {
  const res = await userApi.post('/user/signup', { email, password, nickname });
  return res.data;
};

export const checkNicknameDuplicate = async (nickname: string) => {
  const res = await userApi.get(`/user/nickname-check/${nickname}`);
  return res.data; // { msg: string, data: boolean }
};

export const checkEmailDuplicate = async (email: string) => {
  const res = await userApi.get(`/user/email-check/${email}`);
  return res.data; // { msg: string, data: boolean }
};
