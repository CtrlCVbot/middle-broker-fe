import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { companyWarnings } from '@/db/schema/companyWarnings';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { logWarningChange } from '@/utils/company-warning-logger';

// 주의사항 생성 스키마
const warningCreateSchema = z.object({
  text: z.string().min(1, { message: '주의사항 내용은 필수입니다.' }),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
  reason: z.string().optional(),
});

/**
 * GET /api/companies/[companyId]/warnings
 * 특정 업체의 주의사항 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;

    console.log('companyId', companyId);

    // 업체 존재 여부 확인
    const companyExists = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!companyExists) {
      return NextResponse.json(
        { message: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주의사항 목록 조회
    const warnings = await db.query.companyWarnings.findMany({
      where: eq(companyWarnings.companyId, companyId),
      orderBy: (warnings, { asc }) => [asc(warnings.sortOrder), asc(warnings.createdAt)],
    });

    return NextResponse.json(warnings);
  } catch (error) {
    console.error('업체 주의사항 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '업체 주의사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies/[companyId]/warnings
 * 새로운 주의사항 생성
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
    const validationResult = warningCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: '입력 데이터가 유효하지 않습니다.', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { text, category, sortOrder, reason } = validationResult.data;

    // 업체 존재 여부 확인
    const companyExists = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!companyExists) {
      return NextResponse.json(
        { message: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주의사항 생성
    const [newWarning] = await db.insert(companyWarnings).values({
      companyId,
      text,
      category: category || '기타',
      sortOrder: sortOrder || 0,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    }).returning();

    // 변경 로그 기록
    await logWarningChange({
      companyId,
      warningId: newWarning.id,
      action: 'create',
      newData: newWarning,
      createdBy: session.user.id,
      reason: reason || null,
    });

    return NextResponse.json(
      { message: '주의사항이 등록되었습니다.', id: newWarning.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('주의사항 등록 중 오류 발생:', error);
    return NextResponse.json(
      { message: '주의사항 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 