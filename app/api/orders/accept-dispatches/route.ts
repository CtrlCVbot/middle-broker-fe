import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { eq, and, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/utils/auth';
import { z } from 'zod';

// 요청 스키마 검증
const acceptDispatchesSchema = z.object({
  orderIds: z.array(z.string()),
  dispatchData: z.object({
    agreedFreightCost: z.number(),
    assignedVehicleType: z.string(),
    assignedVehicleWeight: z.string(),
    memo: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    // 요청 데이터 파싱 및 검증
    const requestData = await request.json();
    const validatedData = acceptDispatchesSchema.parse(requestData);
    
    const { orderIds, dispatchData } = validatedData;
    
    if (orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '선택된 주문이 없습니다.' },
        { status: 400 }
      );
    }
    
    // 트랜잭션으로 처리
    const result = await db.transaction(async (tx) => {
      // 주문 상태 변경
      await tx
        .update(orders)
        .set({ flowStatus: '배차대기' })
        .where(inArray(orders.id, orderIds));
      
      // 각 주문에 대한 배차 정보 생성
      const insertResults = [];
      
      for (const orderId of orderIds) {
        const insertResult = await tx.insert(orderDispatches).values({
          orderId,
          brokerCompanyId: user.companyId,
          brokerCompanySnapshot: { name: user.company?.name || '' },
          brokerManagerId: user.id,
          brokerManagerSnapshot: { name: user.name },
          assignedVehicleType: dispatchData.assignedVehicleType,
          assignedVehicleWeight: dispatchData.assignedVehicleWeight,
          agreedFreightCost: dispatchData.agreedFreightCost,
          brokerMemo: dispatchData.memo,
          createdBy: user.id,
          createdBySnapshot: { name: user.name },
          updatedBy: user.id,
          updatedBySnapshot: { name: user.name },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        insertResults.push(insertResult);
      }
      
      return {
        updatedOrders: orderIds.length,
        insertedDispatches: insertResults.length,
      };
    });
    
    return NextResponse.json({
      success: true,
      message: `${result.updatedOrders}개 화물에 대해 운송 수락 처리가 완료되었습니다.`,
      data: result,
    });
  } catch (error) {
    console.error('운송 수락 처리 중 오류 발생:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '잘못된 요청 형식입니다.', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 