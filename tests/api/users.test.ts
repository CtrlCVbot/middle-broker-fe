import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { PUT, DELETE } from '@/app/api/users/[userId]/route';
import { PATCH as STATUS_PATCH } from '@/app/api/users/[userId]/status/route';
import { PATCH as FIELDS_PATCH } from '@/app/api/users/[userId]/fields/route';
import { db } from '@/db';
import { users, user_change_logs } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { SystemAccessLevel, UserStatus } from '@/types/user';

// 모의 사용자 데이터
const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  name: '테스트 사용자',
  phone_number: '010-1234-5678',
  system_access_level: 'broker_member' as SystemAccessLevel,
  domains: ['test.com'],
  status: 'active' as UserStatus,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: 'system',
  updated_by: 'system'
};

// NextRequest 모의 객체 생성 함수
const createMockRequest = (method: string, body?: any, searchParams?: Record<string, string>, params?: Record<string, string>) => {
  const url = new URL('http://localhost:3000/api/users');
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const request = new NextRequest(url, {
    method,
    ...(body && { body: JSON.stringify(body) })
  }) as NextRequest & { nextUrl: URL };

  // params가 있는 경우 (예: userId)
  if (params) {
    Object.defineProperty(request, 'params', {
      value: params,
      writable: true
    });
  }

  return request;
};

