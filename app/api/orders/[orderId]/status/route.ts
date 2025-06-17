import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { logOrderChange } from '@/utils/order-change-logger';
import { IUserSnapshot } from '@/types/order-ver01';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 화물 상태 변경 요청 스키마
const UpdateOrderStatusSchema = z.object({
  flowStatus: z.enum([
    '운송요청',
    '배차대기',
    '배차완료',
    '상차대기',
    '상차완료',
    '운송중',
    '하차완료',
    '운송완료'
  ]),
  reason: z.string().optional()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = (await params);

    // UUID 형식 검증
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: '잘못된 화물 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = UpdateOrderStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { flowStatus, reason } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 화물 존재 여부 확인
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .execute();

    if (!existingOrder) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 취소된 화물인지 확인
    if (existingOrder.isCanceled) {
      return NextResponse.json(
        { error: '취소된 화물의 상태는 변경할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 동일한 상태로의 변경인지 확인
    if (existingOrder.flowStatus === flowStatus) {
      return NextResponse.json(
        { error: '현재와 동일한 상태로는 변경할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 현재 시간
    const now = new Date();

    // 화물 상태 업데이트
    const [updatedOrder] = await db
      .update(orders)
      .set({
        flowStatus,
        updatedBy: requestUserId,
        updatedBySnapshot: {
          name: requestUser.name,
          email: requestUser.email,
          mobile: requestUser.phone_number,
          department: requestUser.department,
          position: requestUser.position,
        } as IUserSnapshot,
        updatedAt: now
      })
      .where(eq(orders.id, orderId))
      .returning();

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      await logOrderChange({
        orderId: updatedOrder.id,
        changedBy: requestUserId,
        changedByName: requestUser.name,
        changedByEmail: requestUser.email,
        changedByAccessLevel: requestUser.system_access_level,
        changeType: 'updateStatus',
        oldData: existingOrder,
        newData: updatedOrder,
        reason: reason || `화물 상태 변경: ${existingOrder.flowStatus} → ${flowStatus}`
      });
    }

    return NextResponse.json({
      message: '화물 상태가 성공적으로 변경되었습니다.',
      id: orderId,
      previousStatus: existingOrder.flowStatus,
      currentStatus: flowStatus,
      updatedAt: now.toISOString()
    });
  } catch (error) {
    console.error('화물 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 