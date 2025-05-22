import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { orderSales } from '@/db/schema/orderSales';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

/**
 * 디스패치 매출 정산 상태 확인 API
 * GET /api/broker/dispatches/[id]/sales-status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    const dispatchId = params.id;

    // 디스패치 정보 조회
    const dispatch = await db.query.orderDispatches.findFirst({
      where: eq(orderDispatches.id, dispatchId),
      with: {
        order: true
      }
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: '해당 디스패치 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const orderId = dispatch.orderId;

    // 해당 주문에 대한 매출 정산 정보 조회
    const sale = await db.query.orderSales.findFirst({
      where: eq(orderSales.orderId, orderId)
    });

    // 매출 정산 상태 반환
    return NextResponse.json({
      data: {
        hasSales: !!sale,
        salesId: sale?.id,
        salesStatus: sale?.status,
        isClosed: dispatch.isClosed
      },
      message: '디스패치 매출 정산 상태를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('디스패치 매출 정산 상태 확인 중 오류 발생:', error);
    return NextResponse.json(
      { error: '디스패치 매출 정산 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 