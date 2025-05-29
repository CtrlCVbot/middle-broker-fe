import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { salesItemAdjustments, salesBundleItems } from '@/db/schema/salesBundles';
import { 
  ICreateItemAdjustmentInput, 
  IUpdateItemAdjustmentInput,
  ISalesItemAdjustment
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
 * GET: 개별 화물 추가금 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 화물 항목 존재 확인
    const bundleItem = await db
      .select()
      .from(salesBundleItems)
      .where(eq(salesBundleItems.id, id))
      .limit(1);

    if (bundleItem.length === 0) {
      return NextResponse.json(
        { error: '화물 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 개별 화물 추가금 목록 조회
    const adjustments = await db
      .select()
      .from(salesItemAdjustments)
      .where(eq(salesItemAdjustments.bundleItemId, id))
      .orderBy(salesItemAdjustments.createdAt);

    return NextResponse.json({
      data: adjustments,
      message: '개별 화물 추가금 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('개별 화물 추가금 조회 중 오류:', error);
    return NextResponse.json(
      { error: '개별 화물 추가금 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 개별 화물 추가금 생성
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

    // 화물 항목 존재 확인
    const bundleItem = await db
      .select()
      .from(salesBundleItems)
      .where(eq(salesBundleItems.id, id))
      .limit(1);

    if (bundleItem.length === 0) {
      return NextResponse.json(
        { error: '화물 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 사용자 ID (실제 구현 시 인증에서 가져와야 함)
    const currentUserId = request.headers.get('x-user-id');
    if (!currentUserId) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.', details: 'x-user-id 헤더가 없습니다.' },
        { status: 401 }
      );
    }

    // 개별 화물 추가금 생성
    const [newAdjustment] = await db
      .insert(salesItemAdjustments)
      .values({
        bundleItemId: id,
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount.toString(),
        taxAmount: validatedData.taxAmount.toString(),
        createdBy: currentUserId
      })
      .returning();

    return NextResponse.json({
      data: newAdjustment,
      message: '개별 화물 추가금을 성공적으로 생성했습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('개별 화물 추가금 생성 중 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '개별 화물 추가금 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 개별 화물 추가금 수정
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
      .from(salesItemAdjustments)
      .where(and(
        eq(salesItemAdjustments.id, adjustmentId),
        eq(salesItemAdjustments.bundleItemId, id)
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

    // 개별 화물 추가금 수정
    const [updatedAdjustment] = await db
      .update(salesItemAdjustments)
      .set(updateValues)
      .where(eq(salesItemAdjustments.id, adjustmentId))
      .returning();

    return NextResponse.json({
      data: updatedAdjustment,
      message: '개별 화물 추가금을 성공적으로 수정했습니다.'
    });
  } catch (error) {
    console.error('개별 화물 추가금 수정 중 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '개별 화물 추가금 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 개별 화물 추가금 삭제
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
      .from(salesItemAdjustments)
      .where(and(
        eq(salesItemAdjustments.id, adjustmentId),
        eq(salesItemAdjustments.bundleItemId, id)
      ))
      .limit(1);

    if (existingAdjustment.length === 0) {
      return NextResponse.json(
        { error: '추가금을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 개별 화물 추가금 삭제
    await db
      .delete(salesItemAdjustments)
      .where(eq(salesItemAdjustments.id, adjustmentId));

    return NextResponse.json({
      message: '개별 화물 추가금을 성공적으로 삭제했습니다.'
    });
  } catch (error) {
    console.error('개별 화물 추가금 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '개별 화물 추가금 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 