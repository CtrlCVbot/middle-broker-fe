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

// 토큰 만료 확인 (클라이언트 측)
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT 토큰 디코딩 (Base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // 현재 시간과 만료 시간 비교 (초 단위)
    const now = Math.floor(Date.now() / 1000);
    return !payload.exp || payload.exp < now;
  } catch (error) {
    console.error('토큰 만료 확인 오류:', error);
    return true; // 오류 발생 시 만료된 것으로 간주
  }
};

// 토큰 자동 갱신 함수
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token && data.user) {
        // 스토어에 새 토큰과 사용자 정보 저장
        useAuthStore.getState().login(data.user, data.token);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    return false;
  }
};

// 로그아웃 (API 호출)
export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // 스토어에서 로그아웃 처리
      useAuthStore.getState().logout();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
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

    console.log("loginWithEmail data", data);

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

/**
 * 사용자의 systemAccessLevel을 기반으로 changedByRole을 결정하는 함수
 * @param systemAccessLevel 사용자의 시스템 접근 레벨
 * @returns 'shipper' | 'broker' | 'admin'
 */
export const getUserRole = (systemAccessLevel?: string): 'shipper' | 'broker' | 'admin' => {
  if (!systemAccessLevel) return 'broker'; // 기본값
  
  switch (systemAccessLevel) {
    case 'platform_admin':
    case 'broker_admin':
    case 'shipper_admin':
      return 'admin';
    case 'broker_member':
      return 'broker';
    case 'shipper_member':
      return 'shipper';
    default:
      return 'broker'; // 기본값
  }
}; 