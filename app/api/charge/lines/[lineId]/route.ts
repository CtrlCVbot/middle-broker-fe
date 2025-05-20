import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { chargeLines, chargeSideEnum } from '@/db/schema/chargeLines';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 운임 라인 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const { lineId } = params;

    // 운임 라인 조회
    const chargeLine = await db.query.chargeLines.findFirst({
      where: eq(chargeLines.id, lineId),
      with: {
        group: true
      }
    });

    if (!chargeLine) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 라인입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: chargeLine });
  } catch (error) {
    console.error('운임 라인 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 라인 수정 스키마
const UpdateChargeLineSchema = z.object({
  side: z.enum(chargeSideEnum.enumValues).optional(),
  amount: z.number().nonnegative().optional(),
  memo: z.string().optional(),
  taxRate: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional()
});

// 운임 라인 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { lineId } = params;
    const userId = session.user.id;
    const body = await request.json();
    
    // 운임 라인 존재 여부 확인
    const existingLine = await db.query.chargeLines.findFirst({
      where: eq(chargeLines.id, lineId),
      with: {
        group: true
      }
    });

    if (!existingLine) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 라인입니다.' },
        { status: 404 }
      );
    }

    // 잠금 여부 확인
    if (existingLine.group.isLocked) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹의 라인은 수정할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 요청 데이터 검증
    const validationResult = UpdateChargeLineSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // 세금 자동 계산 (금액이나 세율이 변경된 경우)
    if ((data.amount || data.taxRate) && !data.taxAmount) {
      const amount = data.amount || existingLine.amount;
      const taxRate = data.taxRate || existingLine.taxRate;
      data.taxAmount = Number((amount * (Number(taxRate) / 100)).toFixed(2));
    }
    
    // 운임 라인 수정
    const updatedChargeLine = await db.update(chargeLines)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(chargeLines.id, lineId))
      .returning();

    return NextResponse.json({
      message: '운임 라인이 수정되었습니다.',
      data: updatedChargeLine[0]
    });
  } catch (error) {
    console.error('운임 라인 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 라인 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { lineId } = params;
    
    // 운임 라인 존재 여부 확인
    const existingLine = await db.query.chargeLines.findFirst({
      where: eq(chargeLines.id, lineId),
      with: {
        group: true
      }
    });

    if (!existingLine) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 라인입니다.' },
        { status: 404 }
      );
    }

    // 잠금 여부 확인
    if (existingLine.group.isLocked) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹의 라인은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 운임 라인 삭제
    await db.delete(chargeLines)
      .where(eq(chargeLines.id, lineId));

    return NextResponse.json({
      message: '운임 라인이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('운임 라인 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 