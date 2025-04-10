// lib/auth-context.tsx
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken } from './auth';

type AuthContextType = {
  userToken: { token: string } | null;
  loading: boolean;
  isLoggedIn: boolean;
  userInfo: userInfoType;
  updateUserInfo: (userInfo: userInfoType) => void;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
};
type userInfoType = {
  userId: string;
  email: string;
  nickname: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [userToken, setUserToken] = useState<{ token: string } | null>(null);
  const [userInfo, setUserInfo] = useState<userInfoType>({
    userId: '',
    email: '',
    nickname: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      if (token) {
        setUserToken({ token });
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (accessToken: string, refreshToken?: string) => {
    await setToken(accessToken, refreshToken);
    setUserToken({ token: accessToken });
  };

  const logout = async (message?: string) => {
    await removeToken();
    setUserToken(null);
    if (message) {
      alert(message);
    }
  };

  const updateUserInfo = ({ userId, email, nickname }: userInfoType) => {
    console.log(userId, email, nickname);
    setUserInfo({ userId, email, nickname });
    console.log(userInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        loading,
        isLoggedIn: !!userToken,
        login,
        logout,
        userInfo,
        updateUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
