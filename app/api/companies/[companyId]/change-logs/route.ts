import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { companyChangeLogs } from '@/db/schema/companies';
import { z } from 'zod';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 쿼리 파라미터 스키마
const QueryParamsSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  changeType: z.enum(['create', 'update', 'delete']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    // UUID 검증
    if (!isValidUUID(companyId)) {
      return NextResponse.json(
        { error: '유효하지 않은 업체 ID입니다.' },
        { status: 400 }
      );
    }

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const result = QueryParamsSchema.safeParse(Object.fromEntries(searchParams));

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 쿼리 파라미터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { page, pageSize, startDate, endDate, changeType } = result.data;

    // 기본 쿼리 조건
    const conditions = [eq(companyChangeLogs.companyId, companyId)];

    // 날짜 범위 조건 추가
    if (startDate) {
      conditions.push(eq(companyChangeLogs.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(eq(companyChangeLogs.createdAt, new Date(endDate)));
    }

    // 변경 유형 조건 추가
    if (changeType) {
      conditions.push(eq(companyChangeLogs.changeType, changeType));
    }

    // 변경 이력 조회
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(companyChangeLogs)
      .where(and(...conditions));

    const logs = await db
      .select()
      .from(companyChangeLogs)
      .where(and(...conditions))
      .orderBy(desc(companyChangeLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 응답 데이터 변환
    const formattedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      data: formattedLogs,
      pagination: {
        total: totalCount.count,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount.count / pageSize),
      },
    });
  } catch (error) {
    console.error('업체 변경 이력 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체 변경 이력 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 