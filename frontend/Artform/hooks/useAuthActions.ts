// hooks/useAuthActions.ts
import { useAuth } from '~/lib/auth-context';
import {
  checkEmailDuplicate,
  checkNicknameDuplicate,
  loginUser,
  logoutUser,
  signupUser,
} from '~/services/authService';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';

export const useAuthActions = () => {
  const router = useRouter();
  const { login, logout } = useAuth();

  const handleRegister = async (
    email: string,
    password: string,
    confirm: string,
    nickname: string,
  ) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (password !== confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!email || !password || !nickname) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 12) {
      alert('닉네임은 2~12자 사이로 입력해주세요.');
      return;
    }

    try {
      await signupUser({ email, password, nickname });
      alert('회원가입 완료! 로그인 페이지로 이동합니다.');
      router.replace('/login');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const msg = err.response?.data?.msg;

        if (status === 409) {
          alert(msg || '이미 사용 중인 이메일 또는 닉네임입니다.');
        } else if (status === 400) {
          alert(msg || '요청 형식이 잘못되었습니다.');
        } else {
          alert('회원가입 중 오류가 발생했습니다.');
        }
      } else {
        console.error('회원가입 실패:', err);
        alert('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const { accessToken, refreshToken } = await loginUser(email, password);
      await login(accessToken, refreshToken);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const msg = err.response?.data?.msg || err.message;

        if (status === 401) {
          alert(msg || '이메일과 비밀번호를 확인해주세요.');
        } else {
          alert('로그인 중 오류가 발생했습니다.');
        }
        console.error('로그인 실패:', msg);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
        console.error('로그인 실패:', err);
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // 서버 로그아웃
    } catch (err) {
      console.warn('서버 로그아웃 실패:', err);
    } finally {
      await logout(); // 클라이언트 상태 초기화
      console.log('로그아웃 완료');
    }
  };

  const checkNickname = async (nickname: string) => {
    try {
      const res = await checkNicknameDuplicate(nickname);
      if (res.data === true) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('닉네임 중복 체크 실패:', err);
      alert('중복 체크 중 오류가 발생했습니다.');
      return false;
    }
  };

  const checkEmail = async (email: string) => {
    if (!email) return null;

    try {
      const res = await checkEmailDuplicate(email);
      return res.data; // boolean
    } catch (err) {
      console.error('이메일 중복 체크 실패:', err);
      return null;
    }
  };

  return { handleLogin, handleLogout, handleRegister, checkNickname, checkEmail };
};
