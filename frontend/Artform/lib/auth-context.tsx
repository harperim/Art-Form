// lib/auth-context.tsx
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken } from './auth';

type AuthContextType = {
  user: { token: string } | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      if (token) {
        setUser({ token });
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (accessToken: string, refreshToken?: string) => {
    await setToken(accessToken, refreshToken);
    setUser({ token: accessToken });
  };

  const logout = async (message?: string) => {
    await removeToken();
    setUser(null);
    if (message) {
      alert(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
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
