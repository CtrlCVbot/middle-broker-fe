import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { users } from '@/db/schema/users';
import { eq, and, ilike, or, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { orderWithDispatchQuerySchema, IOrderWithDispatchListResponse, IOrderWithDispatchItem } from '@/types/order-with-dispatch';
import { z } from 'zod';

/**
 * 주문 목록을 배차 정보와 함께 조회합니다.
 * 
 * @method GET
 * @route /api/orders/with-dispatch
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // 요청 파라미터 검증
    const validatedQuery = orderWithDispatchQuerySchema.parse(queryParams);
    
    // 페이지네이션 파라미터
    const page = validatedQuery.page;
    const pageSize = validatedQuery.pageSize;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const keyword = validatedQuery.keyword;
    const flowStatus = validatedQuery.flowStatus;
    const vehicleType = validatedQuery.vehicleType;
    const vehicleWeight = validatedQuery.vehicleWeight;
    const pickupCity = validatedQuery.pickupCity;
    const deliveryCity = validatedQuery.deliveryCity;
    const startDate = validatedQuery.startDate;
    const endDate = validatedQuery.endDate;
    const companyId = validatedQuery.companyId;
    const hasDispatch = validatedQuery.hasDispatch;
    const sortBy = validatedQuery.sortBy;
    const sortOrder = validatedQuery.sortOrder;
    
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
      conditions.push(eq(orders.flowStatus, flowStatus));
    }
    
    if (vehicleType) {
      conditions.push(eq(orders.requestedVehicleType, vehicleType));
    }
    
    if (vehicleWeight) {
      conditions.push(eq(orders.requestedVehicleWeight, vehicleWeight));
    }
    
    if (pickupCity) {
      conditions.push(sql`${orders.pickupAddressSnapshot}->>'city' ILIKE ${`%${pickupCity}%`}`);
    }
    
    if (deliveryCity) {
      conditions.push(sql`${orders.deliveryAddressSnapshot}->>'city' ILIKE ${`%${deliveryCity}%`}`);
    }
    
    if (startDate) {
      conditions.push(gte(orders.pickupDate, new Date(startDate)));
    }
    
    if (endDate) {
      // endDate에 하루를 더해 당일 23:59:59까지 포함
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      conditions.push(lte(orders.pickupDate, nextDay));
    }
    
    if (companyId) {
      conditions.push(eq(orders.companyId, companyId));
    }
    
    // 배차 여부로 필터링
    if (hasDispatch === 'true') {
      conditions.push(sql`${orderDispatches.id} IS NOT NULL`);
    } else if (hasDispatch === 'false') {
      conditions.push(sql`${orderDispatches.id} IS NULL`);
    }
    
    // 최종 WHERE 조건 구성
    const whereClause = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    // 정렬 조건 설정
    const orderByClause = sortOrder === 'asc'
      ? (sortBy.startsWith('dispatch.') 
          ? asc(orderDispatches[sortBy.replace('dispatch.', '') as keyof typeof orderDispatches]) 
          : asc(orders[sortBy as keyof typeof orders]))
      : (sortBy.startsWith('dispatch.') 
          ? desc(orderDispatches[sortBy.replace('dispatch.', '') as keyof typeof orderDispatches]) 
          : desc(orders[sortBy as keyof typeof orders]));
    
    // 전체 카운트 쿼리 실행
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .leftJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
      .where(whereClause);
    
    const total = totalCountResult[0].count || 0;
    
    // 데이터 조회 쿼리 실행
    const result = await db
      .select({
        // 주문 정보
        orderId: orders.id,
        flowStatus: orders.flowStatus,
        cargoName: orders.cargoName,
        requestedVehicleType: orders.requestedVehicleType,
        requestedVehicleWeight: orders.requestedVehicleWeight,
        pickupName: orders.pickupName,
        pickupContactName: orders.pickupContactName,
        pickupContactPhone: orders.pickupContactPhone,
        pickupAddressSnapshot: orders.pickupAddressSnapshot,
        pickupDate: orders.pickupDate,
        pickupTime: orders.pickupTime,
        deliveryName: orders.deliveryName,
        deliveryContactName: orders.deliveryContactName,
        deliveryContactPhone: orders.deliveryContactPhone,
        deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
        deliveryDate: orders.deliveryDate,
        deliveryTime: orders.deliveryTime,
        estimatedDistance: orders.estimatedDistance,
        estimatedPriceAmount: orders.estimatedPriceAmount,
        priceType: orders.priceType,
        taxType: orders.taxType,
        memo: orders.memo,
        isCanceled: orders.isCanceled,
        companyId: orders.companyId,
        companySnapshot: orders.companySnapshot,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        
        // 배차 정보 (없을 수도 있음)
        dispatchId: orderDispatches.id,
        brokerCompanyId: orderDispatches.brokerCompanyId,
        brokerCompanySnapshot: orderDispatches.brokerCompanySnapshot,
        brokerManagerId: orderDispatches.brokerManagerId,
        brokerManagerSnapshot: orderDispatches.brokerManagerSnapshot,
        assignedDriverId: orderDispatches.assignedDriverId,
        assignedDriverSnapshot: orderDispatches.assignedDriverSnapshot,
        assignedDriverPhone: orderDispatches.assignedDriverPhone,
        assignedVehicleNumber: orderDispatches.assignedVehicleNumber,
        assignedVehicleType: orderDispatches.assignedVehicleType,
        assignedVehicleWeight: orderDispatches.assignedVehicleWeight,
        assignedVehicleConnection: orderDispatches.assignedVehicleConnection,
        agreedFreightCost: orderDispatches.agreedFreightCost,
        brokerMemo: orderDispatches.brokerMemo,
        dispatchCreatedBy: orderDispatches.createdBy,
        dispatchCreatedBySnapshot: orderDispatches.createdBySnapshot,
        dispatchUpdatedBy: orderDispatches.updatedBy,
        dispatchUpdatedBySnapshot: orderDispatches.updatedBySnapshot,
        dispatchCreatedAt: orderDispatches.createdAt,
        dispatchUpdatedAt: orderDispatches.updatedAt,
      })
      .from(orders)
      .leftJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);
    
    // 응답 데이터 가공
    const formattedResult: IOrderWithDispatchItem[] = result.map(item => {
      // 주문 정보
      const orderInfo = {
        id: item.orderId,
        flowStatus: item.flowStatus || '',
        cargoName: item.cargoName || '',
        requestedVehicleType: item.requestedVehicleType || '',
        requestedVehicleWeight: item.requestedVehicleWeight || '',
        pickup: {
          name: item.pickupName || '',
          contactName: item.pickupContactName || '',
          contactPhone: item.pickupContactPhone || '',
          address: item.pickupAddressSnapshot,
          date: item.pickupDate?.toISOString().split('T')[0] || '',
          time: item.pickupTime || '',
        },
        delivery: {
          name: item.deliveryName || '',
          contactName: item.deliveryContactName || '',
          contactPhone: item.deliveryContactPhone || '',
          address: item.deliveryAddressSnapshot,
          date: item.deliveryDate?.toISOString().split('T')[0] || '',
          time: item.deliveryTime || '',
        },
        estimatedDistance: item.estimatedDistance,
        estimatedPriceAmount: item.estimatedPriceAmount ? Number(item.estimatedPriceAmount) : undefined,
        priceType: item.priceType || '',
        taxType: item.taxType || '',
        memo: item.memo || '',
        isCanceled: item.isCanceled || false,
        companyId: item.companyId || '',
        companySnapshot: item.companySnapshot,
        createdAt: item.createdAt?.toISOString() || '',
        updatedAt: item.updatedAt?.toISOString() || '',
      };
      
      // 배차 정보 (없을 수도 있음)
      const dispatchInfo = item.dispatchId ? {
        id: item.dispatchId,
        brokerCompanyId: item.brokerCompanyId || '',
        brokerCompanySnapshot: item.brokerCompanySnapshot,
        brokerManagerId: item.brokerManagerId || '',
        brokerManagerSnapshot: item.brokerManagerSnapshot,
        assignedDriverId: item.assignedDriverId || '',
        assignedDriverSnapshot: item.assignedDriverSnapshot,
        assignedDriverPhone: item.assignedDriverPhone || '',
        assignedVehicleNumber: item.assignedVehicleNumber || '',
        assignedVehicleType: item.assignedVehicleType || '',
        assignedVehicleWeight: item.assignedVehicleWeight || '',
        assignedVehicleConnection: item.assignedVehicleConnection || '',
        agreedFreightCost: item.agreedFreightCost ? Number(item.agreedFreightCost) : undefined,
        brokerMemo: item.brokerMemo || '',
        createdBy: item.dispatchCreatedBy || '',
        createdBySnapshot: item.dispatchCreatedBySnapshot,
        updatedBy: item.dispatchUpdatedBy || '',
        updatedBySnapshot: item.dispatchUpdatedBySnapshot,
        createdAt: item.dispatchCreatedAt?.toISOString() || '',
        updatedAt: item.dispatchUpdatedAt?.toISOString() || '',
      } : null;
      
      return {
        order: orderInfo,
        dispatch: dispatchInfo,
      };
    });
    
    // 응답 반환
    const response: IOrderWithDispatchListResponse = {
      success: true,
      data: formattedResult,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('주문-배차 목록 조회 중 오류 발생:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '잘못된 요청 형식입니다.', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 