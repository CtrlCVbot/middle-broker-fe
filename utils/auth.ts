"use client"

import Cookies from 'js-cookie'
import { IUser } from '@/types/user'

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
  const user = getUser();
  return !!user && user.isLoggedIn;
};

// 로그아웃 (localStorageuserState거)
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    Cookies.remove('user', { path: '/' });
  }
};

// 이메일과 비밀번호로 로그인 시도
export const loginWithEmail = (
  email: string,
  password: string
): { success: boolean; user?: AuthUser; error?: string } => {
  // 목업 사용자 데이터
  const MOCK_USERS = [
    { email: "user@example.com", password: "password123", name: "일반 사용자" },
    { email: "admin@example.com", password: "admin123", name: "관리자" },
  ];

  const user = MOCK_USERS.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    const userData: AuthUser = {
      ...user,
      id: '1', // 목업 데이터
      phoneNumber: '', // 목업 데이터
      companyId: null,
      systemAccessLevel: 'shipper_member',
      domains: ['logistics'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      isLoggedIn: true,
    };
    setUser(userData);
    return { success: true, user: userData };
  }

  return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
};

// 현재 로그인한 사용자 정보 조회
export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = getUser();
  if (!user || !user.isLoggedIn) return null;
  return user;
} 