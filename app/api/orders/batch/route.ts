import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { z } from 'zod';
import { logOrderChange } from '@/utils/order-change-logger';

// 일괄 처리 요청 스키마
const BatchProcessSchema = z.object({
  orderIds: z.array(z.string().uuid()),
  action: z.enum(['cancel', 'delete', 'updateStatus']),
  flowStatus: z.enum([
    '운송요청',
    '배차대기',
    '배차완료',
    '상차대기',
    '상차완료',
    '운송중',
    '하차완료',
    '운송완료'
  ]).optional(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const result = BatchProcessSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { orderIds, action, flowStatus, reason } = result.data;
    const requestUserId = request.headers.get('x-user-id') || 'system';

    // 화물 존재 여부 확인
    const existingOrders = await db
      .select()
      .from(orders)
      .where(inArray(orders.id, orderIds));

    if (existingOrders.length !== orderIds.length) {
      return NextResponse.json(
        { error: '존재하지 않는 화물이 포함되어 있습니다.' },
        { status: 404 }
      );
    }

    // 일괄 처리 수행
    switch (action) {
      case 'cancel':
        await db
          .update(orders)
          .set({
            isCanceled: true,
            updatedAt: new Date(),
            updatedBy: requestUserId
          })
          .where(inArray(orders.id, orderIds));
        break;

      case 'delete':
        // 실제 삭제 대신 소프트 삭제(취소)를 수행하거나, 필요한 경우 실제 삭제 구현
        await db
          .update(orders)
          .set({
            isCanceled: true,
            updatedAt: new Date(),
            updatedBy: requestUserId
          })
          .where(inArray(orders.id, orderIds));
        break;

      case 'updateStatus':
        if (!flowStatus) {
          return NextResponse.json(
            { error: '상태 변경 작업에는 flowStatus 필드가 필요합니다.' },
            { status: 400 }
          );
        }
        
        await db
          .update(orders)
          .set({
            flowStatus: flowStatus,
            updatedAt: new Date(),
            updatedBy: requestUserId
          })
          .where(inArray(orders.id, orderIds));
        break;
    }

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      for (const order of existingOrders) {
        let changeType = 'update';
        if (action === 'cancel') changeType = 'cancel';
        if (action === 'delete') changeType = 'delete';
        
        let newData = null;
        if (action === 'updateStatus') {
          newData = {
            ...order,
            flowStatus: flowStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: requestUserId
          };
        } else if (action === 'cancel') {
          newData = {
            ...order,
            isCanceled: true,
            updatedAt: new Date().toISOString(),
            updatedBy: requestUserId
          };
        }
        
        await logOrderChange({
          orderId: order.id,
          changedBy: requestUserId,
          changedByName: request.headers.get('x-user-name') || 'system',
          changedByEmail: request.headers.get('x-user-email') || 'system',
          changedByAccessLevel: request.headers.get('x-user-access-level') || 'system',
          changeType: changeType as 'cancel' | 'delete' | 'updateStatus' | 'update' | 'create',
          oldData: order,
          newData: newData,
          reason: reason || undefined
        });
      }
    }

    return NextResponse.json({
      message: '화물 일괄 처리가 성공적으로 완료되었습니다.',
      data: {
        processedCount: orderIds.length,
        action,
        flowStatus: action === 'updateStatus' ? flowStatus : undefined
      },
    });
  } catch (error) {
    console.error('화물 일괄 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 