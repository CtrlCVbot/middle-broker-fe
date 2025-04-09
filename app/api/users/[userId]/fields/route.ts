import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { validate as uuidValidate } from 'uuid';

// 필드 값 검증을 위한 Zod 스키마
const FieldUpdateSchema = z.object({
  fields: z.array(z.object({
    field: z.enum(['status', 'system_access_level', 'name', 'phone_number', 'email', 'domains']),
    value: z.any(),
    reason: z.string().optional()
  }))
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // params를 비동기적으로 처리
    const userId = await Promise.resolve(params.userId);

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

    // 사용자 존재 여부 확인
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }

    // 업데이트할 필드 데이터 준비
    const updateData: Partial<typeof users.$inferSelect> = {};
    
    for (const { field, value } of body.fields) {
      switch (field) {
        case 'status':
          if (!['active', 'inactive', 'locked'].includes(value)) {
            return new Response(
              JSON.stringify({ error: '잘못된 상태값입니다.' }),
              { status: 400 }
            );
          }
          updateData.status = value;
          break;
          
        case 'system_access_level':
          if (!['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest'].includes(value)) {
            return new Response(
              JSON.stringify({ error: '잘못된 접근 권한입니다.' }),
              { status: 400 }
            );
          }
          updateData.system_access_level = value;
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
          break;
          
        case 'phone_number':
          updateData.phone_number = value;
          break;

        case 'name':
          updateData.name = value;
          break;

        case 'domains':
          updateData.domains = value;
          break;
      }
    }

    // 트랜잭션으로 업데이트 실행
    const updatedUser = await db.transaction(async (tx) => {
      const result = await tx
        .update(users)
        .set({
          ...updateData,
          updated_at: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
        
      return result[0];
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