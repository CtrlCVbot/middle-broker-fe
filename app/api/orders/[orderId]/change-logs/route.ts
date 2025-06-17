import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderChangeLogs } from '@/db/schema/orderChangeLogs';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = (await params);
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;

    // UUID 형식 검증
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: '잘못된 화물 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 화물 존재 여부 확인
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .execute();

    if (!order) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 변경 이력 조회
    const changeLogs = await db
      .select()
      .from(orderChangeLogs)
      .where(eq(orderChangeLogs.orderId, orderId))
      .orderBy(desc(orderChangeLogs.changedAt))
      .limit(pageSize)
      .offset(offset)
      .execute();

    // 총 이력 수 조회
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(orderChangeLogs)
      .where(eq(orderChangeLogs.orderId, orderId))
      .execute();

    // 응답 데이터 변환
    const formattedLogs = changeLogs.map(log => ({
      id: log.id,
      orderId: log.orderId,
      changeType: log.changeType,
      changedBy: {
        id: log.changedBy,
        name: log.changedByName,
        email: log.changedByEmail,
        accessLevel: log.changedByAccessLevel
      },
      changedAt: log.changedAt?.toISOString(),
      oldData: log.oldData,
      newData: log.newData,
      reason: log.reason || ''
    }));

    return NextResponse.json({
      data: formattedLogs,
      total: Number(count),
      page,
      pageSize,
      totalPages: Math.ceil(Number(count) / pageSize)
    });
  } catch (error) {
    console.error('화물 변경 이력 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 