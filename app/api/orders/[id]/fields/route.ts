import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 필드 업데이트 스키마
const UpdateOrderFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 13.4.19 이상에서는 params를 비동기적으로 처리해야 함
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 화물 ID입니다.' },
        { status: 400 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdateOrderFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;

    // 화물 존재 여부 확인
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: '존재하지 않는 화물입니다.' },
        { status: 404 }
      );
    }

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'flowStatus',
      'cargoName',
      'cargoWeight',
      'cargoUnit',
      'cargoQuantity',
      'packagingType',
      'vehicleType',
      'vehicleCount',
      'priceAmount',
      'priceType',
      'taxType',
      'pickupAddressId',
      'deliveryAddressId',
      'pickupSnapshot',
      'deliverySnapshot',
      'pickupDate',
      'deliveryDate',
      'isCanceled',
      'memo',
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
      updatedBy: request.headers.get('x-user-id') || uuidv4(),
      updatedBySnapshot: {
        id: request.headers.get('x-user-id') || uuidv4(),
        name: request.headers.get('x-user-name') || 'System',
        email: request.headers.get('x-user-email') || 'system@example.com',
        phone: request.headers.get('x-user-phone') || '',
        role: request.headers.get('x-user-role') || 'system',
      },
    };

    // 화물 정보 업데이트
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // 변경 이력 기록 (화물 변경 로깅 함수가 있다면 여기서 사용)
    // TODO: 나중에 화물 변경 로그 기능이 구현되면 활성화
    /*
    await logOrderChange({
      orderId: id,
      changedBy: request.headers.get('x-user-id') || uuidv4(),
      changedByName: request.headers.get('x-user-name') || 'System',
      changedByEmail: request.headers.get('x-user-email') || 'system@example.com',
      changeType: 'update',
      oldData: {
        ...existingOrder,
        updatedAt: existingOrder.updatedAt?.toISOString(),
      },
      newData: {
        ...updatedOrder,
        updatedAt: updatedOrder.updatedAt?.toISOString(),
      },
      reason: reason || undefined,
    });
    */

    return NextResponse.json({
      message: '화물 정보가 성공적으로 업데이트되었습니다.',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('화물 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 