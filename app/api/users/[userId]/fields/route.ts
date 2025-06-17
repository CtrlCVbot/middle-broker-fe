import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { validate as uuidValidate } from 'uuid';
import { logUserChange } from '@/utils/user-change-logger';
import { USER_DOMAINS, SYSTEM_ACCESS_LEVELS, USER_STATUSES, type UserDomain, type IUser } from '@/types/user';

// 필드 값 검증을 위한 Zod 스키마
const FieldUpdateSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

interface RouteContext {
  params: { userId: string };
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
      return NextResponse.json(
        { 
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error?.errors 
        },
        { status: 400 }
      );
    }

    const { fields, reason } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 요청 사용자 정보 조회
    const requestUser = await db.query.users.findFirst({
      where: eq(users.id, requestUserId)
    });

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'name',
      //'email',
      'phoneNumber',
      'password',
      'status',
      'domains',      
      'department',
      'position',
      'rank',
    ];

    // 업데이트할 필드 검증
    const invalidFields = Object.keys(fields).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      // return NextResponse.json(
      //   { error: '업데이트 불가능한 필드가 포함되어 있습니다.' + "/n" + "invalidFields :" + invalidFields.toString(), fields: invalidFields },
      //   { status: 400 }
      // );
      console.log('업데이트 불가능한 필드가 포함되어 있습니다.' + "/n" + "invalidFields :" + invalidFields.toString(), );
    }

    // 유효한 필드만 추출
    const validUpdateFields = Object.entries(fields).reduce((acc, [key, value]) => {
      if (allowedFields.includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    

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

    // 업데이트 데이터 준비
    const updateData = {
      ...validUpdateFields,
      updated_at: new Date(),
    };

    // 업데이트 실행
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // 변경 이력 기록
    await logUserChange({
      userId: existingUser.id,
      changedBy: requestUserId,
      changedByName: requestUser.name,
      changedByEmail: requestUser.email,
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'update',
      oldData: existingUser,
      newData: updateData as Partial<IUser>,
      reason: reason ?? null,
    });

    // 비밀번호 필드 제외하고 응답
    const { password, ...userInfo } = updatedUser;
    
    return NextResponse.json(
      { 
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        data: userInfo,
      },
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