import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { companyWarnings } from '@/db/schema/companyWarnings';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 정렬 순서 변경 스키마
const sortOrderSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int().min(0)
    })
  ).min(1)
});

/**
 * POST /api/companies/[companyId]/warnings/sort
 * 주의사항 정렬 순서 일괄 변경
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const { companyId } = params;
    const body = await request.json();

    // 요청 검증
    const validationResult = sortOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: '입력 데이터가 유효하지 않습니다.', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { orders } = validationResult.data;
    
    // 모든 주의사항 ID 배열
    const warningIds = orders.map(order => order.id);
    
    // 해당 업체의 주의사항인지 확인
    const existingWarnings = await db.query.companyWarnings.findMany({
      where: and(
        eq(companyWarnings.companyId, companyId),
        inArray(companyWarnings.id, warningIds)
      ),
    });

    // 존재 확인 - 요청한 ID 개수와 실제 찾은 주의사항 개수가 일치해야 함
    if (existingWarnings.length !== warningIds.length) {
      return NextResponse.json(
        { message: '일부 주의사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 일괄 업데이트
    await db.transaction(async (tx) => {
      for (const order of orders) {
        await tx.update(companyWarnings)
          .set({
            sortOrder: order.sortOrder,
            updatedBy: session.user.id,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(companyWarnings.id, order.id),
              eq(companyWarnings.companyId, companyId)
            )
          );
      }
    });

    return NextResponse.json(
      { message: '주의사항 정렬 순서가 업데이트되었습니다.', success: true }
    );
  } catch (error) {
    console.error('주의사항 정렬 순서 변경 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 정렬 순서 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 