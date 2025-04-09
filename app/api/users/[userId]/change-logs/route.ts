import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { user_change_logs } from '@/db/schema/users';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { validate as uuidValidate } from 'uuid';
import { IChangeLogResponse, IUserChangeLog } from '@/types/user';

// 쿼리 파라미터 검증 스키마
const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  changeType: z.enum(['create', 'update', 'status_change', 'delete']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

type Context = {
  params: {
    userId: string;
  };
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const { userId } = context.params;

    // UUID 형식 검증
    if (!uuidValidate(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // URL 검색 파라미터 파싱
    const searchParams = Object.fromEntries(new URL(request.url).searchParams);
    
    // 검색 파라미터 검증
    const validationResult = QuerySchema.safeParse(searchParams);
    if (!validationResult.success) {
      return NextResponse.json({
        error: '잘못된 검색 파라미터입니다.',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { page, pageSize, changeType, startDate, endDate } = validationResult.data;

    // 기본 where 조건
    let whereConditions = [eq(user_change_logs.user_id, userId)];

    // 추가 필터 조건
    if (changeType) {
      whereConditions.push(eq(user_change_logs.change_type, changeType));
    }
    if (startDate) {
      whereConditions.push(gte(user_change_logs.created_at, new Date(startDate)));
    }
    if (endDate) {
      whereConditions.push(lte(user_change_logs.created_at, new Date(endDate)));
    }

    // 전체 레코드 수 조회
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(user_change_logs)
      .where(and(...whereConditions))
      .execute()
      .then(result => Number(result[0].count));

    // 변경 이력 조회
    const items = await db
      .select()
      .from(user_change_logs)
      .where(and(...whereConditions))
      .orderBy(desc(user_change_logs.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const response: IChangeLogResponse = {
      items: items as IUserChangeLog[],
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('사용자 변경 이력 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 