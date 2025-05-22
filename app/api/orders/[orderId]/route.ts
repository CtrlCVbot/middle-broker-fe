import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { logOrderChange } from '@/utils/order-change-logger';
import { IUserSnapshot } from '@/types/order-ver01';
import { validate as isValidUUID, version as getUUIDVersion } from 'uuid';


// 화물 수정 요청 스키마
const UpdateOrderSchema = z.object({
  // 화물 정보
  cargoName: z.string().min(2, '화물명은 최소 2자 이상이어야 합니다.').optional(),
  requestedVehicleType: z.enum(['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러']).optional(),
  requestedVehicleWeight: z.enum(['1톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤']).optional(),
  memo: z.string().optional(),
  
  // 상차지 정보
  pickupAddressId: z.string().uuid().optional(),
  pickupAddressSnapshot: z.any().optional(),
  pickupAddressDetail: z.string().optional(),
  pickupName: z.string().optional(),
  pickupContactName: z.string().optional(),
  pickupContactPhone: z.string().optional(),
  pickupDate: z.string().optional(), // 날짜 형식 추가 검증 필요
  pickupTime: z.string().optional(), // 시간 형식 추가 검증 필요
  
  // 하차지 정보
  deliveryAddressId: z.string().uuid().optional(),
  deliveryAddressSnapshot: z.any().optional(),
  deliveryAddressDetail: z.string().optional(),
  deliveryName: z.string().optional(),
  deliveryContactName: z.string().optional(),
  deliveryContactPhone: z.string().optional(),
  deliveryDate: z.string().optional(), // 날짜 형식 추가 검증 필요
  deliveryTime: z.string().optional(), // 시간 형식 추가 검증 필요
  
  // 상태 정보
  flowStatus: z.enum([
    '운송요청',
    '배차대기',
    '배차완료',
    '상차대기',
    '상차완료',
    '운송중',
    '하차완료',
    '운송완료'
  ]).optional(),
  
  // 운송 옵션
  transportOptions: z.any().optional(),
  
  // 가격 정보
  estimatedDistance: z.number().optional(),
  estimatedPriceAmount: z.number().optional(),
  priceType: z.enum(['기본', '계약']).optional(),
  taxType: z.enum(['비과세', '과세']).optional(),
  priceSnapshot: z.any().optional()
});

