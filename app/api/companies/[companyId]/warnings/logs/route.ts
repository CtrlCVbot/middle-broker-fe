import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { companyWarningLogs } from '@/db/schema/companyWarningLogs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

/**
 * GET /api/companies/[companyId]/warnings/logs
 * 업체 주의사항 변경 로그 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const companyId = (await params).companyId;

    // 업체 존재 여부 확인
    const companyExists = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!companyExists) {
      return NextResponse.json(
        { message: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // URL 쿼리 파라미터 추출
    const url = new URL(request.url);
    const warningId = url.searchParams.get('warningId');

    // 쿼리 조건 배열로 변경
    const conditions = [eq(companyWarningLogs.companyId, companyId)];
    if (warningId) {
      conditions.push(eq(companyWarningLogs.warningId, warningId));
    }

    // 로그 조회 (최신순)
    const logs = await db.query.companyWarningLogs.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: [desc(companyWarningLogs.createdAt)],
      with: {
        // User 정보가 필요한 경우 추가할 수 있음
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('주의사항 변경 로그 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 변경 로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 