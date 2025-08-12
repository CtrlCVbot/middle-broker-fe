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
 * - companyId: string (필수)
 * - dateFrom: YYYY-MM-DD (기본: 이번 달 1일)
 * - dateTo: YYYY-MM-DD (기본: 오늘)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 쿼리 파라미터 파싱
    const companyId = searchParams.get('companyId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
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
    
    // 기간 설정 (기본값: 이번 달 1일 ~ 오늘)
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = dateTo ? new Date(dateTo) : new Date();
    
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