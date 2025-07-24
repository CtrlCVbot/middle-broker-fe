'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

/**
 * 인증 초기화 컴포넌트
 * - 페이지 로드 시 자동으로 인증 상태 체크
 * - refresh 토큰이 있으면 자동 로그인 시도
 * - 로딩 상태 관리
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const { isLoggedIn, login } = useAuthStore();
  
  // 로그인 상태가 아닌 경우 refresh 토큰을 사용하여 자동 로그인 시도
  const attemptAutoLogin = async () => {
    try {
      if (isLoggedIn()) {
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token && data.user) {
          // 스토어에 사용자 정보 저장
          login(data.user, data.token);
          console.log('Auto login successful via refresh token');
        }
      } else {
        console.log('No valid refresh token, user needs to login manually');
      }
    } catch (error) {
      console.error('Auto login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    attemptAutoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 로그인 상태 vs. 현재 경로에 따른 리다이렉션 (미들웨어와 중복될 수 있으나 CSR 전환 시 추가 보호층)
  useEffect(() => {
    if (isLoading) return;
    
    const authPaths = ['/login'];
    const protectedPaths = ['/dashboard', '/profile', '/orders', '/addresses', '/companies', '/users', '/settings'];
    
    if (isLoggedIn() && authPaths.some(p => pathname?.startsWith(p))) {
      router.replace('/dashboard');
    } else if (!isLoggedIn() && protectedPaths.some(p => pathname?.startsWith(p))) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '')}`);
    }
  }, [isLoading, isLoggedIn, pathname, router]);
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
} 