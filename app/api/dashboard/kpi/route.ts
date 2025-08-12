import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { chargeLines } from '@/db/schema/chargeLines';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/utils/auth';
import { kstMonthRangeBy } from '@/lib/date-kst';
import { toYMD } from '@/utils/format';

/**
 * Dashboard KPI API
 * 
 * GET /api/dashboard/kpi
 * 
 * Query Parameters:
 * - companyId: string (필수)
 * - period: 'month' | 'custom' (기본: month)
 * - date: YYYY-MM-DD (기본: 오늘, KST 기준)
 * - from, to: ISO8601 (custom일 때만)
 * - basisField: 'pickupDate' | 'deliveryDate' (기본: pickupDate)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 쿼리 파라미터 파싱
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') as 'month' | 'custom' || 'month';
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const basisField = searchParams.get('basisField') as 'pickupDate' | 'deliveryDate' || 'pickupDate';
    
    // 필수 파라미터 검증
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      );
    }
    
    // 권한 검증 (현재 사용자의 회사 ID와 일치하는지 확인)
    // const currentUser = getCurrentUser();
    // if (!currentUser || currentUser.companyId !== companyId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Access denied' },
    //     { status: 403 }
    //   );
    // }
    
    // 기간 계산
    let dateFrom: Date, dateTo: Date;
    
    if (period === 'month') {
      const baseDate = date ? new Date(date) : new Date();
      const { from: fromStr, to: toStr } = kstMonthRangeBy(baseDate);
      dateFrom = new Date(fromStr);
      dateTo = new Date(toStr);
    } else if (period === 'custom' && from && to) {
      dateFrom = new Date(from);
      dateTo = new Date(to);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid date parameters' },
        { status: 400 }
      );
    }
    const fromYmd = toYMD(dateFrom); // "2025-08-01"
    const toYmd   = toYMD(dateTo);   // "2025-08-31" 또는 오늘
    
    // 집계 기준 필드 결정
    const basisFieldColumn = basisField === 'deliveryDate' ? orders.deliveryDate : orders.pickupDate;
    
    console.log(`📊 KPI 집계 요청: companyId=${companyId}, period=${period}, basisField=${basisField}`);
    console.log(`📅 기간: ${dateFrom.toISOString()} ~ ${dateTo.toISOString()}`);

    
    
    
    // 1) 운송 건수 집계
    const orderCountResult = await db
      .select({ 
        count: sql<number>`COUNT(DISTINCT ${orders.id})` 
      })
      .from(orders)
      .where(and(
        eq(orders.companyId, companyId),
        gte(basisFieldColumn, dateFrom.toISOString()),
        lte(basisFieldColumn, dateTo.toISOString())
      ));
    
    const orderCount = Number(orderCountResult[0]?.count || 0);
    
    // 2) 총 운송 비용 집계 (sales 합계)
    const amountSumResult = await db
      .select({
        amountSum: sql<number>`COALESCE(SUM(${chargeLines.amount}), 0)`
      })
      .from(chargeLines)
      .innerJoin(chargeGroups, eq(chargeLines.groupId, chargeGroups.id))
      .innerJoin(orders, eq(chargeGroups.orderId, orders.id))
      .where(and(
        eq(orders.companyId, companyId),
        gte(basisFieldColumn, fromYmd),
        lte(basisFieldColumn, toYmd),
        eq(chargeLines.side, 'sales')
      ));
    
    const totalAmount = Math.round(Number(amountSumResult[0]?.amountSum || 0));
    const averageAmount = orderCount > 0 ? Math.round(totalAmount / orderCount) : 0;
    
    // 응답 데이터 구성
    const response = {
      monthlyOrderCount: orderCount,
      monthlyOrderAmount: totalAmount,
      monthlyOrderAverage: averageAmount,
      weeklyTarget: {
        target: 100,
        current: Math.min(orderCount, 100),
        percentage: Math.min(Math.round((orderCount / 100) * 100), 100)
      },
      monthlyTarget: {
        target: 350,
        current: Math.min(orderCount, 350),
        percentage: Math.min(Math.round((orderCount / 350) * 100), 100)
      },
      meta: {
        companyId,
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        basisField,
        currency: 'KRW'
      }
    };
    
    console.log(`✅ KPI 집계 완료: 건수=${orderCount}, 금액=${totalAmount}, 평균=${averageAmount}`);
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ KPI 집계 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 