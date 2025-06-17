import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { addressChangeLogs } from '@/db/schema/addressChangeLogs';
import { z } from 'zod';


// UUID 검증
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 쿼리 파라미터 스키마
const QueryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  changeType: z.enum(['create', 'update', 'delete']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 주소 ID입니다.' },
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

    const { page, limit, startDate, endDate, changeType } = result.data;

    // 기본 쿼리 조건
    const conditions = [eq(addressChangeLogs.addressId, id)];

    // 날짜 범위 조건 추가
    if (startDate) {
      conditions.push(sql`${addressChangeLogs.createdAt} >= ${new Date(startDate)}`);
    }
    if (endDate) {
      conditions.push(sql`${addressChangeLogs.createdAt} <= ${new Date(endDate)}`);
    }

    // 변경 유형 조건 추가
    if (changeType) {
      conditions.push(eq(addressChangeLogs.changeType, changeType));
    }

    // 전체 개수 조회
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(addressChangeLogs)
      .where(and(...conditions));

    // 변경 이력 조회
    const logs = await db
      .select()
      .from(addressChangeLogs)
      .where(and(...conditions))
      .orderBy(desc(addressChangeLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 응답 데이터 변환
    const formattedLogs = logs.map(log => ({
      ...log,
      createdAt: log.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      data: formattedLogs,
      pagination: {
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error('주소 변경 이력 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 변경 이력 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 