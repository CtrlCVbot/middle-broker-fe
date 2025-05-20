import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { chargeLines, chargeSideEnum } from '@/db/schema/chargeLines';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 운임 라인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const groupId = searchParams.get('groupId');
    const side = searchParams.get('side');
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (groupId) {
      conditions.push(eq(chargeLines.groupId, groupId));
    }

    if (side && chargeSideEnum.enumValues.includes(side as any)) {
      conditions.push(eq(chargeLines.side, side as any));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(chargeLines.createdAt) : asc(chargeLines.createdAt)
      : sortOrder === 'desc' ? desc(chargeLines.updatedAt) : asc(chargeLines.updatedAt);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(chargeLines)
        .where(query)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(chargeLines)
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
    console.error('운임 라인 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 라인 생성 스키마
const CreateChargeLineSchema = z.object({
  groupId: z.string().uuid(),
  side: z.enum(chargeSideEnum.enumValues),
  amount: z.number().nonnegative(),
  memo: z.string().optional(),
  taxRate: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional()
});

// 운임 라인 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreateChargeLineSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // 그룹 존재 여부 및 잠금 상태 확인
    const chargeGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.id, data.groupId)
    });
    
    if (!chargeGroup) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 그룹입니다.' },
        { status: 404 }
      );
    }
    
    if (chargeGroup.isLocked) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹에는 라인을 추가할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 세금 자동 계산 (taxAmount가 제공되지 않은 경우)
    if (data.taxRate && !data.taxAmount) {
      data.taxAmount = Number((data.amount * (data.taxRate / 100)).toFixed(2));
    }
    
    // 운임 라인 생성
    const newChargeLine = await db.insert(chargeLines).values({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    }).returning();

    return NextResponse.json(
      { message: '운임 라인이 생성되었습니다.', data: newChargeLine[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('운임 라인 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 