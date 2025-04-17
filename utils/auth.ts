"use client"

import Cookies from 'js-cookie'
import { IUser } from '@/types/user'
import { useAuthStore } from '@/store/auth-store'

// Auth 전용 사용자 타입
export interface AuthUser extends IUser {
  isLoggedIn: boolean;
}

// 사용자 정보 저장 (localStorage와 쿠키 모두 사용)
export const setUser = (user: AuthUser): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
    
    // 쿠키에 저장 (7일 유효기간)
    Cookies.set('user', JSON.stringify(user), { expires: 7, path: '/' });
  }
};

// 사용자 정보 가져오기 (localStorage 우선, 없으면 쿠키)
export const getUser = (): AuthUser | null => {
  if (typeof window !== "undefined") {
    const localUser = localStorage.getItem("user");
    if (localUser) return JSON.parse(localUser);
    
    // localStorage에 없으면 쿠키에서 확인
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      // localStorage에도 동기화
      localStorage.setItem("user", cookieUser);
      return JSON.parse(cookieUser);
    }
  }
  return null;
};

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  return useAuthStore.getState().isLoggedIn();
};

// 로그아웃
export const logout = (): void => {
  useAuthStore.getState().logout();
};

// 이메일과 비밀번호로 로그인 시도 (API 사용)
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: IUser; error?: string; message?: string }> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // 성공적으로 로그인한 경우
    if (response.ok && data.success) {
      // auth-store에 사용자 정보 저장
      useAuthStore.getState().login(data.user, data.token);
      return { 
        success: true, 
        user: data.user
      };
    }

    // 로그인 실패한 경우
    return { 
      success: false, 
      error: data.error || 'LOGIN_FAILED',
      message: data.message || '로그인에 실패했습니다.'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: 'SERVER_ERROR',
      message: '서버와 통신 중 오류가 발생했습니다.'
    };
  }
};

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = (): IUser | null => {
  return useAuthStore.getState().getUser();
}; 