/**
 * Auth Context - سياق المصادقة
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../src/services/api';
import { STORAGE_KEYS } from '../src/core/config/app.config';

interface User {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; requires2FA?: boolean; userId?: string }>;
  register: (data: { email: string; password: string; name: string; nameAr?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateUser: (user: User) => void;
  complete2FA: (userId: string, token: string) => Promise<{ success: boolean; error?: string; user?: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        } catch {
          // Use saved user if backend unavailable
          setUser(JSON.parse(savedUser));
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      if (response.success && response.data) {
        // Check if 2FA is required
        if ((response.data as any).requires2FA) {
          return { success: false, requires2FA: true, userId: (response.data as any).userId };
        }
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }

      return {
        success: false,
        error: response.errorAr || response.error || 'حدث خطأ في تسجيل الدخول'
      };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const complete2FA = async (userId: string, token: string) => {
    try {
      const response = await api.validate2FA(userId, token);
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.errorAr || response.error || 'رمز المصادقة غير صحيح' };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const register = async (data: { email: string; password: string; name: string; nameAr?: string }) => {
    try {
      const response = await api.register(data);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: response.errorAr || response.error || 'حدث خطأ في التسجيل'
      };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        complete2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