// GET /api/orders/[orderId] - 화물 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log("GET 호출됨");
    console.log("params:", params);
    const { orderId } = await params;
    console.log("orderId:", orderId);

    // UUID 형식 검증
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: '잘못된 화물 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 화물 정보 조회
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .execute();

    if (!order) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 응답 데이터 변환
    // const responseData = {
    //   id: order.id,
    //   flowStatus: order.flowStatus,
    //   cargoName: order.cargoName,
    //   requestedVehicleType: order.requestedVehicleType,
    //   requestedVehicleWeight: order.requestedVehicleWeight,
    //   memo: order.memo,
    //   pickup: {
    //     name: order.pickupName,
    //     contactName: order.pickupContactName,
    //     contactPhone: order.pickupContactPhone,
    //     addressId: order.pickupAddressId,
    //     addressSnapshot: order.pickupAddressSnapshot,
    //     addressDetail: order.pickupAddressDetail,
    //     date: order.pickupDate,
    //     time: order.pickupTime
    //   },
    //   delivery: {
    //     name: order.deliveryName,
    //     contactName: order.deliveryContactName,
    //     contactPhone: order.deliveryContactPhone,
    //     addressId: order.deliveryAddressId,
    //     addressSnapshot: order.deliveryAddressSnapshot,
    //     addressDetail: order.deliveryAddressDetail,
    //     date: order.deliveryDate,
    //     time: order.deliveryTime
    //   },
    //   transportOptions: order.transportOptions,
    //   estimatedDistance: order.estimatedDistance,
    //   estimatedPriceAmount: order.estimatedPriceAmount,
    //   priceType: order.priceType,
    //   taxType: order.taxType,
    //   priceSnapshot: order.priceSnapshot,
    //   isCanceled: order.isCanceled,
    //   company: {
    //     id: order.companyId,
    //     snapshot: order.companySnapshot
    //   },
    //   contact: {
    //     userId: order.contactUserId,
    //     phone: order.contactUserPhone,
    //     email: order.contactUserMail,
    //     snapshot: order.contactUserSnapshot
    //   },
    //   created: {
    //     by: order.createdBy,
    //     at: order.createdAt?.toISOString(),
    //     snapshot: order.createdBySnapshot
    //   },
    //   updated: {
    //     by: order.updatedBy,
    //     at: order.updatedAt?.toISOString(),
    //     snapshot: order.updatedBySnapshot
    //   }
    // };

    return NextResponse.json(
      order
    );
  } catch (error) {
    console.error('화물 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[orderId] - 화물 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // UUID 형식 검증
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: '잘못된 화물 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = UpdateOrderSchema.safeParse(body);
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

    // 화물 존재 여부 확인
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .execute();

    if (!existingOrder) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 시간
    const now = new Date();

    // 업데이트 데이터 준비
    const updateValues: any = {
      updatedBy: requestUserId,
      updatedBySnapshot: {
        name: requestUser.name,
        email: requestUser.email,
        mobile: requestUser.phone_number,
        department: requestUser.department,
        position: requestUser.position,
      },
      updatedAt: now
    };

    // 화물 정보 업데이트
    if (updateData.cargoName) updateValues.cargoName = updateData.cargoName;
    if (updateData.requestedVehicleType) updateValues.requestedVehicleType = updateData.requestedVehicleType;
    if (updateData.requestedVehicleWeight) updateValues.requestedVehicleWeight = updateData.requestedVehicleWeight;
    if (updateData.memo !== undefined) updateValues.memo = updateData.memo;
    
    // 상차지 정보 업데이트
    if (updateData.pickupAddressId) updateValues.pickupAddressId = updateData.pickupAddressId;
    if (updateData.pickupAddressSnapshot) updateValues.pickupAddressSnapshot = updateData.pickupAddressSnapshot;
    if (updateData.pickupAddressDetail !== undefined) updateValues.pickupAddressDetail = updateData.pickupAddressDetail;
    if (updateData.pickupName) updateValues.pickupName = updateData.pickupName;
    if (updateData.pickupContactName) updateValues.pickupContactName = updateData.pickupContactName;
    if (updateData.pickupContactPhone) updateValues.pickupContactPhone = updateData.pickupContactPhone;
    if (updateData.pickupDate) updateValues.pickupDate = new Date(updateData.pickupDate);
    if (updateData.pickupTime) updateValues.pickupTime = updateData.pickupTime;
    
    // 하차지 정보 업데이트
    if (updateData.deliveryAddressId) updateValues.deliveryAddressId = updateData.deliveryAddressId;
    if (updateData.deliveryAddressSnapshot) updateValues.deliveryAddressSnapshot = updateData.deliveryAddressSnapshot;
    if (updateData.deliveryAddressDetail !== undefined) updateValues.deliveryAddressDetail = updateData.deliveryAddressDetail;
    if (updateData.deliveryName) updateValues.deliveryName = updateData.deliveryName;
    if (updateData.deliveryContactName) updateValues.deliveryContactName = updateData.deliveryContactName;
    if (updateData.deliveryContactPhone) updateValues.deliveryContactPhone = updateData.deliveryContactPhone;
    if (updateData.deliveryDate) updateValues.deliveryDate = new Date(updateData.deliveryDate);
    if (updateData.deliveryTime) updateValues.deliveryTime = updateData.deliveryTime;
    
    // 상태 정보 업데이트
    if (updateData.flowStatus) updateValues.flowStatus = updateData.flowStatus;
    
    // 운송 옵션 업데이트
    if (updateData.transportOptions) updateValues.transportOptions = updateData.transportOptions;
    
    // 가격 정보 업데이트
    if (updateData.estimatedDistance !== undefined) updateValues.estimatedDistance = updateData.estimatedDistance;
    if (updateData.estimatedPriceAmount !== undefined) updateValues.estimatedPriceAmount = updateData.estimatedPriceAmount;
    if (updateData.priceType) updateValues.priceType = updateData.priceType;
    if (updateData.taxType) updateValues.taxType = updateData.taxType;
    if (updateData.priceSnapshot) updateValues.priceSnapshot = updateData.priceSnapshot;

    // 화물 정보 업데이트
    const [updatedOrder] = await db
      .update(orders)
      .set(updateValues)
      .where(eq(orders.id, orderId))
      .returning();

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      await logOrderChange({
        orderId: updatedOrder.id,
        changedBy: requestUserId,
        changedByName: requestUser.name,
        changedByEmail: requestUser.email,
        changedByAccessLevel: requestUser.system_access_level,
        changeType: 'update',
        oldData: existingOrder,
        newData: updatedOrder,
        reason: body.reason || '화물 정보 업데이트'
      });
    }

    // 응답 데이터 변환
    const responseData = {
      id: updatedOrder.id,
      flowStatus: updatedOrder.flowStatus,
      cargoName: updatedOrder.cargoName,
      requestedVehicleType: updatedOrder.requestedVehicleType,
      requestedVehicleWeight: updatedOrder.requestedVehicleWeight,
      memo: updatedOrder.memo,
      pickup: {
        name: updatedOrder.pickupName,
        contactName: updatedOrder.pickupContactName,
        contactPhone: updatedOrder.pickupContactPhone,
        addressId: updatedOrder.pickupAddressId,
        addressSnapshot: updatedOrder.pickupAddressSnapshot,
        addressDetail: updatedOrder.pickupAddressDetail,
        date: updatedOrder.pickupDate,
        time: updatedOrder.pickupTime
      },
      delivery: {
        name: updatedOrder.deliveryName,
        contactName: updatedOrder.deliveryContactName,
        contactPhone: updatedOrder.deliveryContactPhone,
        addressId: updatedOrder.deliveryAddressId,
        addressSnapshot: updatedOrder.deliveryAddressSnapshot,
        addressDetail: updatedOrder.deliveryAddressDetail,
        date: updatedOrder.deliveryDate,
        time: updatedOrder.deliveryTime
      },
      isCanceled: updatedOrder.isCanceled,
      updatedAt: updatedOrder.updatedAt?.toISOString()
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('화물 정보 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[orderId] - 화물 삭제 (실제 삭제가 아닌 취소 처리)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // UUID 형식 검증
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: '잘못된 화물 ID 형식입니다.' },
        { status: 400 }
      );
    }

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

    // 화물 존재 여부 확인
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .execute();

    if (!existingOrder) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 취소된 화물인지 확인
    if (existingOrder.isCanceled) {
      return NextResponse.json(
        { error: '이미 취소된 화물입니다.' },
        { status: 400 }
      );
    }

    // 현재 시간
    const now = new Date();

    // 화물 취소 처리 (실제 삭제가 아닌 소프트 삭제)
    const [canceledOrder] = await db
      .update(orders)
      .set({
        isCanceled: true,
        updatedBy: requestUserId,
        updatedBySnapshot: {
          name: requestUser.name,
          email: requestUser.email,
          mobile: requestUser.phone_number,
          department: requestUser.department,
          position: requestUser.position,
        } as IUserSnapshot,
        updatedAt: now
      })
      .where(eq(orders.id, orderId))
      .returning();

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      await logOrderChange({
        orderId: canceledOrder.id,
        changedBy: requestUserId,
        changedByName: requestUser.name,
        changedByEmail: requestUser.email,
        changedByAccessLevel: requestUser.system_access_level,
        changeType: 'cancel',
        oldData: existingOrder,
        newData: canceledOrder,
        reason: '화물 취소'
      });
    }

    return NextResponse.json({
      message: '화물이 성공적으로 취소되었습니다.',
      id: orderId,
      canceledAt: now.toISOString()
    });
  } catch (error) {
    console.error('화물 취소 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 