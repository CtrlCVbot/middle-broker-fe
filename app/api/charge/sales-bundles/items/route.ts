import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { salesBundles, salesBundleStatusEnum } from '@/db/schema/salesBundles';
import { salesBundleItems } from '@/db/schema/salesBundles';
import { salesBundleAdjustments, bundleAdjTypeEnum } from '@/db/schema/salesBundles';
import { orderSales } from '@/db/schema/orderSales';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';

// 매출 번들 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    
    
    // 필터 파라미터
    const salesBundleId = searchParams.get('salesBundleId');    
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (salesBundleId) {
      conditions.push(eq(salesBundles.id, salesBundleId));
    }

    

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(salesBundles.createdAt) : asc(salesBundles.createdAt)
      : sortOrder === 'desc' ? desc(salesBundles.periodFrom) : asc(salesBundles.periodFrom);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(salesBundleItems)
        .where(query)
        .orderBy(orderBy)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(salesBundleItems)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);
    
    return NextResponse.json({
      data: result,
      total
    });
  } catch (error) {
    console.error('매출 통합 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}