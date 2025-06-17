import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { chargeGroups, chargeReasonEnum, chargeStageEnum } from '@/db/schema/chargeGroups';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { chargeLines } from '@/db/schema/chargeLines';

// 운임 그룹 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // 운임 그룹 조회
    const chargeGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.id, groupId),
      with: {
        chargeLines: true
      }
    });

    if (!chargeGroup) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 그룹입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: chargeGroup });
  } catch (error) {
    console.error('운임 그룹 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 그룹 수정 스키마
const UpdateChargeGroupSchema = z.object({
  stage: z.enum(chargeStageEnum.enumValues).optional(),
  reason: z.enum(chargeReasonEnum.enumValues).optional(),
  description: z.string().optional(),
  isLocked: z.boolean().optional()
});

// 운임 그룹 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    const { groupId } = params;
    //const userId = session.user.id;
    const userId = request.headers.get('x-user-id') || '';
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    
    // 운임 그룹 존재 여부 확인
    const existingGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.id, groupId)
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 그룹입니다.' },
        { status: 404 }
      );
    }

    // 잠금 여부 확인
    if (existingGroup.isLocked && !body.isLocked === false) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹은 수정할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 요청 데이터 검증
    const validationResult = UpdateChargeGroupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // 운임 그룹 수정
    const updatedChargeGroup = await db.update(chargeGroups)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(chargeGroups.id, groupId))
      .returning();

    return NextResponse.json({
      message: '운임 그룹이 수정되었습니다.',
      data: updatedChargeGroup[0]
    });
  } catch (error) {
    console.error('운임 그룹 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 그룹 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }
    const userId = request.headers.get('x-user-id') || '';
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    const { groupId } = params;
    
    // 운임 그룹 존재 여부 확인
    const existingGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.id, groupId)
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 그룹입니다.' },
        { status: 404 }
      );
    }

    // 잠금 여부 확인
    if (existingGroup.isLocked) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 관련 운임 라인 삭제 (cascade로 자동 삭제되지만 명시적으로 구현)
    await db.delete(chargeLines)
      .where(eq(chargeLines.groupId, groupId));
    
    // 운임 그룹 삭제
    await db.delete(chargeGroups)
      .where(eq(chargeGroups.id, groupId));

    return NextResponse.json({
      message: '운임 그룹이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('운임 그룹 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 