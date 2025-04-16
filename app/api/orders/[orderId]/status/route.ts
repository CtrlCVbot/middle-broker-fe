import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { eq } from 'drizzle-orm';
import { IOrderStatusUpdateRequest } from '@/types/order1';

// 상태 전이 유효성 검사
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: { [key: string]: string[] } = {
    PENDING: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = (await req.json()) as IOrderStatusUpdateRequest;

    // 주문 조회
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 전이 유효성 검사
    if (!isValidStatusTransition(order[0].status, body.status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 변경입니다.' },
        { status: 400 }
      );
    }

    // 상태 업데이트
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: body.status,
        updated_by: body.userId,
        updated_by_snapshot: body.userSnapshot,
      })
      .where(eq(orders.id, orderId))
      .returning();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('화물 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 