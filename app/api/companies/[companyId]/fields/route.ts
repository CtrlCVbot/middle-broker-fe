import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { z } from 'zod';
import { logCompanyChange } from '@/utils/company-change-logger';
import { v4 as uuidv4 } from 'uuid';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 필드 업데이트 스키마
const UpdateCompanyFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // Next.js 13.4.19 이상에서는 params를 비동기적으로 처리해야 함
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
    const result = UpdateCompanyFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;

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

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'name',
      'businessNumber',
      'ceoName',
      'type',
      'status',
      'addressPostal',
      'addressRoad',
      'addressDetail',
      'contactTel',
      'contactMobile',
      'contactEmail',
    ];

    // 업데이트할 필드 검증
    const invalidFields = Object.keys(fields).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: '업데이트 불가능한 필드가 포함되어 있습니다.', fields: invalidFields },
        { status: 400 }
      );
    }

    // 업데이트 데이터 준비
    const updateData = {
      ...fields,
      updatedAt: new Date(),
    };

    // 업체 정보 업데이트
    const [updatedCompany] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, companyId))
      .returning();

    // 변경 이력 기록
    await logCompanyChange({
      companyId,
      changedBy: request.headers.get('x-user-id') || uuidv4(),
      changedByName: request.headers.get('x-user-name') || 'System',
      changedByEmail: request.headers.get('x-user-email') || 'system@example.com',
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
      message: '업체 정보가 성공적으로 업데이트되었습니다.',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('업체 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 