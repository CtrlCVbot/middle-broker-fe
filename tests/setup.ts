import { beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import '@testing-library/jest-dom/vitest';

// 테스트 전에 실행
beforeAll(async () => {
  // 데이터베이스 연결 확인
  try {
    await db.select().from(users).execute();
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    throw error;
  }
});

// 각 테스트 후에 실행
afterEach(async () => {
  // 필요한 경우 테스트 데이터 정리
});

// 모든 테스트 후에 실행
afterAll(async () => {
  // 데이터베이스 연결 종료 등 정리 작업
}); 