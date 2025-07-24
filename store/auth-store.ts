import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { IUser } from '@/types/user';

export interface IAuthUserState {
  user: IUser | null;
  token: string | null;
  loggedIn: boolean;
}

export interface IAuthActions {
  login: (userData: IUser, token: string) => void;
  logout: () => void;
  getUser: () => IUser | null;
  isLoggedIn: () => boolean;
}

export type AuthStore = IAuthUserState & IAuthActions;

// 쿠키 관련 설정
const COOKIE_OPTIONS = {
  expires: 7, // 7일 유효기간
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

// 로그인 상태를 localStorage와 쿠키에 둘 다 저장하는 커스텀 스토리지
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const localData = localStorage.getItem(name);
    if (localData) return localData;
    
    const cookieData = Cookies.get(name);
    if (cookieData) {
      // 쿠키에만 있으면 localStorage에도 동기화
      localStorage.setItem(name, cookieData);
      return cookieData;
    }
    
    return null;
  },
  
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    
    // localStorage에 저장
    localStorage.setItem(name, value);
    
    // 쿠키에도 저장
    Cookies.set(name, value, COOKIE_OPTIONS);
  },
  
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    
    // localStorage에서 제거
    localStorage.removeItem(name);
    
    // 쿠키에서도 제거
    Cookies.remove(name, { path: '/' });
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loggedIn: false,
      
      login: (userData: IUser, token: string) => {
        set({
          user: userData,
          token: token,
          loggedIn: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          loggedIn: false,
        });
      },
      
      getUser: () => get().user,
      
      isLoggedIn: () => get().loggedIn,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
); 