import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { z } from 'zod';

// 업체 데이터 검증 스키마
const CompanyValidationSchema = z.object({
  name: z.string().min(2, '업체명은 최소 2자 이상이어야 합니다.'),
  businessNumber: z.string().min(10, '올바른 사업자번호 형식이 아닙니다.'),
  ceoName: z.string().min(2, '대표자명은 최소 2자 이상이어야 합니다.'),
  type: z.enum(['broker', 'shipper', 'carrier']),
  status: z.enum(['active', 'inactive']),
  address: z.object({
    postal: z.string().optional(),
    road: z.string().optional(),
    detail: z.string().optional(),
  }),
  contact: z.object({
    tel: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email('올바른 이메일 형식이 아닙니다.').optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const result = CompanyValidationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 업체 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { businessNumber } = result.data;

    // 사업자번호 중복 검사
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.businessNumber, businessNumber),
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: '이미 등록된 사업자번호입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: '업체 데이터가 유효합니다.',
      data: result.data,
    });
  } catch (error) {
    console.error('업체 데이터 검증 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업체 데이터 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 