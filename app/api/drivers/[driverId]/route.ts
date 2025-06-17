import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { drivers } from '@/db/schema/drivers';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logDriverChange } from '@/utils/driver-change-logger';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 차주 수정 요청 스키마
const UpdateDriverSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phoneNumber: z.string().min(10, '올바른 전화번호 형식이 아닙니다.'),
  vehicleNumber: z.string().min(4, '올바른 차량번호 형식이 아닙니다.'),
  vehicleType: z.enum(['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러']),
  vehicleWeight: z.enum(['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '8톤', '11톤', '18톤', '25톤']),
  address: z.object({
    roadAddress: z.string(),
    jibunAddress: z.string().optional(),
    postalCode: z.string(),
    detailAddress: z.string().optional(),
    sido: z.string(),
    sigungu: z.string(),
    bname: z.string(),
    roadname: z.string(),
    lng: z.number().optional(),
    lat: z.number().optional()
  }),
  companyType: z.enum(['개인', '소속']).default('개인'),
  companyId: z.string().uuid().optional(),
  businessNumber: z.string().min(10, '올바른 사업자번호 형식이 아닙니다.'),
  manufactureYear: z.string().optional(),
  isActive: z.boolean().default(true),
  inactiveReason: z.string().optional()
});

// GET /api/drivers/[driverId] - 차주 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const driverId = (await params).driverId;

    // UUID 형식 검증
    if (!isValidUUID(driverId)) {
      return NextResponse.json(
        { error: '잘못된 차주 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 차주 정보 조회
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1)
      .execute();

    if (!driver) {
      return NextResponse.json(
        { error: '차주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 응답 데이터 변환
    const responseData = {
      id: driver.id,
      name: driver.name,
      phoneNumber: driver.phoneNumber,
      vehicleNumber: driver.vehicleNumber,
      vehicleType: driver.vehicleType,
      vehicleWeight: driver.vehicleWeight,
      address: driver.addressSnapshot,
      companyType: driver.companyType,
      companyId: driver.companyId,
      businessNumber: driver.businessNumber,
      manufactureYear: driver.manufactureYear || '',
      isActive: driver.isActive,
      inactiveReason: driver.inactiveReason || '',
      lastDispatchedAt: driver.lastDispatchedAt?.toISOString() || null,
      createdAt: driver.createdAt?.toISOString() || '',
      updatedAt: driver.updatedAt?.toISOString() || '',
      createdBy: driver.createdBy,
      createdBySnapshot: driver.createdBySnapshot,
      updatedBy: driver.updatedBy,
      updatedBySnapshot: driver.updatedBySnapshot
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('차주 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/drivers/[driverId] - 차주 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const driverId = (await params).driverId;

    // UUID 형식 검증
    if (!isValidUUID(driverId)) {
      return NextResponse.json(
        { error: '잘못된 차주 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = UpdateDriverSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
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

    // 차주 존재 여부 확인
    const [existingDriver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1)
      .execute();

    if (!existingDriver) {
      return NextResponse.json(
        { error: '차주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 차량번호 중복 검사 (다른 차주가 같은 차량번호를 사용하는지)
    if (updateData.vehicleNumber !== existingDriver.vehicleNumber) {
      const [duplicateDriver] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.vehicleNumber, updateData.vehicleNumber))
        .limit(1)
        .execute();

      if (duplicateDriver && duplicateDriver.id !== driverId) {
        return NextResponse.json(
          { error: '이미 등록된 차량번호입니다.' },
          { status: 400 }
        );
      }
    }

    // 사용자 스냅샷 생성
    const userSnapshot = {
      ...requestUser
    };

    // 차주 정보 업데이트
    const [updatedDriver] = await db
      .update(drivers)
      .set({
        name: updateData.name,
        phoneNumber: updateData.phoneNumber,
        vehicleNumber: updateData.vehicleNumber,
        vehicleType: updateData.vehicleType,
        vehicleWeight: updateData.vehicleWeight,
        addressSnapshot: updateData.address,
        companyType: updateData.companyType,
        companyId: updateData.companyId,
        businessNumber: updateData.businessNumber,
        manufactureYear: updateData.manufactureYear,
        isActive: updateData.isActive,
        inactiveReason: updateData.inactiveReason,
        updatedBy: requestUser.id,
        updatedBySnapshot: userSnapshot,
        updatedAt: new Date()
      }as any)
      .where(eq(drivers.id, driverId))
      .returning();

    // 변경 이력 기록
    await logDriverChange({
      driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'update',
      oldData: {
        ...existingDriver,
        createdAt: existingDriver.createdAt?.toISOString(),
        updatedAt: existingDriver.updatedAt?.toISOString(),
        lastDispatchedAt: existingDriver.lastDispatchedAt?.toISOString()
      },
      newData: {
        ...updatedDriver,
        createdAt: updatedDriver.createdAt?.toISOString(),
        updatedAt: updatedDriver.updatedAt?.toISOString(),
        lastDispatchedAt: updatedDriver.lastDispatchedAt?.toISOString()
      },
      reason: body.reason || '차주 정보 전체 수정'
    });

    return NextResponse.json({
      message: '차주 정보가 성공적으로 수정되었습니다.',
      data: updatedDriver
    });
  } catch (error) {
    console.error('차주 정보 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/drivers/[driverId] - 차주 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const driverId = (await params).driverId;

    // UUID 형식 검증
    if (!isValidUUID(driverId)) {
      return NextResponse.json(
        { error: '잘못된 차주 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const requestUserId = request.headers.get('x-user-id') || '';
    const reason = searchParams.get('reason') || '차주 삭제';

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

    // 차주 존재 여부 확인
    const [existingDriver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1)
      .execute();

    if (!existingDriver) {
      return NextResponse.json(
        { error: '차주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 차주 삭제
    await db
      .delete(drivers)
      .where(eq(drivers.id, driverId));

    // 변경 이력 기록
    await logDriverChange({
      driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'delete',
      oldData: {
        ...existingDriver,
        createdAt: existingDriver.createdAt?.toISOString(),
        updatedAt: existingDriver.updatedAt?.toISOString(),
        lastDispatchedAt: existingDriver.lastDispatchedAt?.toISOString()
      },
      newData: null,
      reason
    });

    return NextResponse.json({
      message: '차주가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('차주 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 