import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { eq } from 'drizzle-orm';
import { generateOrderNumber } from '@/utils/order';
import { ICreateOrderRequest, IOrderResponse } from '@/types/order1';
import { generateAddressSnapshot } from '@/utils/address';
import { getCurrentUser } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ICreateOrderRequest;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 주소 스냅샷 생성
    const pickupSnapshot = await generateAddressSnapshot(body.route.pickupAddressId);
    const deliverySnapshot = await generateAddressSnapshot(body.route.deliveryAddressId);

    // 주문 번호 생성
    const orderNumber = await generateOrderNumber();

    // 주문 생성
    const [newOrder] = await db.insert(orders).values({
      companyId: currentUser.companyId,
      orderNumber,
      orderName: body.orderName,
      
      // 화물 정보
      cargoName: body.cargo.name,
      cargoWeight: body.cargo.weight,
      cargoUnit: body.cargo.unit,
      cargoQuantity: body.cargo.quantity,
      packagingType: body.cargo.packagingType,

      // 차량 정보
      vehicleType: body.vehicle.type,
      vehicleCount: body.vehicle.count,

      // 가격 정보
      priceAmount: body.price.amount,
      priceType: body.price.priceType,
      taxType: body.price.taxType,

      // 주소 정보
      pickupAddressId: body.route.pickupAddressId,
      deliveryAddressId: body.route.deliveryAddressId,
      pickupSnapshot,
      deliverySnapshot,

      // 일정 정보
      pickupDate: new Date(body.route.pickupDate),
      deliveryDate: new Date(body.route.deliveryDate),

      // 메모
      memo: body.memo,

      // 생성자 정보
      createdBy: currentUser.id,
      createdBySnapshot: {
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
        position: currentUser.position,
      },
      updatedBy: currentUser.id,
      updatedBySnapshot: {
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
        position: currentUser.position,
      },
    }).returning();

    const response: IOrderResponse = {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      createdAt: newOrder.createdAt?.toISOString() || '',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('화물 등록 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 화물 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 전체 데이터 수 조회
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.companyId, currentUser.companyId));

    // 페이지네이션된 데이터 조회
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.companyId, currentUser.companyId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      data: orderList,
      pagination: {
        total: totalCount[0].count,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('화물 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 