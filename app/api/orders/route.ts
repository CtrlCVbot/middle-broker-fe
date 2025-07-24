import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { users } from '@/db/schema/users';
import { IAddressSnapshot, ICompanySnapshot, IOrder, IPriceSnapshot, ITransportOptionsSnapshot, IUserSnapshot, OrderFlowStatus, OrderVehicleType, OrderVehicleWeight } from '@/types/order';
import { z } from 'zod';
import { logOrderChange } from '@/utils/order-change-logger';
import { orderFlowStatusEnum, vehicleTypeEnum, vehicleWeightEnum } from '@/db/schema/orders';
import { format } from 'date-fns';
import { companies } from '@/db/schema/companies';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { chargeLines } from '@/db/schema/chargeLines';
import { inArray } from 'drizzle-orm';
import { IOrderCharge } from '@/types/order-with-dispatch';
import { ChargeService } from '@/services/charge-service';

export async function GET(request: NextRequest) {
  try {    

    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const keyword = searchParams.get('keyword') || '';
    const flowStatus = searchParams.get('flowStatus') as OrderFlowStatus | '';
    const vehicleType = searchParams.get('vehicleType') as OrderVehicleType | '';
    const vehicleWeight = searchParams.get('vehicleWeight') as OrderVehicleWeight | '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');

    

    // 검색 조건 구성
    let conditions = [];

    

    if (keyword) {
      conditions.push(
        or(
          ilike(orders.cargoName, `%${keyword}%`),
          ilike(orders.pickupName, `%${keyword}%`),
          ilike(orders.deliveryName, `%${keyword}%`),
          sql`${orders.pickupAddressSnapshot}->>'roadAddress' ILIKE ${`%${keyword}%`}`,
          sql`${orders.deliveryAddressSnapshot}->>'roadAddress' ILIKE ${`%${keyword}%`}`
        )
      );
    }

    if (flowStatus) {
      conditions.push(eq(orders.flowStatus, 
        flowStatus as (typeof orderFlowStatusEnum.enumValues)[number]));
    }

    if (vehicleType) {
      conditions.push(eq(orders.requestedVehicleType, 
        vehicleType as (typeof vehicleTypeEnum.enumValues)[number]));
    }

    if (vehicleWeight) {
      conditions.push(eq(orders.requestedVehicleWeight, 
        vehicleWeight as (typeof vehicleWeightEnum.enumValues)[number]));
    }

    if (startDate) {
      const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
      const formattedStartDate = formatDateOnly(new Date(startDate));
      conditions.push(sql`${orders.pickupDate} >= ${formattedStartDate}`);
    }

    if (endDate) {
      const formatDateOnly = (date: Date) => date.toISOString().split('T')[0];
      const formattedEndDate = formatDateOnly(new Date(endDate));
      conditions.push(sql`${orders.pickupDate} <= ${formattedEndDate}`);
    }

    if (companyId) {
      conditions.push(eq(orders.companyId, companyId));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, total] = await Promise.all([
      db
        .select({
          // 주문 정보
          order: orders,
          
          // 배차 정보 (없을 수도 있음)
          dispatchId: orderDispatches.id,
          assignedDriverId: orderDispatches.assignedDriverId,
          assignedDriverSnapshot: orderDispatches.assignedDriverSnapshot,
          assignedDriverPhone: orderDispatches.assignedDriverPhone,
          assignedVehicleNumber: orderDispatches.assignedVehicleNumber,
          assignedVehicleConnection: orderDispatches.assignedVehicleConnection,
          
        
        })
        .from(orders)
        .leftJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
        .where(query)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(orders.updatedAt))
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);

    // 운임 정보 병합
    const orderIds = result.map((o: any) => o.order.id || o.order?.id || o.id);
    const chargeService = new ChargeService();
    const chargeMap = await chargeService.getChargeMap(orderIds);
    const final = result.map((o: any) => ({
      ...o,
      charge: chargeMap.get(o.order?.id || o.id) ?? {
        groups: [],
        summary: {
          totalAmount: 0,
          salesAmount: 0,
          purchaseAmount: 0,
          profit: 0
        }
      }
    }));
    return NextResponse.json({
      data: final,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('화물 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 화물 등록 요청 스키마
const CreateOrderSchema = z.object({
  // 화물 정보
  cargoName: z.string().min(2, '화물명은 최소 2자 이상이어야 합니다.'),
  requestedVehicleType: z.enum(['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러']),
  requestedVehicleWeight: z.enum(['1톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤']),
  memo: z.string().optional(),
  
  // 상차지 정보
  pickupAddressId: z.string().uuid().optional(),
  pickupAddressSnapshot: z.any(), // JSON 타입은 any로 처리
  pickupAddressDetail: z.string().optional(),
  pickupName: z.string(),
  pickupContactName: z.string(),
  pickupContactPhone: z.string(),
  pickupDate: z.string(), // 날짜 형식 추가 검증 필요
  pickupTime: z.string(), // 시간 형식 추가 검증 필요
  
  // 하차지 정보
  deliveryAddressId: z.string().uuid().optional(),
  deliveryAddressSnapshot: z.any(), // JSON 타입은 any로 처리
  deliveryAddressDetail: z.string().optional(),
  deliveryName: z.string(),
  deliveryContactName: z.string(),
  deliveryContactPhone: z.string(),
  deliveryDate: z.string(), // 날짜 형식 추가 검증 필요
  deliveryTime: z.string(), // 시간 형식 추가 검증 필요
  
  // 운송 옵션
  transportOptions: z.any().optional(), // JSON 타입은 any로 처리
  
  // 가격 정보
  estimatedDistance: z.number().optional(),
  estimatedPriceAmount: z.number().optional(),
  priceType: z.enum(['기본', '계약']).default('기본'),
  taxType: z.enum(['비과세', '과세']).default('과세'),
  priceSnapshot: z.any().optional(), // JSON 타입은 any로 처리
  
  // 화주 회사 정보
  companyId: z.string().uuid(),
  companySnapshot: z.any().optional(), // JSON 타입은 any로 처리
  
  // 선택된 담당자 정보
  selectedManagerId: z.string().uuid().optional(),

  // 거리 정보
  //estimatedDistanceKm: z.number().optional(),
  estimatedDurationMinutes: z.number().optional(),
  distanceCalculationMethod: z.string().optional(),
  distanceCalculatedAt: z.string().optional(),
  distanceCacheId: z.string().optional(),
  distanceMetadata: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = CreateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';
    console.log('requestUserId:', requestUserId);

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
    
    // 선택된 회사 정보 조회
    const [selectedCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, orderData.companyId))
      .limit(1)
      .execute();

    if (!selectedCompany) {
      return NextResponse.json(
        { error: '선택된 회사를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 선택된 담당자 정보 조회 (있는 경우)
    let selectedManager = null;
    if (orderData.selectedManagerId) {
      const [manager] = await db
        .select()
        .from(users)
        .where(eq(users.id, orderData.selectedManagerId))
        .limit(1)
        .execute();
      
      if (manager) {
        selectedManager = manager;
      }
    }

    // 현재 시간
    const now = new Date();

    console.log('orderData-->', orderData);

    // 화물 생성
    const [createdOrder] = await db
      .insert(orders)
      .values({
        companyId: orderData.companyId,
        companySnapshot: selectedCompany,
        contactUserId: selectedManager?.id || requestUserId,
        contactUserMail: selectedManager?.email || requestUser.email,
        contactUserPhone: selectedManager?.phone_number || requestUser.phone_number,
        
        contactUserSnapshot: {
        name: selectedManager?.name || requestUser.name,
        email: selectedManager?.email || requestUser.email,
        mobile: selectedManager?.phone_number || requestUser.phone_number,
        department: selectedManager?.department || requestUser.department,
        position: selectedManager?.position || requestUser.position,
        }as IUserSnapshot,

        flowStatus: orderFlowStatusEnum.enumValues[0],
        isCanceled: false,
        
        cargoName: orderData.cargoName,
        requestedVehicleType: orderData.requestedVehicleType,
        requestedVehicleWeight: orderData.requestedVehicleWeight,
        memo: orderData.memo,
        
        pickupAddressId: orderData.pickupAddressId,
        pickupAddressSnapshot: orderData.pickupAddressSnapshot,
        pickupAddressDetail: orderData.pickupAddressDetail,
        pickupName: orderData.pickupName,
        pickupContactName: orderData.pickupContactName,
        pickupContactPhone: orderData.pickupContactPhone,
        pickupDate: orderData.pickupDate,
        pickupTime: orderData.pickupTime,

        deliveryAddressId: orderData.deliveryAddressId,
        deliveryAddressSnapshot: orderData.deliveryAddressSnapshot,
        deliveryAddressDetail: orderData.deliveryAddressDetail,
        deliveryName: orderData.deliveryName,
        deliveryContactName: orderData.deliveryContactName,
        deliveryContactPhone: orderData.deliveryContactPhone,
        deliveryDate: orderData.deliveryDate,
        deliveryTime: orderData.deliveryTime,

        transportOptions: orderData.transportOptions,

        estimatedDistanceKm: orderData.estimatedDistance !== undefined ? Number(orderData.estimatedDistance) : null,
        estimatedPriceAmount: orderData.estimatedPriceAmount !== undefined ? Number(orderData.estimatedPriceAmount) : null,
        priceType: orderData.priceType,
        taxType: orderData.taxType,
        priceSnapshot: orderData.priceSnapshot,

        createdBy: requestUserId,
        createdBySnapshot: requestUser,
        createdAt: now,
        updatedBy: requestUserId,
        updatedBySnapshot: requestUser,
        updatedAt: now,

        
        estimatedDurationMinutes: orderData.estimatedDurationMinutes !== undefined ? Number(orderData.estimatedDurationMinutes) : null,
        distanceCalculationMethod: orderData.distanceCalculationMethod,
        distanceCalculatedAt: orderData.distanceCalculatedAt ? new Date(orderData.distanceCalculatedAt) : null,
        distanceCacheId: orderData.distanceCacheId,
        distanceMetadata: orderData.distanceMetadata,
         
      } as any)
      .returning();

    // 변경 이력 기록
    if (typeof logOrderChange === 'function') {
      await logOrderChange({
        orderId: createdOrder.id,
        changedBy: requestUserId,
        changedByName: requestUser.name,
        changedByEmail: requestUser.email,
        changedByAccessLevel: requestUser.system_access_level,
        changeType: 'create',
        newData: createdOrder,
        reason: '신규 화물 등록'
      });
    }

    // 응답 데이터 변환
    const responseData: IOrder = {
      id: createdOrder.id,
      flowStatus: createdOrder.flowStatus,
      cargoName: createdOrder.cargoName || '',
      requestedVehicleType: createdOrder.requestedVehicleType,
      requestedVehicleWeight: createdOrder.requestedVehicleWeight,
      memo: createdOrder.memo || '',
      pickupAddressSnapshot: createdOrder.pickupAddressSnapshot as IAddressSnapshot,
      deliveryAddressSnapshot: createdOrder.deliveryAddressSnapshot as IAddressSnapshot,
      pickupDate: createdOrder.pickupDate || '',
      deliveryDate: createdOrder.deliveryDate || '',
      pickupTime: createdOrder.pickupTime || '',
      deliveryTime: createdOrder.deliveryTime || '',
      transportOptions: createdOrder.transportOptions as ITransportOptionsSnapshot,
      estimatedDistance: createdOrder.estimatedDistanceKm !== undefined ? Number(createdOrder.estimatedDistanceKm) : 0,
      estimatedPriceAmount: createdOrder.estimatedPriceAmount !== undefined ? Number(createdOrder.estimatedPriceAmount) : 0,
      priceType: createdOrder.priceType || '',
      taxType: createdOrder.taxType as '과세' | '면세',
      isCanceled: createdOrder.isCanceled || false,
      companyId: createdOrder.companyId || '',
      companySnapshot: createdOrder.companySnapshot as ICompanySnapshot,
      createdAt: createdOrder.createdAt?.toISOString() || '',
      updatedAt: createdOrder.updatedAt?.toISOString() || '',
      contactUserId: createdOrder.contactUserId || '',
      contactUserPhone: createdOrder.contactUserPhone || '',
      contactUserMail: createdOrder.contactUserMail || '',
      contactUserSnapshot: createdOrder.contactUserSnapshot as IUserSnapshot,
      pickupAddressId: createdOrder.pickupAddressId || '',
      pickupAddressDetail: createdOrder.pickupAddressDetail || '',
      pickupName: createdOrder.pickupName || '',
      pickupContactName: createdOrder.pickupContactName || '',
      pickupContactPhone: createdOrder.pickupContactPhone || '',
      deliveryAddressId: createdOrder.deliveryAddressId || '',
      deliveryAddressDetail: createdOrder.deliveryAddressDetail || '',
      deliveryName: createdOrder.deliveryName || '',
      deliveryContactName: createdOrder.deliveryContactName || '',
      deliveryContactPhone: createdOrder.deliveryContactPhone || '',
      priceSnapshot: createdOrder.priceSnapshot as IPriceSnapshot,
      createdBy: createdOrder.createdBy || '',
      createdBySnapshot: createdOrder.createdBySnapshot as IUserSnapshot,
      updatedBy: createdOrder.updatedBy || '',
      updatedBySnapshot: createdOrder.updatedBySnapshot as IUserSnapshot,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('화물 등록 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 