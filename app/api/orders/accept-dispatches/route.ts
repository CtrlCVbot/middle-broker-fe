import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { eq, and, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/utils/auth';
import { z } from 'zod';
import { users } from '@/db/schema/users';
import { companies } from '@/db/schema/companies';
import { IUserSnapshot } from '@/types/order';

// 요청 스키마 검증
const acceptDispatchesSchema = z.object({
  orderIds: z.array(z.string()),
  currentUser: z.any()
});

export async function POST(request: NextRequest) {
  try {
    
    
    // 요청 데이터 파싱 및 검증
    const requestData = await request.json();
    const validatedData = acceptDispatchesSchema.parse(requestData);
    
    const { orderIds, currentUser } = validatedData;

    const requestUserId = currentUser.id;
   //console.log('request:', request);
    console.log('requestUserId:', requestUserId);

    if (!requestUserId || requestUserId.length < 1) {
        return NextResponse.json(
          { error: '요청 사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();
    
    
    if (!requestUser) {
      return NextResponse.json(
        { success: false, message: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // user.companyId가 존재하는지 확인 후 쿼리 실행
    if (!requestUser.company_id) {
        return NextResponse.json(
        { error: '회사 정보가 없습니다.' },
        { status: 400 }
        );
    }

    // 요청 사용자 정보 조회
    const [requestCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, requestUser.company_id))
      .limit(1)
      .execute();

    if (!requestCompany) {
      return NextResponse.json(
        { error: '요청 회사를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
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
      
      for (const currentOrderId of orderIds) {
        const insertResult = await tx.insert(orderDispatches).values({
          orderId: currentOrderId,
          brokerFlowStatus: '배차대기',
          brokerCompanyId: requestUser.company_id,
          brokerCompanySnapshot: {...requestCompany},
          brokerManagerId: requestUserId,
          brokerManagerSnapshot: {...requestUser},
          createdBy: requestUserId,
          createdBySnapshot: {...requestUser},
          updatedBy: requestUserId,
          updatedBySnapshot: {...requestUser},
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);  //as any 필수!
        
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
    console.error('운송 수락 처리 중 오류 발생2:', error);
    
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