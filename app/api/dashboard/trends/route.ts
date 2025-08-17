import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { chargeLines } from '@/db/schema/chargeLines';
import { and, eq, gte, lte, sql, isNull, isNotNull, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/utils/auth';
import { toYMD } from '@/utils/format';

/**
 * Dashboard 운송추이 통계 API
 * 
 * GET /api/dashboard/trends
 * 
 * Query Parameters:
 * - date_from: YYYY-MM-DD (필수)
 * - date_to: YYYY-MM-DD (필수, 상한 미포함)
 * - tenant_id: string (선택)
 * - company_id: string (선택)
 * - recommended_only: boolean (선택, "true" | "false")
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 쿼리 파라미터 파싱
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    //const tenantId = searchParams.get('tenant_id');
    const companyId = searchParams.get('company_id');
    const recommendedOnly = searchParams.get('recommended_only');
    
    // 필수 파라미터 검증
    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { success: false, error: 'date_from and date_to are required' },
        { status: 400 }
      );
    }
    
    // 기간 유효성 검증
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    if (fromDate >= toDate) {
      return NextResponse.json(
        { success: false, error: 'date_from must be before date_to' },
        { status: 400 }
      );
    }
    
    // 기간 상한 검증 (최대 90일)
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      return NextResponse.json(
        { success: false, error: 'Date range cannot exceed 90 days' },
        { status: 400 }
      );
    }
    
    // 권한 검증 (현재 사용자의 회사 ID와 일치하는지 확인)
    // const currentUser = getCurrentUser();
    // if (currentUser?.companyId && companyId && currentUser.companyId !== companyId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Access denied' },
    //     { status: 403 }
    //   );
    // }
    
    // 실제 사용할 company_id 결정
    const effectiveCompanyId = companyId; //|| currentUser?.companyId;
    
    console.log(`📊 운송추이 통계 요청: companyId=${effectiveCompanyId}, 기간=${dateFrom}~${dateTo}, 추천만=${recommendedOnly}`);
    
    
    
    
    // 1. 기간 내 주문 조회 (필터링)
    const orderQuery = db
      .select({
        id: orders.id,
        pickupDate: orders.pickupDate,
        //isRecommended: orders.isRecommended,
      })
      .from(orders)
      .where(and(
        gte(orders.pickupDate, toYMD(fromDate)),
        lte(orders.pickupDate, toYMD(toDate)),
        effectiveCompanyId ? eq(orders.companyId, effectiveCompanyId) : undefined,
        //tenantId ? eq(orders.tenantId, tenantId) : undefined,
        //recommendedOnly === 'true' ? isNotNull(orders.isRecommended) : undefined,
      ));
    
    const filteredOrders = await orderQuery;

    console.log("filteredOrders", filteredOrders);
    
    // 2. 주문별 운송 비용 집계
    const orderIds = filteredOrders.map(o => o.id);
    let orderAmounts: { orderId: string; amount: number }[] = [];
    
    console.log("orderIds", orderIds);
    if (orderIds.length > 0) {
      const chargeQuery = db
        .select({
          orderId: chargeGroups.orderId,
          amount: sql<number>`SUM(${chargeLines.amount})`,
        })
        .from(chargeGroups)
        .innerJoin(chargeLines, eq(chargeLines.groupId, chargeGroups.id))
        .where(and(
          //sql`${chargeGroups.orderId} IN (${orderIds.join(',')})`,
          inArray(chargeGroups.orderId, orderIds),
          //eq(chargeGroups.billable, true),
          eq(chargeLines.side, 'sales') // side 조건 추가
        ))
        .groupBy(chargeGroups.orderId);
      
      const chargeResults = await chargeQuery;
      console.log("chargeResults", chargeResults);
      orderAmounts = chargeResults.map(r => ({
        orderId: r.orderId,
        amount: Number(r.amount) || 0,
      }));
    }
    
    // 3. 일자별 집계
    const dailyStats = new Map<string, { count: number; amount: number }>();
    
    // 모든 일자 초기화 (0으로 채움)
    const currentDate = new Date(fromDate);
    while (currentDate < toDate) {
      const dateKey = toYMD(currentDate);
      dailyStats.set(dateKey, { count: 0, amount: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 실제 데이터로 집계
    filteredOrders.forEach(order => {
      const dateKey = toYMD(new Date(order.pickupDate ?? ''));
      const existing = dailyStats.get(dateKey);
      if (existing) {
        existing.count += 1;
        
        // 해당 주문의 운송 비용 찾기
        const orderAmount = orderAmounts.find(oa => oa.orderId === order.id);
        if (orderAmount) {
          existing.amount += orderAmount.amount;
        }
      }
    });
    
    // 4. 응답 데이터 구성
    const points = Array.from(dailyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        date,
        orderCount: stats.count,
        orderAmount: stats.amount,
      }));
    
    const response = {
      period: { from: dateFrom, to: dateTo },
      points,
      meta: { currency: 'KRW' as const }
    };
    
    console.log(`✅ 운송추이 통계 완료: 기간=${daysDiff}일, 총건수=${points.reduce((sum, p) => sum + p.orderCount, 0)}, 총금액=${points.reduce((sum, p) => sum + p.orderAmount, 0)}`);
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ 운송추이 통계 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 