import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { z } from 'zod';
import { logCompanyChange } from '@/utils/company-change-logger';

// 일괄 처리 요청 스키마
const BatchProcessSchema = z.object({
  companyIds: z.array(z.string().uuid()),
  action: z.enum(['activate', 'deactivate', 'delete']),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const result = BatchProcessSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { companyIds, action, reason } = result.data;

    // 업체 존재 여부 확인
    const existingCompanies = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, companyIds));

    if (existingCompanies.length !== companyIds.length) {
      return NextResponse.json(
        { error: '존재하지 않는 업체가 포함되어 있습니다.' },
        { status: 404 }
      );
    }

    // 일괄 처리 수행
    switch (action) {
      case 'activate':
        await db
          .update(companies)
          .set({
            status: 'active',
            updatedAt: new Date(),
          })
          .where(inArray(companies.id, companyIds));
        break;

      case 'deactivate':
        await db
          .update(companies)
          .set({
            status: 'inactive',
            updatedAt: new Date(),
          })
          .where(inArray(companies.id, companyIds));
        break;

      case 'delete':
        await db
          .delete(companies)
          .where(inArray(companies.id, companyIds));
        break;
    }

    // 변경 이력 기록
    for (const company of existingCompanies) {
      await logCompanyChange({
        companyId: company.id,
        changedBy: request.headers.get('x-user-id') || 'system',
        changedByName: request.headers.get('x-user-name') || 'system',
        changedByEmail: request.headers.get('x-user-email') || 'system',
        changedByAccessLevel: request.headers.get('x-user-access-level') || 'system',
        changeType: action === 'delete' ? 'delete' : 'update',
        oldData: {
          ...company,
          updatedAt: company.updatedAt?.toISOString(),
        },
        newData: action === 'delete' ? undefined : {
          ...company,
          status: action === 'activate' ? 'active' : 'inactive',
          updatedAt: new Date().toISOString(),
        },
        reason: reason || undefined,
      });
    }

    return NextResponse.json({
      message: '업체 일괄 처리가 성공적으로 완료되었습니다.',
      data: {
        processedCount: companyIds.length,
        action,
      },
    });
  } catch (error) {
    console.error('업체 일괄 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체 일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 