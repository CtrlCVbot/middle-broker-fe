import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { eq } from 'drizzle-orm';
import { IUpdateOrderRequest } from '@/types/order1';
import { generateAddressSnapshot } from '@/utils/address';
import { getCurrentUser } from '@/utils/auth';

// 화물 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, params.orderId),
    });

    if (!order) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크
    if (order.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('화물 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 화물 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = (await req.json()) as IUpdateOrderRequest;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 기존 주문 조회
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, params.orderId),
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: '화물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크
    if (existingOrder.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      updatedBy: currentUser.id,
      updatedBySnapshot: {
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
        position: currentUser.position,
      },
      updatedAt: new Date(),
    };

    // 기본 정보 업데이트
    if (body.orderName) updateData.orderName = body.orderName;

    // 화물 정보 업데이트
    if (body.cargo) {
      if (body.cargo.name) updateData.cargoName = body.cargo.name;
      if (body.cargo.weight) updateData.cargoWeight = body.cargo.weight;
      if (body.cargo.unit) updateData.cargoUnit = body.cargo.unit;
      if (body.cargo.quantity) updateData.cargoQuantity = body.cargo.quantity;
      if (body.cargo.packagingType) updateData.packagingType = body.cargo.packagingType;
    }

    // 차량 정보 업데이트
    if (body.vehicle) {
      if (body.vehicle.type) updateData.vehicleType = body.vehicle.type;
      if (body.vehicle.count) updateData.vehicleCount = body.vehicle.count;
    }

    // 가격 정보 업데이트
    if (body.price) {
      if (body.price.amount) updateData.priceAmount = body.price.amount;
      if (body.price.priceType) updateData.priceType = body.price.priceType;
      if (body.price.taxType) updateData.taxType = body.price.taxType;
    }

    // 주소 정보 업데이트
    if (body.route) {
      if (body.route.pickupAddressId && body.route.pickupAddressId !== existingOrder.pickupAddressId) {
        updateData.pickupAddressId = body.route.pickupAddressId;
        updateData.pickupSnapshot = await generateAddressSnapshot(body.route.pickupAddressId);
      }
      if (body.route.deliveryAddressId && body.route.deliveryAddressId !== existingOrder.deliveryAddressId) {
        updateData.deliveryAddressId = body.route.deliveryAddressId;
        updateData.deliverySnapshot = await generateAddressSnapshot(body.route.deliveryAddressId);
      }
      if (body.route.pickupDate) updateData.pickupDate = new Date(body.route.pickupDate);
      if (body.route.deliveryDate) updateData.deliveryDate = new Date(body.route.deliveryDate);
    }

    // 메모 업데이트
    if (body.memo !== undefined) updateData.memo = body.memo;

    // DB 업데이트
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, params.orderId))
      .returning();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('화물 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 