import { getCurrentUser } from './auth';
import Cookies from 'js-cookie';

/**
 * API 요청에 사용할 인증 헤더를 생성합니다.
 * @returns 인증 헤더가 포함된 객체
 */
export const getAuthHeaders = (): Record<string, string> => {
  // 기본 헤더
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // 쿠키에서 액세스 토큰 가져오기
  const accessToken = Cookies.get('access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 현재 로그인한 사용자 정보 가져오기
  const currentUser = getCurrentUser();
  if (currentUser?.id) {
    headers['x-user-id'] = currentUser.id;
  }

  return headers;
}; 