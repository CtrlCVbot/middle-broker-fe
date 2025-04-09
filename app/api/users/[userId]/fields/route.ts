import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { validate as uuidValidate } from 'uuid';
import { logUserChange } from '@/utils/user-change-logger';
import { USER_DOMAINS, SYSTEM_ACCESS_LEVELS, USER_STATUSES, type UserDomain, type IUser } from '@/types/user';

// 필드 값 검증을 위한 Zod 스키마
const FieldUpdateSchema = z.object({
  requestUserId: z.string().uuid('잘못된 요청 사용자 ID 형식입니다.'),
  fields: z.array(z.object({
    field: z.enum(['status', 'system_access_level', 'name', 'phone_number', 'email', 'domains']),
    value: z.any(),
    reason: z.string().optional()
  }))
});

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { userId } = params;

    // UUID 형식 검증
    if (!uuidValidate(userId)) {
      return new Response(
        JSON.stringify({ error: '잘못된 사용자 ID 형식입니다.' }),
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 body 검증
    const validationResult = FieldUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors 
        }),
        { status: 400 }
      );
    }

    const { requestUserId, fields } = validationResult.data;

    // 요청 사용자 정보 조회
    const requestUser = await db.query.users.findFirst({
      where: eq(users.id, requestUserId)
    });

    if (!requestUser) {
      return new Response(
        JSON.stringify({ error: '요청 사용자를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }

    // 대상 사용자 존재 여부 확인
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    }) as unknown as IUser;

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: '대상 사용자를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }

    // 업데이트할 필드 데이터 준비
    const now = new Date();
    // UTC+9 시간을 계산
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
    const kstDate = new Date(now.getTime() + kstOffset);
    
    const updateData: Partial<IUser> & { updated_at: Date; updated_by: string } = {      
      //updated_at: now, // DB에는 UTC 시간으로 저장
      updated_at: kstDate, // DB에는 kst 시간으로 저장
      updated_by: requestUserId
    };
    const reasons: Record<string, string> = {};
    
    // 로그에는 KST로 표시
    console.log('[UPDATE] 한국 시간:', kstDate.toLocaleString('ko-KR'));
    console.log('[UPDATE] DB 저장 시간 (UTC):', now.toISOString());
    for (const { field, value, reason } of fields) {
      switch (field) {
        case 'status':
          if (!['active', 'inactive', 'locked'].includes(value)) {
            return new Response(
              JSON.stringify({ error: '잘못된 상태값입니다.' }),
              { status: 400 }
            );
          }
          updateData.status = value;
          if (reason) reasons['status'] = reason;
          break;
          
        case 'system_access_level':
          if (!['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest'].includes(value)) {
            return new Response(
              JSON.stringify({ error: '잘못된 접근 권한입니다.' }),
              { status: 400 }
            );
          }
          updateData.system_access_level = value;
          if (reason) reasons['system_access_level'] = reason;
          break;
          
        case 'email':
          // 이메일 중복 검사
          const existingEmail = await db.query.users.findFirst({
            where: eq(users.email, value)
          });
          if (existingEmail && existingEmail.id !== userId) {
            return new Response(
              JSON.stringify({ error: '이미 사용 중인 이메일입니다.' }),
              { status: 400 }
            );
          }
          updateData.email = value;
          if (reason) reasons['email'] = reason;
          break;
          
        case 'phone_number':
          updateData.phone_number = value;
          if (reason) reasons['phone_number'] = reason;
          break;

        case 'name':
          updateData.name = value;
          if (reason) reasons['name'] = reason;
          break;

        case 'domains':
          if (!Array.isArray(value) || !value.every(domain => USER_DOMAINS.includes(domain as UserDomain))) {
            return new Response(
              JSON.stringify({ error: '잘못된 도메인 값입니다.' }),
              { status: 400 }
            );
          }
          updateData.domains = value as UserDomain[];
          if (reason) reasons['domains'] = reason;
          break;
      }
    }

    // 업데이트 실행
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // 변경 이력 기록
    await logUserChange({
      user_id: userId,
      changed_by: requestUserId,
      changed_by_name: requestUser.name,
      changed_by_email: requestUser.email,
      changed_by_access_level: requestUser.system_access_level,
      change_type: 'update',
      oldData: existingUser,
      newData: updateData,
      reason: Object.entries(reasons)
        .map(([field, reason]) => `${field}: ${reason}`)
        .join(', ')
    });

    // 비밀번호 필드 제외하고 응답
    const { password, ...userInfo } = updatedUser;
    
    return new Response(
      JSON.stringify(userInfo),
      { status: 200 }
    );

  } catch (error) {
    console.error('사용자 필드 변경 중 오류 발생:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500 }
    );
  }
} 