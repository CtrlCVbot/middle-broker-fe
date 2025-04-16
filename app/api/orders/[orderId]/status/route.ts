import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { eq } from 'drizzle-orm';
import { IOrderStatusUpdateRequest } from '@/types/order1';
import { getCurrentUser } from '@/utils/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = (await req.json()) as IOrderStatusUpdateRequest;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 기존 주문 조회
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, params.orderId),
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크
    if (existingOrder.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 상태 변경 가능 여부 체크
    if (!isValidStatusTransition(existingOrder.flowStatus, body.flowStatus)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 변경입니다.' },
        { status: 400 }
      );
    }

    // 상태 변경 처리
    const [updatedOrder] = await db
      .update(orders)
      .set({
        flowStatus: body.flowStatus,
        updatedBy: currentUser.id,
        updatedBySnapshot: {
          name: currentUser.name,
          email: currentUser.email,
          department: currentUser.department,
          position: currentUser.position,
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.orderId))
      .returning();

    // TODO: 상태 변경 로그 기록 (order_status_logs 테이블에 저장)

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('화물 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상태 변경 가능 여부 체크 함수
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const statusFlow = {
    등록: ['운송요청', '취소'],
    운송요청: ['배차대기', '취소'],
    배차대기: ['배차완료', '취소'],
    배차완료: ['상차대기', '취소'],
    상차대기: ['상차완료', '취소'],
    상차완료: ['운송중', '취소'],
    운송중: ['하차완료'],
    하차완료: ['운송완료'],
    운송완료: [],
    취소: [],
  };

  return statusFlow[currentStatus as keyof typeof statusFlow]?.includes(newStatus) ?? false;
} 