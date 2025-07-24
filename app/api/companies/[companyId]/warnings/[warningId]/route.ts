import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { companyWarnings } from '@/db/schema/companyWarnings';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { logWarningChange } from '@/utils/company-warning-logger';

// 주의사항 수정 스키마
const warningUpdateSchema = z.object({
  text: z.string().min(1, { message: '주의사항 내용은 필수입니다.' }).optional(),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
  reason: z.string().optional(), // 추가: 변경 사유
});

/**
 * GET /api/companies/[companyId]/warnings/[warningId]
 * 특정 주의사항 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; warningId: string }> }
) {
  try {
    const { companyId, warningId } = await params;

    // 주의사항 조회
    const warning = await db.query.companyWarnings.findFirst({
      where: and(
        eq(companyWarnings.id, warningId),
        eq(companyWarnings.companyId, companyId)
      ),
    });

    if (!warning) {
      return NextResponse.json(
        { message: '주의사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(warning);
  } catch (error) {
    console.error('주의사항 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[companyId]/warnings/[warningId]
 * 특정 주의사항 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; warningId: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { message: '인증되지 않은 사용자입니다.' },
    //     { status: 401 }
    //   );
    // }

    const { companyId, warningId } = await params;
    const body = await request.json();

    // 요청 검증
    const validationResult = warningUpdateSchema.safeParse(body);
    const requestUserId = request.headers.get('x-user-id');
    console.log('requestUserId', requestUserId);
    

    if (!validationResult.success) {
      return NextResponse.json(
        { message: '입력 데이터가 유효하지 않습니다.', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // 주의사항 존재 확인
    const existingWarning = await db.query.companyWarnings.findFirst({
      where: and(
        eq(companyWarnings.id, warningId),
        eq(companyWarnings.companyId, companyId)
      ),
    });

    if (!existingWarning) {
      return NextResponse.json(
        { message: '주의사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { reason, ...updateFields } = validationResult.data;

    // 업데이트할 필드 설정
    const updateData: any = {
      updatedBy: requestUserId,
      updatedAt: new Date(),
    };

    if (updateFields.text !== undefined) {
      updateData.text = updateFields.text;
    }

    if (updateFields.category !== undefined) {
      updateData.category = updateFields.category;
    }

    if (updateFields.sortOrder !== undefined) {
      updateData.sortOrder = updateFields.sortOrder;
    }

    // 주의사항 업데이트
    await db.update(companyWarnings)
      .set(updateData)
      .where(
        and(
          eq(companyWarnings.id, warningId),
          eq(companyWarnings.companyId, companyId)
        )
      );

    // 변경 로그 기록
    await logWarningChange({
      companyId,
      warningId,
      action: 'update',
      previousData: existingWarning,
      newData: updateData,
      createdBy: requestUserId || '',
      reason: reason || null,
    });

    return NextResponse.json(
      { message: '주의사항이 수정되었습니다.', success: true }
    );
  } catch (error) {
    console.error('주의사항 수정 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[companyId]/warnings/[warningId]
 * 특정 주의사항 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; warningId: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { message: '인증되지 않은 사용자입니다.' },
    //     { status: 401 }
    //   );
    // }

    const { companyId, warningId } = await params;
    console.log('companyId', companyId);
    console.log('warningId', warningId);
    
    // URL에서 reason 쿼리 파라미터 추출
    const url = new URL(request.url);
    const reason = url.searchParams.get('reason');
    const requestUserId = request.headers.get('x-user-id');
    console.log('requestUserId', requestUserId);

    // 주의사항 존재 확인
    const existingWarning = await db.query.companyWarnings.findFirst({
      where: and(
        eq(companyWarnings.id, warningId),
        eq(companyWarnings.companyId, companyId)
      ),
    });

    if (!existingWarning) {
      return NextResponse.json(
        { message: '주의사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주의사항 삭제 - 로그를 먼저 저장하는 대신 삭제를 먼저 실행
    await db.delete(companyWarnings)
      .where(
        and(
          eq(companyWarnings.id, warningId),
          eq(companyWarnings.companyId, companyId)
        )
      );

    // 변경 로그 기록 (삭제 성공 후 기록)
    try {
      await logWarningChange({
        companyId,
        warningId,
        action: 'delete',
        previousData: existingWarning,
        createdBy: requestUserId || '',
        reason: reason || null,
      });
    } catch (logError) {
      // 로그 저장 실패는 주요 기능에 영향을 주지 않도록 함
      console.error('주의사항 삭제 로그 기록 중 오류 발생:', logError);
    }

    return NextResponse.json(
      { message: '주의사항이 삭제되었습니다.', success: true }
    );
  } catch (error) {
    console.error('주의사항 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 