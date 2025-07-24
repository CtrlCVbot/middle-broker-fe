import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { SystemAccessLevel, UserStatus } from '@/types/user';

// 테스트용 Next.js API 엔드포인트 URL
const API_URL = 'http://localhost:3000';

describe('사용자 상세 조회 API 테스트', () => {
  let testUserId: string;

  // 테스트 데이터 생성
  beforeAll(async () => {
    // 테스트용 사용자 생성
    const testUser = {
      id: uuidv4(),
      email: 'test@example.com',
      password: 'hashedpassword',
      name: '테스트 사용자',
      phone_number: '010-1234-5678',
      system_access_level: 'broker_member' as SystemAccessLevel,
      domains: ['logistics'],
      status: 'active' as UserStatus,
      created_by: uuidv4(),
      updated_by: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(users).values(testUser);
    testUserId = testUser.id;
  });

  // 성공 케이스
  it('존재하는 사용자 ID로 조회 시 사용자 정보를 반환해야 함', async () => {
    const response = await request(API_URL)
      .get(`/api/users/${testUserId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: testUserId,
      email: 'test@example.com',
      name: '테스트 사용자',
    });

    // 비밀번호 필드가 제외되었는지 확인
    expect(response.body).not.toHaveProperty('password');
  });

  // 실패 케이스 - 존재하지 않는 사용자
  it('존재하지 않는 사용자 ID로 조회 시 404 에러를 반환해야 함', async () => {
    const nonExistentId = uuidv4();
    const response = await request(API_URL)
      .get(`/api/users/${nonExistentId}`)
      .expect(404);

    expect(response.body).toEqual({
      error: '사용자를 찾을 수 없습니다.'
    });
  });

  // 실패 케이스 - 잘못된 형식의 ID
  it('잘못된 형식의 ID로 조회 시 400 에러를 반환해야 함', async () => {
    const response = await request(API_URL)
      .get('/api/users/invalid-id')
      .expect(400);

    expect(response.body).toEqual({
      error: '잘못된 사용자 ID 형식입니다.'
    });
  });

  // 테스트 데이터 정리
  afterAll(async () => {
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });
}); 