/**
 * 현재 로그인한 사용자의 ID를 반환하는 함수
 * 
 * @returns 현재 인증된 사용자의 ID
 * 
 * 참고: 이 함수는 임시적으로 고정 값을 반환합니다.
 * 실제 구현 시 인증 시스템에서 현재 사용자 정보를 가져오도록 수정해야 합니다.
 */
export function getCurrentUserId(): string {
  // TODO: 실제 인증 시스템에서 현재 사용자 ID를 가져오도록 수정
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * 현재 로그인한 사용자의 정보를 반환하는 함수
 * 
 * @returns 현재 인증된 사용자의 기본 정보
 */
export function getCurrentUser() {
  // TODO: 실제 인증 시스템에서 현재 사용자 정보를 가져오도록 수정
  return {
    id: getCurrentUserId(),
    name: 'System Admin',
    email: 'admin@example.com',
    role: 'platform_admin'
  };
} 