import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { CompanyStatus, CompanyType, ICompany } from '@/types/company';
import { z } from 'zod';
import { logCompanyChange } from '@/utils/company-change-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;

    // 필터 파라미터
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') as CompanyStatus | '';
    const type = searchParams.get('type') as CompanyType | '';
    const region = searchParams.get('region') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 검색 조건 구성
    let conditions = [];

    if (keyword) {
      conditions.push(
        or(
          ilike(companies.name, `%${keyword}%`),
          ilike(companies.businessNumber, `%${keyword}%`),
          ilike(companies.ceoName, `%${keyword}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(companies.status, status));
    }

    if (type) {
      conditions.push(eq(companies.type, type));
    }

    if (region) {
      conditions.push(ilike(companies.addressPostal, `%${region}%`));
    }

    if (startDate) {
      conditions.push(sql`${companies.createdAt} >= ${new Date(startDate)}`);
    }

    if (endDate) {
      conditions.push(sql`${companies.createdAt} <= ${new Date(endDate)}`);
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, total] = await Promise.all([
      db
        .select()
        .from(companies)
        .where(query)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(companies)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);

    // 응답 데이터 변환
    const formattedResult = result.map(company => ({
      id: company.id,
      name: company.name,
      businessNumber: company.businessNumber,
      ceoName: company.ceoName,
      type: company.type,
      status: company.status,
      address: {
        postal: company.addressPostal || '',
        road: company.addressRoad || '',
        detail: company.addressDetail || ''
      },
      contact: {
        tel: company.contactTel || '',
        mobile: company.contactMobile || '',
        email: company.contactEmail || ''
      },
      registeredAt: company.createdAt?.toISOString() || '',
      updatedAt: company.updatedAt?.toISOString() || ''
    }));

    return NextResponse.json({
      data: formattedResult,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('업체 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 업체 생성 요청 스키마
const CreateCompanySchema = z.object({
  name: z.string().min(2, '업체명은 최소 2자 이상이어야 합니다.'),
  businessNumber: z.string().min(10, '올바른 사업자번호 형식이 아닙니다.'),
  ceoName: z.string().min(2, '대표자명은 최소 2자 이상이어야 합니다.'),
  type: z.enum(['broker', 'shipper', 'carrier']),
  status: z.enum(['active', 'inactive']).default('active'),
  address: z.object({
    postal: z.string().optional(),
    road: z.string().optional(),
    detail: z.string().optional()
  }),
  contact: z.object({
    tel: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email('올바른 이메일 형식이 아닙니다.').optional()
  }),
  requestUserId: z.string().uuid('잘못된 요청 사용자 ID 형식입니다.')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = CreateCompanySchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        }),
        { status: 400 }
      );
    }

    
    const { ...companyData } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';
    

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return new Response(
        JSON.stringify({ error: '요청 사용자를 찾을 수 없습니다."/"'+ "/requestUserId=" + request.headers.get('x-user-id') }),
        { status: 404 }
      );
    }

    // 사업자번호 중복 검사
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.businessNumber, companyData.businessNumber))
      .limit(1)
      .execute();

    if (existingCompany) {
      return new Response(
        JSON.stringify({ error: '이미 등록된 사업자번호입니다.' }),
        { status: 400 }
      );
    }

    // 현재 시간
    const now = new Date();

    // 업체 생성
    const [createdCompany] = await db
      .insert(companies)
      .values({
        name: companyData.name,
        businessNumber: companyData.businessNumber,
        ceoName: companyData.ceoName,
        type: companyData.type,
        status: companyData.status,
        addressPostal: companyData.address.postal,
        addressRoad: companyData.address.road,
        addressDetail: companyData.address.detail,
        contactTel: companyData.contact.tel,
        contactMobile: companyData.contact.mobile,
        contactEmail: companyData.contact.email,
        createdBy: requestUserId,
        updatedBy: requestUserId,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // 변경 이력 기록
    await logCompanyChange({
      companyId: createdCompany.id,
      changedBy: requestUserId,
      changedByName: requestUser.name,
      changedByEmail: requestUser.email,
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'create',
      newData: {
        id: createdCompany.id,
        name: createdCompany.name,
        businessNumber: createdCompany.businessNumber,
        ceoName: createdCompany.ceoName,
        type: createdCompany.type,
        status: createdCompany.status,
        address: {
          postal: createdCompany.addressPostal || '',
          road: createdCompany.addressRoad || '',
          detail: createdCompany.addressDetail || ''
        },
        contact: {
          tel: createdCompany.contactTel || '',
          mobile: createdCompany.contactMobile || '',
          email: createdCompany.contactEmail || ''
        },
        registeredAt: createdCompany.createdAt?.toISOString() || '',
        updatedAt: createdCompany.updatedAt?.toISOString() || ''
      },
      reason: '신규 업체 생성'
    });

    // 응답 데이터 변환
    const responseData = {
      id: createdCompany.id,
      name: createdCompany.name,
      businessNumber: createdCompany.businessNumber,
      ceoName: createdCompany.ceoName,
      type: createdCompany.type,
      status: createdCompany.status,
      address: {
        postal: createdCompany.addressPostal || '',
        road: createdCompany.addressRoad || '',
        detail: createdCompany.addressDetail || ''
      },
      contact: {
        tel: createdCompany.contactTel || '',
        mobile: createdCompany.contactMobile || '',
        email: createdCompany.contactEmail || ''
      },
      registeredAt: createdCompany.createdAt?.toISOString() || '',
      updatedAt: createdCompany.updatedAt?.toISOString() || ''
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('업체 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 