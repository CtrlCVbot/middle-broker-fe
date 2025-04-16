import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/order';
import { eq, sql, desc } from 'drizzle-orm';
import { generateOrderNumber } from '@/utils/order';
import { ICreateOrderRequest, IOrderResponse } from '@/types/order1';
import { generateAddressSnapshot } from '@/utils/address';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ICreateOrderRequest;
    
    // 주소 스냅샷 생성
    const pickupSnapshot = await generateAddressSnapshot(body.route.pickupAddressId);
    const deliverySnapshot = await generateAddressSnapshot(body.route.deliveryAddressId);

    // 주문 번호 생성
    const orderNumber = await generateOrderNumber();

    // 주문 생성
    const [newOrder] = await db.insert(orders).values({
      company_id: body.companyId,
      order_number: orderNumber,
      order_name: body.orderName,
      
      // 화물 정보
      cargo_name: body.cargo.name,
      cargo_weight: body.cargo.weight,
      cargo_unit: body.cargo.unit,
      cargo_quantity: body.cargo.quantity,
      packaging_type: body.cargo.packagingType,

      // 차량 정보
      vehicle_type: body.vehicle.type,
      vehicle_count: body.vehicle.count,

      // 가격 정보
      price_amount: body.price.amount,
      price_type: body.price.priceType,
      tax_type: body.price.taxType,

      // 주소 정보
      pickup_address_id: body.route.pickupAddressId,
      delivery_address_id: body.route.deliveryAddressId,
      pickup_snapshot: pickupSnapshot,
      delivery_snapshot: deliverySnapshot,

      // 일정 정보
      pickup_date: new Date(body.route.pickupDate),
      delivery_date: new Date(body.route.deliveryDate),

      // 메모
      memo: body.memo,

      // 생성/수정 정보
      created_by: body.userId,
      created_by_snapshot: body.userSnapshot,
      updated_by: body.userId,
      updated_by_snapshot: body.userSnapshot,
    }).returning();

    const response: IOrderResponse = {
      id: newOrder.id,
      orderNumber: newOrder.order_number,
      createdAt: newOrder.created_at?.toISOString() || '',
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
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '회사 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 전체 데이터 수 조회
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.company_id, companyId));

    // 페이지네이션된 데이터 조회
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.company_id, companyId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.created_at));

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