import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderFlowStatusEnum, orders, vehicleTypeEnum, vehicleWeightEnum } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { users } from '@/db/schema/users';
import { eq, and, ilike, or, sql, desc, asc, gte, lte, inArray } from 'drizzle-orm';
import { orderWithDispatchQuerySchema, IOrderWithDispatchListResponse, IOrderWithDispatchItem } from '@/types/order-with-dispatch';
import { z } from 'zod';
import { generateMockDispatchData } from './mock';

import { chargeGroups } from '@/db/schema/chargeGroups';
import { chargeLines } from '@/db/schema/chargeLines';

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
    
    console.log('API 요청 파라미터:', queryParams);
    
    // 요청 파라미터 검증
    const validatedQuery = orderWithDispatchQuerySchema.parse(queryParams);

    // *** 임시: Mock 데이터 반환으로 변경 - 테스트용! ***
    /*console.log('DB 쿼리 대신 Mock 데이터 생성');
    const mockResponse = generateMockDispatchData(searchParams);
    
    // 디버깅 로그
    console.log('Mock 응답 데이터 구조:', {
      dataLength: mockResponse.data.length,
      hasValidData: mockResponse.data.some(item => item.dispatch !== null),
      pagination: {
        total: mockResponse.total,
        page: mockResponse.page,
        pageSize: mockResponse.pageSize,
        totalPages: mockResponse.totalPages
      }
    });
    
    return NextResponse.json(mockResponse);*/
    
    // 실제 DB 쿼리 코드 (테스트 후 주석 해제)    
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
      conditions.push(eq(orders.flowStatus, flowStatus as (typeof orderFlowStatusEnum.enumValues)[number]));
    }
    
    if (vehicleType) {
      conditions.push(eq(orders.requestedVehicleType, vehicleType as (typeof vehicleTypeEnum.enumValues)[number]));
    }
    
    if (vehicleWeight) {
      conditions.push(eq(orders.requestedVehicleWeight, vehicleWeight as (typeof vehicleWeightEnum.enumValues)[number]));
    }
    
    if (pickupCity) {
      conditions.push(sql`${orders.pickupAddressSnapshot}->>'city' ILIKE ${`%${pickupCity}%`}`);
    }
    
    if (deliveryCity) {
      conditions.push(sql`${orders.deliveryAddressSnapshot}->>'city' ILIKE ${`%${deliveryCity}%`}`);
    }
    
    if (startDate) {
      conditions.push(gte(orders.pickupDate, startDate));
    }
    
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      conditions.push(lte(orders.pickupDate, nextDay.toISOString().split('T')[0]));
    }
    
    if (companyId) {
      conditions.push(eq(orders.companyId, companyId));
    }
    
    // 배차 여부로 필터링
    if (hasDispatch === 'true') {
      conditions.push(sql`${orderDispatches.id} IS NOT NULL`);
      //250711 운송 마감된 화물 진행중 탭에서 안보이게 하기 위해서.
      conditions.push(eq(orderDispatches.isClosed, false));
    } else if (hasDispatch === 'false') {
      conditions.push(sql`${orderDispatches.id} IS NULL`);      
    }
    
    // 최종 WHERE 조건 구성
    const whereClause = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    // 안전한 정렬 함수 정의
    function getSafeOrderColumn(table: any, columnName: string) {
      return table[columnName] || table.id; // 컬럼이 없으면 id로 대체
    }

    // 정렬 조건 설정
    const orderByClause = sortOrder === 'desc'
      ? (sortBy.startsWith('dispatch.') 
          ? asc(getSafeOrderColumn(orderDispatches, sortBy.replace('dispatch.', '')))
          : asc(getSafeOrderColumn(orders, sortBy)))
      : (sortBy.startsWith('dispatch.') 
          ? desc(getSafeOrderColumn(orderDispatches, sortBy.replace('dispatch.', '')))
          : desc(getSafeOrderColumn(orders, sortBy)));
    
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
        estimatedDistance: orders.estimatedDistanceKm,
        estimatedPriceAmount: orders.estimatedPriceAmount,
        priceType: orders.priceType,
        taxType: orders.taxType,
        memo: orders.memo,
        isCanceled: orders.isCanceled,
        companyId: orders.companyId,
        companySnapshot: orders.companySnapshot || undefined,
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
        dispatchCreatedBySnapshot: orderDispatches.createdBySnapshot || undefined,
        dispatchUpdatedBy: orderDispatches.updatedBy,
        dispatchUpdatedBySnapshot: orderDispatches.updatedBySnapshot || undefined,
        dispatchCreatedAt: orderDispatches.createdAt,
        dispatchUpdatedAt: orderDispatches.updatedAt,
        isClosed: orderDispatches.isClosed,

       
      })
      .from(orders)
      .leftJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);
    

    //console.log("result-->", result);

    /*
    청구, 배차금 조회 쿼리 추가
    */
    // 1. orderIds만 추출
    const orderIds = result.map(o => o.orderId);

    const buildChargeSummarySQL = () => sql<string>`COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'groupId', ${chargeGroups.id},
          'stage', ${chargeGroups.stage},
          'reason', ${chargeGroups.reason},
          'description', ${chargeGroups.description},
          'isLocked', ${chargeGroups.isLocked},
          'totalAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id}),
          'salesAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id} AND cl.side = 'sales'),
          'purchaseAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id} AND cl.side = 'purchase'),
          'lines', (
            SELECT json_agg(
              jsonb_build_object(
                'id', cl.id,
                'side', cl.side,
                'amount', cl.amount,
                'memo', cl.memo,
                'taxRate', cl.tax_rate,
                'taxAmount', cl.tax_amount
              )
            )
            FROM charge_lines cl
            WHERE cl.group_id = ${chargeGroups.id}
          )
        )
      ) FILTER (WHERE ${chargeGroups.id} IS NOT NULL),
      '[]'::json
    )`;

    const parseChargeSummary = (raw: any) => {
      // raw가 이미 객체이므로 JSON.parse 불필요
      const chargeGroups = Array.isArray(raw) ? raw : [];
      const totalAmount = chargeGroups.reduce((sum: number, g: any) => sum + (g.totalAmount || 0), 0);
      const salesAmount = chargeGroups.reduce((sum: number, g: any) => sum + (g.salesAmount || 0), 0);
      const purchaseAmount = chargeGroups.reduce((sum: number, g: any) => sum + (g.purchaseAmount || 0), 0);
    
      return {
        groups: chargeGroups,
        summary: {
          totalAmount,
          salesAmount,
          purchaseAmount,
          profit: salesAmount - purchaseAmount
        }
      };
    };

    // 2. charge summary 조회
    const chargeGroupsResult = await db
      .select({
        orderId: chargeGroups.orderId,
        summary: buildChargeSummarySQL()
      })
      .from(chargeGroups)
      .where(inArray(chargeGroups.orderId, orderIds))
      .groupBy(chargeGroups.orderId);

    console.log("chargeGroupsResult-->", chargeGroupsResult);
    console.log("chargeGroupsResult-->", chargeGroupsResult[0]?.summary);
    // 4. orders + chargeGroups 매핑
    const chargeMap = new Map(chargeGroupsResult.map(cg => [cg.orderId, parseChargeSummary(cg.summary)]));
    const final = result.map(o => ({
      ...o,
      charge: chargeMap.get(o.orderId) ?? { groups: [], summary: { totalAmount: 0, salesAmount: 0, purchaseAmount: 0, profit: 0 } }
    }));

    // IOrderWithDispatchItem 타입에 맞게 order, dispatch, charge를 포함하는 객체로 변환
    const formattedResult: IOrderWithDispatchItem[] = final.map(item => {
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
          date: item.pickupDate?.toString().split('T')[0] || '',
          time: item.pickupTime || '',
        },
        delivery: {
          name: item.deliveryName || '',
          contactName: item.deliveryContactName || '',
          contactPhone: item.deliveryContactPhone || '',
          address: item.deliveryAddressSnapshot,
          date: item.deliveryDate?.toString().split('T')[0] || '',
          time: item.deliveryTime || '',
        },
        estimatedDistance: item.estimatedDistance ? Number(item.estimatedDistance) : undefined,
        estimatedPriceAmount: item.estimatedPriceAmount ? Number(item.estimatedPriceAmount) : undefined,
        priceType: item.priceType || '',
        taxType: item.taxType || '',
        memo: item.memo || '',
        isCanceled: item.isCanceled || false,
        companyId: item.companyId || '',
        companySnapshot: item.companySnapshot || undefined,
        createdAt: item.createdAt?.toISOString() || '',
        updatedAt: item.updatedAt?.toISOString() || '',
      } as any;
      // 배차 정보 (없을 수도 있음)
      const dispatchInfo = item.dispatchId ? {
        id: item.dispatchId,
        brokerCompanyId: item.brokerCompanyId || '',
        brokerCompanySnapshot: item.brokerCompanySnapshot || undefined,
        brokerManagerId: item.brokerManagerId || '',
        brokerManagerSnapshot: item.brokerManagerSnapshot || undefined,
        assignedDriverId: item.assignedDriverId || '',
        assignedDriverSnapshot: item.assignedDriverSnapshot || undefined,
        assignedDriverPhone: item.assignedDriverPhone || '',
        assignedVehicleNumber: item.assignedVehicleNumber || '',
        assignedVehicleType: item.assignedVehicleType || '',
        assignedVehicleWeight: item.assignedVehicleWeight || '',
        assignedVehicleConnection: item.assignedVehicleConnection || '',
        agreedFreightCost: item.agreedFreightCost ? Number(item.agreedFreightCost) : undefined,
        brokerMemo: item.brokerMemo || '',
        createdBy: item.dispatchCreatedBy || '',
        createdBySnapshot: item.dispatchCreatedBySnapshot || undefined,
        updatedBy: item.dispatchUpdatedBy || '',
        updatedBySnapshot: item.dispatchUpdatedBySnapshot || undefined,
        createdAt: item.dispatchCreatedAt?.toISOString() || '',
        updatedAt: item.dispatchUpdatedAt?.toISOString() || '',
        isClosed: item.isClosed || false,
      } : {
        id: '',
        brokerCompanyId: '',
        brokerCompanySnapshot: undefined,
        brokerManagerId: '',
        brokerManagerSnapshot: undefined,
        assignedDriverId: '',
        assignedDriverSnapshot: undefined,
        assignedDriverPhone: '',
        assignedVehicleNumber: '',
        assignedVehicleType: '',
        assignedVehicleWeight: '',
        assignedVehicleConnection: '',
        agreedFreightCost: 0,
        brokerMemo: '',
        createdBy: '',
        createdBySnapshot: undefined,
        updatedBy: '',
        updatedBySnapshot: undefined,
        createdAt: '',
        updatedAt: '',
        isClosed: false,
      };
      // charge 필드 추가
      return {
        order: orderInfo,
        dispatch: dispatchInfo,
        charge: item.charge
      };
    });

    //console.log("formattedResult-->", formattedResult);
    
    // 응답 반환
    const response: IOrderWithDispatchListResponse = {
      success: true,
      data: formattedResult,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
    
    console.log('API 응답 데이터 구조:', {
      dataLength: response.data.length,
      hasValidData: response.data.some(item => item.dispatch !== null),
      pagination: {
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages
      }
    });
    
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