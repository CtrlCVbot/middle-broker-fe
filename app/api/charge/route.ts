import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { chargeGroups, chargeReasonEnum, chargeStageEnum } from '@/db/schema/chargeGroups';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 그룹 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const orderId = searchParams.get('orderId');
    const dispatchId = searchParams.get('dispatchId');
    const stage = searchParams.get('stage');
    const reason = searchParams.get('reason');
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (orderId) {
      conditions.push(eq(chargeGroups.orderId, orderId));
    }

    if (dispatchId) {
      conditions.push(eq(chargeGroups.dispatchId, dispatchId));
    }

    if (stage && chargeStageEnum.enumValues.includes(stage as any)) {
      conditions.push(eq(chargeGroups.stage, stage as any));
    }

    if (reason && chargeReasonEnum.enumValues.includes(reason as any)) {
      conditions.push(eq(chargeGroups.reason, reason as any));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(chargeGroups.createdAt) : asc(chargeGroups.createdAt)
      : sortOrder === 'desc' ? desc(chargeGroups.updatedAt) : asc(chargeGroups.updatedAt);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(chargeGroups)
        .where(query)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(chargeGroups)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);
    
    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('운임 그룹 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 그룹 생성 스키마
const CreateChargeGroupSchema = z.object({
  orderId: z.string().uuid(),
  dispatchId: z.string().uuid().optional(),
  stage: z.enum(chargeStageEnum.enumValues),
  reason: z.enum(chargeReasonEnum.enumValues),
  description: z.string().optional()
});

// 운임 그룹 생성
export async function POST(request: NextRequest) {
  try {    
    console.log("운임 그룹 생성 요청 POST 시작");
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }
    //const userId = session.user.id;
    const userId = request.headers.get('x-user-id') || '';
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    console.log("userId", userId);
    const body = await request.json();
    console.log("운임 그룹 생성 요청 POST 데이터", body);
    // 요청 데이터 검증
    const validationResult = CreateChargeGroupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    console.log("운임 그룹 생성 요청 POST 데이터 검증 통과");

    // 운임 그룹 생성
    const newChargeGroup = await db.insert(chargeGroups).values({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    }).returning();
    console.log("운임 그룹 생성 요청 POST 데이터 검증 통과");
    return NextResponse.json(
      { message: '운임 그룹이 생성되었습니다.', data: newChargeGroup[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('운임 그룹 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 