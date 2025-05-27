import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { salesBundles } from '@/db/schema/salesBundles';
import { salesBundleItems } from '@/db/schema/salesBundles';


// 매출 번들 상세 정보 조회
export async function GET(
    request: NextRequest,
    { params }: { params: { saleBundleId: string } }
  ) {
    try {
      const { saleBundleId } = await params;
  
      // 매출 번들 조회
      const salesBundle = await db.query.salesBundles.findFirst({
        where: eq(salesBundles.id, saleBundleId),        
      });
  
      if (!salesBundle) {
        return NextResponse.json(
          { error: '존재하지 않는 매출 번들입니다.' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ data: salesBundle });
    } catch (error) {
      console.error('매출 번들 상세 조회 중 오류 발생:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }