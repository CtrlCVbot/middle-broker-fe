import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
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
  status: z.enum(['active', 'inactive']).optional(),
  systemAccessLevel: z.enum(['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;

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

    const { page, pageSize, status, systemAccessLevel } = result.data;

    // 기본 쿼리 조건
    const conditions = [eq(users.company_id, companyId)];

    // 상태 조건 추가
    if (status) {
      conditions.push(eq(users.status, status));
    }

    // 시스템 접근 레벨 조건 추가
    if (systemAccessLevel) {
      conditions.push(eq(users.system_access_level, systemAccessLevel));
    }

    // 사용자 조회
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const companyUsers = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 응답 데이터 변환
    const formattedUsers = companyUsers.map((user) => ({
      ...user,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
    }));

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        total: totalCount.count,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount.count / pageSize),
      },
    });
  } catch (error) {
    console.error('업체별 사용자 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체별 사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 