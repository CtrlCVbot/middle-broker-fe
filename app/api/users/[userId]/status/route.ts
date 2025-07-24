import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userChangeLogs } from '@/db/schema/users';
import { UserStatus } from '@/types/user';

// UUID 형식 검증을 위한 정규식
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// interface RouteContext {
//   params: Promise<{ userId: string }>;
// }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = (await params);
    
    const body = await request.json();

    // UUID 형식 검증
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // status 필드 검증
    if (!body.status || !['active', 'inactive', 'locked'].includes(body.status)) {
      return NextResponse.json(
        { error: '올바른 상태값이 필요합니다. (active, inactive, locked)' },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const oldStatus = existingUser[0].status;
    const newStatus = body.status as UserStatus;

    // 상태가 같은 경우 early return
    if (oldStatus === newStatus) {
      return NextResponse.json(
        { message: '상태가 이미 동일합니다.' },
        { status: 200 }
      );
    }

    // 트랜잭션으로 상태 변경 및 이력 기록
    const result = await db.transaction(async (tx) => {
      // 상태 변경
      const updatedUser = await tx
        .update(users)
        .set({
          status: newStatus,
          updated_at: new Date(),
          // TODO: 실제 구현 시 인증된 사용자 정보로 대체
          updated_by: 'system'
        })
        .where(eq(users.id, userId))
        .returning()
        .execute();

      // 변경 이력 기록
      await tx
        .insert(userChangeLogs)
        .values({
          user_id: userId,
          changed_by: 'system', // TODO: 실제 구현 시 인증된 사용자 ID로 대체
          changed_by_name: 'System', // TODO: 실제 구현 시 인증된 사용자 이름으로 대체
          changed_by_email: 'system@example.com', // TODO: 실제 구현 시 인증된 사용자 이메일로 대체
          change_type: 'status_change',
          diff: {
            status: [oldStatus, newStatus]
          },
          reason: body.reason || '상태 변경',
          created_at: new Date()
        })
        .execute();

      return updatedUser[0];
    });

    // 비밀번호 필드 제외하고 응답
    const { password, ...userWithoutPassword } = result;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('사용자 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 