import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { CompanyStatus, CompanyType, ICompany } from '@/types/company';
import { z } from 'zod';
import { logCompanyChange } from '@/utils/company-change-logger';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 업체 수정 요청 스키마
const UpdateCompanySchema = z.object({
  name: z.string().min(2, '업체명은 최소 2자 이상이어야 합니다.').optional(),
  businessNumber: z.string().min(10, '올바른 사업자번호 형식이 아닙니다.').optional(),
  ceoName: z.string().min(2, '대표자명은 최소 2자 이상이어야 합니다.').optional(),
  type: z.enum(['broker', 'shipper', 'carrier']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  address: z.object({
    postal: z.string().optional(),
    road: z.string().optional(),
    detail: z.string().optional()
  }).optional(),
  contact: z.object({
    tel: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email('올바른 이메일 형식이 아닙니다.').optional()
  }).optional(),
  requestUserId: z.string().uuid('잘못된 요청 사용자 ID 형식입니다.')
});

// 업체 상태 변경 요청 스키마
const UpdateCompanyStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
  reason: z.string().optional(),
  requestUserId: z.string().uuid('잘못된 요청 사용자 ID 형식입니다.')
});

// GET /api/companies/[companyId] - 업체 상세 조회
//params는 context에서 전달되는 두 번째 인자이고, App Router에서는 다음과 같이 함수 인자에서 받아올 수 있습니다.
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // params 객체를 비동기적으로 처리
    const { companyId } = await params;
    console.log('companyId', companyId);

    // UUID 형식 검증
    if (!isValidUUID(companyId)) {
      return NextResponse.json(
        { error: '잘못된 업체 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 업체 정보 조회
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)
      .execute();

    if (!company) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 응답 데이터 변환
    const responseData = {
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
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('업체 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[companyId] - 업체 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // params 객체를 비동기적으로 처리
    const { companyId } = params;

    // UUID 형식 검증
    if (!isValidUUID(companyId)) {
      return NextResponse.json(
        { error: '잘못된 업체 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = UpdateCompanySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { ...updateData } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업체 존재 여부 확인
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)
      .execute();

    if (!existingCompany) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사업자번호 중복 검사 (사업자번호가 변경되는 경우)
    if (updateData.businessNumber && updateData.businessNumber !== existingCompany.businessNumber) {
      const [duplicateCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.businessNumber, updateData.businessNumber))
        .limit(1)
        .execute();

      if (duplicateCompany) {
        return NextResponse.json(
          { error: '이미 등록된 사업자번호입니다.' },
          { status: 400 }
        );
      }
    }

    // 현재 시간
    const now = new Date();

    // 업데이트 데이터 준비
    const updateValues: any = {
      updatedBy: requestUserId,
      updatedAt: now
    };

    // 업데이트할 필드 추가
    if (updateData.name) updateValues.name = updateData.name;
    if (updateData.businessNumber) updateValues.businessNumber = updateData.businessNumber;
    if (updateData.ceoName) updateValues.ceoName = updateData.ceoName;
    if (updateData.type) updateValues.type = updateData.type;
    if (updateData.status) updateValues.status = updateData.status;
    
    if (updateData.address) {
      if (updateData.address.postal !== undefined) updateValues.addressPostal = updateData.address.postal;
      if (updateData.address.road !== undefined) updateValues.addressRoad = updateData.address.road;
      if (updateData.address.detail !== undefined) updateValues.addressDetail = updateData.address.detail;
    }
    
    if (updateData.contact) {
      if (updateData.contact.tel !== undefined) updateValues.contactTel = updateData.contact.tel;
      if (updateData.contact.mobile !== undefined) updateValues.contactMobile = updateData.contact.mobile;
      if (updateData.contact.email !== undefined) updateValues.contactEmail = updateData.contact.email;
    }

    // 업체 정보 업데이트
    const [updatedCompany] = await db
      .update(companies)
      .set(updateValues)
      .where(eq(companies.id, companyId))
      .returning();

    // 변경 이력 기록
    await logCompanyChange({
      companyId: updatedCompany.id,
      changedBy: requestUserId,
      changedByName: requestUser.name,
      changedByEmail: requestUser.email,
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'update',
      oldData: {
        id: existingCompany.id,
        name: existingCompany.name,
        businessNumber: existingCompany.businessNumber,
        ceoName: existingCompany.ceoName,
        type: existingCompany.type,
        status: existingCompany.status,
        address: {
          postal: existingCompany.addressPostal || '',
          road: existingCompany.addressRoad || '',
          detail: existingCompany.addressDetail || ''
        },
        contact: {
          tel: existingCompany.contactTel || '',
          mobile: existingCompany.contactMobile || '',
          email: existingCompany.contactEmail || ''
        }
      },
      newData: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        businessNumber: updatedCompany.businessNumber,
        ceoName: updatedCompany.ceoName,
        type: updatedCompany.type,
        status: updatedCompany.status,
        address: {
          postal: updatedCompany.addressPostal || '',
          road: updatedCompany.addressRoad || '',
          detail: updatedCompany.addressDetail || ''
        },
        contact: {
          tel: updatedCompany.contactTel || '',
          mobile: updatedCompany.contactMobile || '',
          email: updatedCompany.contactEmail || ''
        }
      },
      reason: '업체 정보 수정'
    });

    // 응답 데이터 변환
    const responseData = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      businessNumber: updatedCompany.businessNumber,
      ceoName: updatedCompany.ceoName,
      type: updatedCompany.type,
      status: updatedCompany.status,
      address: {
        postal: updatedCompany.addressPostal || '',
        road: updatedCompany.addressRoad || '',
        detail: updatedCompany.addressDetail || ''
      },
      contact: {
        tel: updatedCompany.contactTel || '',
        mobile: updatedCompany.contactMobile || '',
        email: updatedCompany.contactEmail || ''
      },
      registeredAt: updatedCompany.createdAt?.toISOString() || '',
      updatedAt: updatedCompany.updatedAt?.toISOString() || ''
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('업체 정보 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[companyId] - 업체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // params 객체를 비동기적으로 처리
    const { companyId } = params;

    // UUID 형식 검증
    if (!isValidUUID(companyId)) {
      return NextResponse.json(
        { error: '잘못된 업체 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const requestUserId = request.headers.get('x-user-id') || '';
    const reason = searchParams.get('reason') || '업체 삭제';

    // 요청 사용자 ID 검증
    if (!requestUserId || !isValidUUID(requestUserId)) {
      return NextResponse.json(
        { error: '잘못된 요청 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업체 존재 여부 확인
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)
      .execute();

    if (!existingCompany) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업체 삭제
    await db
      .delete(companies)
      .where(eq(companies.id, companyId));

    // 변경 이력 기록
    await logCompanyChange({
      companyId: existingCompany.id,
      changedBy: requestUserId,
      changedByName: requestUser.name,
      changedByEmail: requestUser.email,
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'delete',
      oldData: {
        id: existingCompany.id,
        name: existingCompany.name,
        businessNumber: existingCompany.businessNumber,
        ceoName: existingCompany.ceoName,
        type: existingCompany.type,
        status: existingCompany.status,
        address: {
          postal: existingCompany.addressPostal || '',
          road: existingCompany.addressRoad || '',
          detail: existingCompany.addressDetail || ''
        },
        contact: {
          tel: existingCompany.contactTel || '',
          mobile: existingCompany.contactMobile || '',
          email: existingCompany.contactEmail || ''
        }
      },
      reason
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('업체 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 