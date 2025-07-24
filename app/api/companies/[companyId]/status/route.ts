import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { z } from 'zod';
import { logCompanyChange } from '@/utils/company-change-logger';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 상태 변경 스키마
const UpdateCompanyStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    // UUID 검증
    if (!isValidUUID(companyId)) {
      return NextResponse.json(
        { error: '유효하지 않은 업체 ID입니다.' },
        { status: 400 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdateCompanyStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { status, reason } = result.data;

    // 업체 존재 여부 확인
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: '존재하지 않는 업체입니다.' },
        { status: 404 }
      );
    }

    // 상태가 이미 같은 경우
    if (existingCompany.status === status) {
      return NextResponse.json(
        { error: '이미 해당 상태입니다.' },
        { status: 400 }
      );
    }

    // 업체 상태 업데이트
    const [updatedCompany] = await db
      .update(companies)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId))
      .returning();

    // 변경 이력 기록
    await logCompanyChange({
      companyId,
      changedBy: request.headers.get('x-user-id') || 'system',
      changedByName: request.headers.get('x-user-name') || 'system',
      changedByEmail: request.headers.get('x-user-email') || 'system',
      changedByAccessLevel: request.headers.get('x-user-access-level') || 'system',
      changeType: 'update',
      oldData: {
        ...existingCompany,
        updatedAt: existingCompany.updatedAt?.toISOString(),
      },
      newData: {
        ...updatedCompany,
        updatedAt: updatedCompany.updatedAt?.toISOString(),
      },
      reason: reason || undefined,
    });

    return NextResponse.json({
      message: '업체 상태가 성공적으로 변경되었습니다.',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('업체 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 