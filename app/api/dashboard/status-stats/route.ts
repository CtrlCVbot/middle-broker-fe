import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/utils/auth';
import { toYMD } from '@/utils/format';

/**
 * Dashboard 배차 상태 통계 API
 * 
 * GET /api/dashboard/status-stats
 * 
 * Query Parameters:
 * - company_id: string (필수)
 * - date_from: YYYY-MM-DD (필수)
 * - date_to: YYYY-MM-DD (필수, 상한 미포함)
 * - tenant_id: string (선택)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 쿼리 파라미터 파싱
    const companyId = searchParams.get('company_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const tenantId = searchParams.get('tenant_id');
    
    // 필수 파라미터 검증
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id is required' },
        { status: 400 }
      );
    }
    
    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { success: false, error: 'date_from and date_to are required' },
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
    
    // 기간 설정
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    const fromYmd = toYMD(fromDate);
    const toYmd = toYMD(toDate);
    
    console.log(`📊 배차 상태 통계 요청: companyId=${companyId}, 기간=${fromYmd}~${toYmd}`);
    
    // 상태별 건수 집계
    const statusStatsResult = await db
      .select({
        status: orders.flowStatus,
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(and(
        eq(orders.companyId, companyId),
        gte(orders.pickupDate, fromYmd),
        lte(orders.pickupDate, toYmd)
      ))
      .groupBy(orders.flowStatus);
    
    // 총 건수 계산
    const totalCount = statusStatsResult.reduce((sum, stat) => sum + Number(stat.count), 0);
    
    // 응답 데이터 구성
    const response = {
      totalCount,
      byStatus: statusStatsResult.map(stat => ({
        status: stat.status,
        count: Number(stat.count)
      }))
    };
    
    console.log(`✅ 배차 상태 통계 완료: 총건수=${totalCount}, 상태별=${statusStatsResult.length}개`);
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ 배차 상태 통계 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 