describe('Users API', () => {
  beforeEach(async () => {
    // 테스트 데이터베이스 초기화
    await db.delete(users).execute();
  });

  afterEach(async () => {
    // 테스트 데이터 정리
    await db.delete(users).execute();
  });

  describe('GET /api/users', () => {
    it('should return empty list when no users exist', async () => {
      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should return paginated users list', async () => {
      // 테스트 데이터 생성
      await db.insert(users).values([
        { ...mockUser, email: 'user1@example.com' },
        { ...mockUser, email: 'user2@example.com' }
      ]).execute();

      const request = createMockRequest('GET', null, { page: '1', pageSize: '1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.total).toBe(2);
      expect(data.totalPages).toBe(2);
    });

    it('should filter users by search term', async () => {
      await db.insert(users).values([
        { ...mockUser, name: '홍길동', email: 'hong@example.com' },
        { ...mockUser, name: '김철수', email: 'kim@example.com' }
      ]).execute();

      const request = createMockRequest('GET', null, { searchTerm: '홍길동' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('홍길동');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const request = createMockRequest('POST', mockUser);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.email).toBe(mockUser.email);
      expect(data.password).toBeUndefined(); // 비밀번호는 응답에서 제외되어야 함
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidUser = { email: 'test@example.com' }; // 필수 필드 누락
      const request = createMockRequest('POST', invalidUser);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('다음 필드가 필요합니다');
    });

    it('should return 400 when email already exists', async () => {
      // 첫 번째 사용자 생성
      await db.insert(users).values(mockUser).execute();

      // 동일한 이메일로 두 번째 사용자 생성 시도
      const request = createMockRequest('POST', mockUser);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('이미 존재하는 이메일입니다.');
    });
  });

  describe('PUT /api/users/:userId', () => {
    it('should update user information', async () => {
      // 사용자 생성
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      // 사용자 정보 수정
      const updateData = {
        name: '수정된 이름',
        phone_number: '010-9876-5432'
      };

      const request = createMockRequest('PUT', updateData, undefined, { userId });
      const response = await PUT(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(updateData.name);
      expect(data.phone_number).toBe(updateData.phone_number);
      expect(data.password).toBeUndefined();
    });

    it('should return 404 when user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const request = createMockRequest('PUT', { name: '새 이름' }, undefined, { userId });
      const response = await PUT(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('사용자를 찾을 수 없습니다.');
    });
  });

  describe('DELETE /api/users/:userId', () => {
    it('should delete user', async () => {
      // 사용자 생성
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const request = createMockRequest('DELETE', null, undefined, { userId });
      const response = await DELETE(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // 사용자가 실제로 삭제되었는지 확인
      const deletedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();
      expect(deletedUser).toHaveLength(0);
    });

    it('should return 404 when user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const request = createMockRequest('DELETE', null, undefined, { userId });
      const response = await DELETE(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('사용자를 찾을 수 없습니다.');
    });
  });

  describe('PATCH /api/users/:userId/status', () => {
    it('should change user status', async () => {
      // 사용자 생성
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const statusChange = {
        status: 'inactive' as UserStatus,
        reason: '사용자 요청'
      };

      const request = createMockRequest('PATCH', statusChange, undefined, { userId });
      const response = await STATUS_PATCH(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(statusChange.status);
      expect(data.password).toBeUndefined();

      // 변경 이력이 기록되었는지 확인
      const logs = await db
        .select()
        .from(user_change_logs)
        .where(eq(user_change_logs.user_id, userId))
        .execute();

      expect(logs).toHaveLength(1);
      expect(logs[0].change_type).toBe('status_change');
      expect(logs[0].reason).toBe(statusChange.reason);
    });

    it('should return 400 for invalid status', async () => {
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const request = createMockRequest('PATCH', { status: 'invalid' }, undefined, { userId });
      const response = await STATUS_PATCH(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('올바른 상태값이 필요합니다');
    });
  });

  describe('PATCH /api/users/:userId/fields', () => {
    it('should change multiple fields at once', async () => {
      // 사용자 생성
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const fieldsChange = {
        fields: [
          {
            field: 'status',
            value: 'inactive' as UserStatus,
            reason: '상태 변경'
          },
          {
            field: 'system_access_level',
            value: 'viewer' as SystemAccessLevel,
            reason: '권한 변경'
          },
          {
            field: 'name',
            value: '새로운 이름',
            reason: '이름 변경'
          }
        ]
      };

      const request = createMockRequest('PATCH', fieldsChange, undefined, { userId });
      const response = await FIELDS_PATCH(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(fieldsChange.fields[0].value);
      expect(data.system_access_level).toBe(fieldsChange.fields[1].value);
      expect(data.name).toBe(fieldsChange.fields[2].value);
      expect(data.password).toBeUndefined();

      // 변경 이력이 기록되었는지 확인
      const logs = await db
        .select()
        .from(user_change_logs)
        .where(eq(user_change_logs.user_id, userId))
        .execute();

      expect(logs).toHaveLength(3); // 3개의 필드 변경
      expect(logs[0].change_type).toBe('status_change');
      expect(logs[1].change_type).toBe('system_access_level_change');
      expect(logs[2].change_type).toBe('name_change');
    });

    it('should return 400 for invalid field value', async () => {
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const fieldsChange = {
        fields: [
          {
            field: 'status',
            value: 'invalid_status',
            reason: '잘못된 상태값'
          }
        ]
      };

      const request = createMockRequest('PATCH', fieldsChange, undefined, { userId });
      const response = await FIELDS_PATCH(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('상태는 active, inactive, locked 중 하나여야 합니다');
    });

    it('should return 400 for duplicate email', async () => {
      // 첫 번째 사용자 생성
      const user1 = await db.insert(users).values(mockUser).returning().execute();
      
      // 두 번째 사용자 생성
      const user2 = await db.insert(users).values({
        ...mockUser,
        email: 'another@example.com'
      }).returning().execute();

      const fieldsChange = {
        fields: [
          {
            field: 'email',
            value: mockUser.email, // 첫 번째 사용자의 이메일로 변경 시도
            reason: '이메일 변경'
          }
        ]
      };

      const request = createMockRequest('PATCH', fieldsChange, undefined, { userId: user2[0].id });
      const response = await FIELDS_PATCH(request, { params: { userId: user2[0].id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('이미 존재하는 이메일입니다.');
    });

    it('should return 400 for empty fields array', async () => {
      const result = await db.insert(users).values(mockUser).returning().execute();
      const userId = result[0].id;

      const request = createMockRequest('PATCH', { fields: [] }, undefined, { userId });
      const response = await FIELDS_PATCH(request, { params: { userId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('변경할 필드가 지정되지 않았습니다.');
    });
  });
}); 