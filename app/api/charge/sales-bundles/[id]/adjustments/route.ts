import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { salesBundleAdjustments, salesBundles } from '@/db/schema/salesBundles';
import { 
  ICreateBundleAdjustmentInput, 
  IUpdateBundleAdjustmentInput,
  ISalesBundleAdjustment
} from '@/types/broker-charge';
import { z } from 'zod';

// 입력 유효성 검증 스키마
const createSchema = z.object({
  type: z.enum(['discount', 'surcharge']),
  description: z.string().optional(),
  amount: z.number(),
  taxAmount: z.number().optional().default(0)
});

const updateSchema = z.object({
  type: z.enum(['discount', 'surcharge']).optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  taxAmount: z.number().optional()
});

/**
 * GET: 통합 추가금 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 정산 그룹 존재 확인
    const bundle = await db
      .select()
      .from(salesBundles)
      .where(eq(salesBundles.id, id))
      .limit(1);

    if (bundle.length === 0) {
      return NextResponse.json(
        { error: '정산 그룹을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 통합 추가금 목록 조회
    const adjustments = await db
      .select()
      .from(salesBundleAdjustments)
      .where(eq(salesBundleAdjustments.bundleId, id))
      .orderBy(salesBundleAdjustments.createdAt);

    return NextResponse.json({
      data: adjustments,
      message: '통합 추가금 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('통합 추가금 조회 중 오류:', error);
    return NextResponse.json(
      { error: '통합 추가금 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 통합 추가금 생성
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 입력 유효성 검증
    const validatedData = createSchema.parse(body);

    // 정산 그룹 존재 확인
    const bundle = await db
      .select()
      .from(salesBundles)
      .where(eq(salesBundles.id, id))
      .limit(1);

    if (bundle.length === 0) {
      return NextResponse.json(
        { error: '정산 그룹을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 사용자 ID (실제 구현 시 인증에서 가져와야 함)
    //const currentUserId = 'current-user-id'; // TODO: 실제 인증 구현
    const currentUserId = request.headers.get('x-user-id');
    if (!currentUserId) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.', details: 'x-user-id 헤더가 없습니다.' },
        { status: 401 }
      );
    }

    // 통합 추가금 생성
    const [newAdjustment] = await db
      .insert(salesBundleAdjustments)
      .values({
        bundleId: id,
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount.toString(),
        taxAmount: validatedData.taxAmount.toString(),
        createdBy: currentUserId
      })
      .returning();

    return NextResponse.json({
      data: newAdjustment,
      message: '통합 추가금을 성공적으로 생성했습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('통합 추가금 생성 중 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '통합 추가금 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 통합 추가금 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adjustmentId, ...updateData } = body;

    if (!adjustmentId) {
      return NextResponse.json(
        { error: '추가금 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 유효성 검증
    const validatedData = updateSchema.parse(updateData);

    // 추가금 존재 및 소유권 확인
    const existingAdjustment = await db
      .select()
      .from(salesBundleAdjustments)
      .where(and(
        eq(salesBundleAdjustments.id, adjustmentId),
        eq(salesBundleAdjustments.bundleId, id)
      ))
      .limit(1);

    if (existingAdjustment.length === 0) {
      return NextResponse.json(
        { error: '추가금을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 수정할 데이터 준비
    const updateValues: any = {};
    if (validatedData.type !== undefined) updateValues.type = validatedData.type;
    if (validatedData.description !== undefined) updateValues.description = validatedData.description;
    if (validatedData.amount !== undefined) updateValues.amount = validatedData.amount.toString();
    if (validatedData.taxAmount !== undefined) updateValues.taxAmount = validatedData.taxAmount.toString();

    // 통합 추가금 수정
    const [updatedAdjustment] = await db
      .update(salesBundleAdjustments)
      .set(updateValues)
      .where(eq(salesBundleAdjustments.id, adjustmentId))
      .returning();

    return NextResponse.json({
      data: updatedAdjustment,
      message: '통합 추가금을 성공적으로 수정했습니다.'
    });
  } catch (error) {
    console.error('통합 추가금 수정 중 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '통합 추가금 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 통합 추가금 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adjustmentId = searchParams.get('adjustmentId');

    if (!adjustmentId) {
      return NextResponse.json(
        { error: '추가금 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 추가금 존재 및 소유권 확인
    const existingAdjustment = await db
      .select()
      .from(salesBundleAdjustments)
      .where(and(
        eq(salesBundleAdjustments.id, adjustmentId),
        eq(salesBundleAdjustments.bundleId, id)
      ))
      .limit(1);

    if (existingAdjustment.length === 0) {
      return NextResponse.json(
        { error: '추가금을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 통합 추가금 삭제
    await db
      .delete(salesBundleAdjustments)
      .where(eq(salesBundleAdjustments.id, adjustmentId));

    return NextResponse.json({
      message: '통합 추가금을 성공적으로 삭제했습니다.'
    });
  } catch (error) {
    console.error('통합 추가금 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '통합 추가금 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
