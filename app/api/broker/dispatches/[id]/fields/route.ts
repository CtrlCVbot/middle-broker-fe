import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { orders } from '@/db/schema/orders';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@/db/schema/users';
import { validate as isValidUUID, version as getUUIDVersion } from 'uuid';
import { logOrderChange } from '@/utils/order-change-logger';

// 사용자 역할 결정 함수
const getUserRole = (systemAccessLevel?: string): 'shipper' | 'broker' | 'admin' => {
  if (!systemAccessLevel) return 'broker';
  
  switch (systemAccessLevel) {
    case 'platform_admin':
    case 'broker_admin':
    case 'shipper_admin':
      return 'admin';
    case 'broker_member':
      return 'broker';
    case 'shipper_member':
      return 'shipper';
    default:
      return 'broker';
  }
};

// 필드 업데이트 스키마
const UpdateDispatchFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 13.4.19 이상에서는 params를 비동기적으로 처리해야 함
    const { id: dispatchId } = await params;

    // UUID 검증
    if (!isValidUUID(dispatchId)) {
      return NextResponse.json(
        { error: '유효하지 않은 배차 ID입니다.' },
        { status: 400 }
      );
    }
    
    
    const requestUserId = request.headers.get('x-user-id') || '';
    console.log("requestUserId : ", requestUserId);

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
    console.log("검색된 requestUser : ", requestUser);

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdateDispatchFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;

    // 배차 정보 존재 여부 확인
    const existingDispatch = await db.query.orderDispatches.findFirst({
      where: eq(orderDispatches.id, dispatchId),
    });

    if (!existingDispatch) {
      return NextResponse.json(
        { error: '존재하지 않는 배차 정보입니다.' },
        { status: 404 }
      );
    }

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'assignedDriverId',
      'assignedDriverSnapshot',
      'assignedDriverPhone',
      'assignedVehicleNumber',
      'assignedVehicleType',
      'assignedVehicleWeight',
      'assignedVehicleConnection',
      'agreedFreightCost',
      'brokerMemo',
      'brokerFlowStatus'
    ];

    // 업데이트할 필드 검증
    const invalidFields = Object.keys(fields).filter(
      (field) => !allowedFields.includes(field)
    );
    console.log("invalidFields : ", invalidFields);
    console.log("fields : ", fields);

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
      updatedBy: requestUserId,
      updatedBySnapshot: {
        id: requestUser.id || uuidv4(),
        name: requestUser.name || 'System',
        email: requestUser.email || 'system@example.com',
      }
    };

    // 배차 정보 업데이트
    const [updatedDispatch] = await db
      .update(orderDispatches)
      .set(updateData)
      .where(eq(orderDispatches.id, dispatchId))
      .returning();

    // 주문 상태 업데이트 (brokerFlowStatus 필드가 있을 경우)
    if (fields.brokerFlowStatus) {
      await db
        .update(orders)
        .set({
          flowStatus: fields.brokerFlowStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, existingDispatch.orderId));
    }

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      // 변경된 필드 감지
      const changedFields = Object.keys(fields).filter(key => 
        existingDispatch[key as keyof typeof existingDispatch] !== fields[key]
      );
      
      if (changedFields.length > 0) {
        const changeReason = reason || `배차 정보 변경: ${changedFields.join(', ')}`;
        
        await logOrderChange({
          orderId: existingDispatch.orderId,
          changedBy: requestUserId,
          changedByRole: getUserRole(requestUser.system_access_level),
          changedByName: requestUser.name,
          changedByEmail: requestUser.email,
          changedByAccessLevel: requestUser.system_access_level,
          changeType: 'updateDispatch',
          oldData: existingDispatch,
          newData: updatedDispatch,
          reason: changeReason
        });
      }
    }

    return NextResponse.json({
      message: '배차 정보가 성공적으로 업데이트되었습니다.',
      data: updatedDispatch,
    });
  } catch (error) {
    console.error('배차 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '배차 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 