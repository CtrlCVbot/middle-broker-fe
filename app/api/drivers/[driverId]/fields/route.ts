import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { drivers } from '@/db/schema/drivers';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logDriverChange } from '@/utils/driver-change-logger';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 필드 업데이트 스키마
const UpdateDriverFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    // Next.js 13.4.19 이상에서는 params를 비동기적으로 처리해야 함
    const driverId = (await params).driverId;

    // UUID 검증
    if (!isValidUUID(driverId)) {
      return NextResponse.json(
        { error: '유효하지 않은 차주 ID입니다.' },
        { status: 400 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdateDriverFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;
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
    const existingDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: '존재하지 않는 차주입니다.' },
        { status: 404 }
      );
    }

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'name',
      'phoneNumber',
      'vehicleNumber',
      'vehicleType',
      'vehicleWeight',
      'addressSnapshot',
      'companyType',
      'companyId',
      'businessNumber',
      'manufactureYear',
      'isActive',
      'inactiveReason'
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

    // 차량번호가 변경되는 경우 중복 검사
    if (fields.vehicleNumber && fields.vehicleNumber !== existingDriver.vehicleNumber) {
      const [duplicateDriver] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.vehicleNumber, fields.vehicleNumber))
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

    // 업데이트 데이터 준비
    const updateData = {
      ...fields,
      updatedBy: requestUser.id,
      updatedBySnapshot: userSnapshot,
      updatedAt: new Date(),
    };

    // 차주 정보 업데이트
    const [updatedDriver] = await db
      .update(drivers)
      .set(updateData as any)
      .where(eq(drivers.id, driverId))
      .returning();

    // 변경 이력 기록을 위한 함수 호출
    await logDriverChange({
      driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level || 'user',
      changeType: 'update_fields',
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
        lastDispatchedAt: updatedDriver.lastDispatchedAt?.toISOString(),
        changedFields: Object.keys(fields)
      },
      reason: reason || '차주 정보 필드 수정'
    });

    return NextResponse.json({
      message: '차주 정보가 성공적으로 업데이트되었습니다.',
      data: updatedDriver,
    });
  } catch (error) {
    console.error('차주 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '차주 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 