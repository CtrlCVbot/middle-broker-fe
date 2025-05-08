import { db } from '@/db';
import { orders, orderFlowStatusEnum } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { desc, and, eq, or, ilike, gte, lte, inArray, like, sql } from 'drizzle-orm';
import { ICreateDispatchPayload, IDispatchListQuery, IOrderDispatchListItem, IOrderDispatchDetail, IUpdateDispatchPayload } from '@/types/broker-dispatch';
import { ICompanySnapshot, IUserSnapshot } from '@/types/order-ver01';

/**
 * 주선사 배차 목록을 조회합니다.
 */
export async function getDispatchList(query: IDispatchListQuery, userId: string): Promise<{
  data: IOrderDispatchListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const {
    page = 1,
    pageSize = 10,
    brokerCompanyId,
    brokerManagerId,
    dispatchStatus,
    assignedDriverId,
    assignedVehicleNumber,
    startDate,
    endDate,
    keyword,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  // 조건절 구성
  const whereConditions = [];
  
  // 기본 필터 조건: 현재 사용자의 주선사 회사 소속인 경우만 조회 (실제 구현 시 사용자 권한에 따라 조정 필요)
  // 여기서는 간단히 전달된 brokerCompanyId를 사용하지만, 실제로는 현재 로그인한 사용자의 소속을 확인해야 함
  if (brokerCompanyId) {
    whereConditions.push(eq(orderDispatches.brokerCompanyId, brokerCompanyId));
  }
  
  // 추가 필터 조건들
  if (brokerManagerId) {
    whereConditions.push(eq(orderDispatches.brokerManagerId, brokerManagerId));
  }
  
  if (assignedDriverId) {
    whereConditions.push(eq(orderDispatches.assignedDriverId, assignedDriverId));
  }
  
  if (assignedVehicleNumber) {
    whereConditions.push(like(orderDispatches.assignedVehicleNumber, `%${assignedVehicleNumber}%`));
  }
  
  if (startDate) {
    whereConditions.push(gte(orderDispatches.createdAt, new Date(startDate)));
  }
  
  if (endDate) {
    // endDate에 하루를 더해 당일 23:59:59까지 포함
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    whereConditions.push(lte(orderDispatches.createdAt, nextDay));
  }
  
  // 키워드 검색 (주문명, 상/하차지, 차량번호, 기사명 등에서 검색)
  if (keyword) {
    // 실제 구현 시 join 등을 통해 관련 필드 모두 검색 가능하게 확장 필요
    // 여기서는 간단한 예시만 제공
    whereConditions.push(
      or(
        like(sql`orders.cargo_name`, `%${keyword}%`),
        like(orderDispatches.assignedVehicleNumber, `%${keyword}%`),
        // 추가 검색 조건...
      )
    );
  }
  
  // 최종 WHERE 조건 구성
  const whereClause = whereConditions.length > 0 
    ? and(...whereConditions) 
    : undefined;
  
  // 전체 카운트 쿼리 실행
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orderDispatches)
    .leftJoin(orders, eq(orderDispatches.orderId, orders.id))
    .where(whereClause);
  
  const total = totalCountResult[0].count || 0;
  
  // 페이지네이션 적용
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  
  // 정렬 조건 결정
  const orderByClause = sortOrder === 'asc' 
    ? sql`${orderDispatches[sortBy as keyof typeof orderDispatches]} asc` 
    : sql`${orderDispatches[sortBy as keyof typeof orderDispatches]} desc`;
  
  // 데이터 조회 쿼리 실행
  const dispatches = await db
    .select({
      dispatchId: orderDispatches.id,
      orderId: orderDispatches.orderId,
      orderFlowStatus: orders.flowStatus,
      cargoName: orders.cargoName,
      requestedVehicleType: orders.requestedVehicleType,
      requestedVehicleWeight: orders.requestedVehicleWeight,
      pickupAddressSnapshot: orders.pickupAddressSnapshot,
      deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
      pickupDate: orders.pickupDate,
      pickupTime: orders.pickupTime,
      deliveryDate: orders.deliveryDate,
      deliveryTime: orders.deliveryTime,
      brokerManagerSnapshot: orderDispatches.brokerManagerSnapshot,
      assignedVehicleNumber: orderDispatches.assignedVehicleNumber,
      assignedDriverSnapshot: orderDispatches.assignedDriverSnapshot,
      agreedFreightCost: orderDispatches.agreedFreightCost,
      createdAt: orderDispatches.createdAt,
    })
    .from(orderDispatches)
    .leftJoin(orders, eq(orderDispatches.orderId, orders.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
  
  // 응답 데이터 구성
  const data: IOrderDispatchListItem[] = dispatches.map(dispatch => {
    // 스냅샷 데이터에서 필요한 정보 추출
    const brokerManagerName = dispatch.brokerManagerSnapshot 
      ? (dispatch.brokerManagerSnapshot as IUserSnapshot).name 
      : undefined;
    
    const assignedDriverName = dispatch.assignedDriverSnapshot 
      ? (dispatch.assignedDriverSnapshot as IUserSnapshot).name 
      : undefined;
    
    // 주소 데이터 가공
    const pickupAddress = dispatch.pickupAddressSnapshot 
      ? `${(dispatch.pickupAddressSnapshot as any).address}` 
      : '';
    
    const deliveryAddress = dispatch.deliveryAddressSnapshot 
      ? `${(dispatch.deliveryAddressSnapshot as any).address}` 
      : '';
    
    // 차량 정보 포맷팅
    const requestedVehicleInfo = `${dispatch.requestedVehicleType} ${dispatch.requestedVehicleWeight}`;
    
    // 날짜/시간 포맷팅
    const pickupDateTime = dispatch.pickupDate && dispatch.pickupTime 
      ? `${dispatch.pickupDate.toString().split('T')[0]} ${dispatch.pickupTime}` 
      : '';
    
    const deliveryDateTime = dispatch.deliveryDate && dispatch.deliveryTime 
      ? `${dispatch.deliveryDate.toString().split('T')[0]} ${dispatch.deliveryTime}` 
      : '';
    
    return {
      dispatchId: dispatch.dispatchId,
      orderId: dispatch.orderId,
      orderFlowStatus: dispatch.orderFlowStatus || '',
      cargoName: dispatch.cargoName || '',
      requestedVehicleInfo,
      pickupLocation: pickupAddress,
      deliveryLocation: deliveryAddress,
      pickupDateTime,
      deliveryDateTime,
      brokerManagerName,
      assignedVehicleNumber: dispatch.assignedVehicleNumber ?? undefined,
      assignedDriverName,
      agreedFreightCost: dispatch.agreedFreightCost ? Number(dispatch.agreedFreightCost) : undefined,
      createdAt: dispatch.createdAt?.toString() || '',
    };
  });
  
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 특정 배차 정보를 상세 조회합니다.
 */
export async function getDispatchDetail(dispatchId: string): Promise<IOrderDispatchDetail | null> {
  // 배차 정보 조회
  const dispatchResults = await db
    .select()
    .from(orderDispatches)
    .where(eq(orderDispatches.id, dispatchId))
    .limit(1);
  
  if (dispatchResults.length === 0) {
    return null;
  }
  
  const dispatch = dispatchResults[0];
  
  // 연결된 주문 정보 조회
  const orderResults = await db
    .select()
    .from(orders)
    .where(eq(orders.id, dispatch.orderId))
    .limit(1);
  
  if (orderResults.length === 0) {
    return null; // 이상 케이스: 연결된 주문이 없음
  }
  
  const order = orderResults[0];
  
  // 필요한 경우 추가 정보 조회 (예: 브로커 회사명, 담당자 정보 등)
  let brokerCompanyName: string | undefined;
  let brokerManager: { id: string; name: string; phone?: string } | undefined;
  let assignedDriver: { id: string; name: string; phone?: string } | undefined;
  
  // 브로커 회사 정보 조회
  if (dispatch.brokerCompanyId) {
    const companyResults = await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(eq(companies.id, dispatch.brokerCompanyId))
      .limit(1);
    
    if (companyResults.length > 0) {
      brokerCompanyName = companyResults[0].name;
    }
  }
  
  // 브로커 담당자 정보 조회
  if (dispatch.brokerManagerId) {
    const managerResults = await db
      .select({ id: users.id, name: users.name, phone: users.phone_number })
      .from(users)
      .where(eq(users.id, dispatch.brokerManagerId))
      .limit(1);
    
    if (managerResults.length > 0) {
      const manager = managerResults[0];
      brokerManager = {
        id: manager.id,
        name: manager.name,
        phone: manager.phone || '',
      };
    }
  }
  
  // 배차된 기사 정보 조회
  if (dispatch.assignedDriverId) {
    const driverResults = await db
      .select({ id: users.id, name: users.name, phone: users.phone_number })
      .from(users)
      .where(eq(users.id, dispatch.assignedDriverId))
      .limit(1);
    
    if (driverResults.length > 0) {
      const driver = driverResults[0];
      assignedDriver = {
        id: driver.id,
        name: driver.name,
        phone: driver.phone || '',
      };
    }
  }
  
  // 상세 정보 구성 및 반환
  return {
    // 배차 정보
    id: dispatch.id,
    orderId: dispatch.orderId,
    brokerCompanyId: dispatch.brokerCompanyId,
    brokerCompanySnapshot: dispatch.brokerCompanySnapshot as ICompanySnapshot | undefined,
    brokerManagerId: dispatch.brokerManagerId || undefined,
    brokerManagerSnapshot: dispatch.brokerManagerSnapshot as IUserSnapshot | undefined,
    assignedDriverId: dispatch.assignedDriverId || undefined,
    assignedDriverSnapshot: dispatch.assignedDriverSnapshot as IUserSnapshot | undefined,
    assignedDriverPhone: dispatch.assignedDriverPhone || undefined,
    assignedVehicleNumber: dispatch.assignedVehicleNumber ?? undefined,
    assignedVehicleType: dispatch.assignedVehicleType || undefined,
    assignedVehicleWeight: dispatch.assignedVehicleWeight || undefined,
    assignedVehicleConnection: dispatch.assignedVehicleConnection || undefined,
    agreedFreightCost: dispatch.agreedFreightCost ? Number(dispatch.agreedFreightCost) : undefined,
    brokerMemo: dispatch.brokerMemo || undefined,
    createdBy: dispatch.createdBy,
    createdBySnapshot: dispatch.createdBySnapshot as IUserSnapshot | undefined,
    updatedBy: dispatch.updatedBy,
    updatedBySnapshot: dispatch.updatedBySnapshot as IUserSnapshot | undefined,
    createdAt: dispatch.createdAt?.toString() || '',
    updatedAt: dispatch.updatedAt?.toString() || '',
    
    // 연결된 원본 주문 정보
    orderInfo: {
      id: order.id,
      flowStatus: order.flowStatus,
      cargoName: order.cargoName || '',
      requestedVehicleType: order.requestedVehicleType,
      requestedVehicleWeight: order.requestedVehicleWeight,
      pickupAddressSnapshot: order.pickupAddressSnapshot,
      pickupDate: order.pickupDate?.toString().split('T')[0] || '',
      pickupTime: order.pickupTime || '',
      deliveryAddressSnapshot: order.deliveryAddressSnapshot,
      deliveryDate: order.deliveryDate?.toString().split('T')[0] || '',
      deliveryTime: order.deliveryTime || '',
      memo: order.memo || undefined,
    },
    
    // 추가 조인 정보
    brokerCompanyName,
    brokerManager,
    assignedDriver,
  };
}

/**
 * 신규 배차를 생성합니다.
 */
export async function createDispatch(
  orderId: string, 
  payload: ICreateDispatchPayload, 
  userId: string
): Promise<string> {
  // 1. 주문 존재 여부 및 상태 확인
  const orderResults = await db
    .select({ flowStatus: orders.flowStatus, isCanceled: orders.isCanceled })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  
  if (orderResults.length === 0) {
    throw new Error('주문을 찾을 수 없습니다.');
  }
  
  const order = orderResults[0];
  
  // 취소된 주문인지 확인
  if (order.isCanceled) {
    throw new Error('취소된 주문에 대해 배차를 생성할 수 없습니다.');
  }
  
  // 이미 배차가 완료된 주문인지 확인 (flowStatus가 '배차대기'가 아닌 경우)
  if (order.flowStatus !== '배차대기' && order.flowStatus !== '운송요청') {
    throw new Error('이미 배차가 완료된 주문입니다.');
  }
  
  // 2. 참조 데이터 유효성 확인 및 스냅샷 데이터 조회
  
  // 2.1 주선사 회사 정보 조회
  const brokerCompanyResults = await db
    .select()
    .from(companies)
    .where(eq(companies.id, payload.brokerCompanyId))
    .limit(1);
  
  if (brokerCompanyResults.length === 0) {
    throw new Error('유효하지 않은 주선사 회사입니다.');
  }
  
  const brokerCompanySnapshot: ICompanySnapshot = {    
    name: brokerCompanyResults[0].name,
    address: brokerCompanyResults[0].addressRoad || '',
    phone: brokerCompanyResults[0].contactTel || '',
    email: brokerCompanyResults[0].contactEmail || '',
    // 기타 필요한 회사 정보
  };
  
  // 2.2 주선사 담당자 정보 조회 (있는 경우)
  let brokerManagerSnapshot: IUserSnapshot | undefined;
  
  if (payload.brokerManagerId) {
    const managerResults = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.brokerManagerId))
      .limit(1);
    
    if (managerResults.length === 0) {
      throw new Error('유효하지 않은 주선사 담당자입니다.');
    }
    
    brokerManagerSnapshot = {
      name: managerResults[0].name,
      mobile: managerResults[0].phone_number || '',
      email: managerResults[0].email || '',
      // 기타 필요한 사용자 정보
    };
  }
  
  // 2.3 배차된 기사 정보 조회
  const driverResults = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.assignedDriverId))
    .limit(1);
  
  if (driverResults.length === 0) {
    throw new Error('유효하지 않은 기사 정보입니다.');
  }
  
  const assignedDriverSnapshot: IUserSnapshot = {
    name: driverResults[0].name,
    mobile: driverResults[0].phone_number || '',
    email: driverResults[0].email || '',
    // 기타 필요한 기사 정보
  };
  
  // 3. 현재 사용자(로그인 사용자) 정보 조회 (createdBy, updatedBy 필드용)
  const creatorResults = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (creatorResults.length === 0) {
    throw new Error('인증된 사용자 정보를 찾을 수 없습니다.');
  }
  
  const createdBySnapshot: IUserSnapshot = {
    name: creatorResults[0].name,
    mobile: creatorResults[0].phone_number || '',
    email: creatorResults[0].email || '',
    // 기타 필요한 사용자 정보
  };
  
  // 4. 트랜잭션으로 배차 생성 및 주문 상태 업데이트
  return await db.transaction(async (tx) => {
    // 4.1 배차 정보 생성
    const newDispatchResults = await tx.insert(orderDispatches).values({
      orderId,
      brokerCompanyId: payload.brokerCompanyId,
      brokerCompanySnapshot,
      brokerManagerId: payload.brokerManagerId,
      brokerManagerSnapshot,
      assignedDriverId: payload.assignedDriverId,
      assignedDriverSnapshot,
      assignedDriverPhone: assignedDriverSnapshot.mobile,
      assignedVehicleNumber: payload.assignedVehicleNumber,
      assignedVehicleType: payload.assignedVehicleType,
      assignedVehicleWeight: payload.assignedVehicleWeight,
      assignedVehicleConnection: payload.assignedVehicleConnection,
      agreedFreightCost: payload.agreedFreightCost?.toString(),
      brokerMemo: payload.brokerMemo,
      createdBy: userId,
      createdBySnapshot,
      updatedBy: userId,
      updatedBySnapshot: createdBySnapshot,
    }).returning({ id: orderDispatches.id });
    
    // 4.2 주문 상태 업데이트
    await tx.update(orders)
      .set({ 
        flowStatus: '배차완료' as any, // Enum 타입 처리
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    
    return newDispatchResults[0].id;
  });
}

/**
 * 배차 정보를 수정합니다.
 */
export async function updateDispatch(
  dispatchId: string, 
  payload: IUpdateDispatchPayload, 
  userId: string
): Promise<void> {
  // 1. 배차 정보 존재 확인
  const dispatchResults = await db
    .select({ orderId: orderDispatches.orderId })
    .from(orderDispatches)
    .where(eq(orderDispatches.id, dispatchId))
    .limit(1);
  
  if (dispatchResults.length === 0) {
    throw new Error('배차 정보를 찾을 수 없습니다.');
  }
  
  const orderId = dispatchResults[0].orderId;
  
  // 2. 관련 스냅샷 데이터 업데이트 (필요한 경우)
  const updateData: Partial<typeof orderDispatches.$inferInsert> = {
    updatedBy: userId,
    updatedAt: new Date(),
  };
  
  // 3. 현재 사용자 정보 조회 (updatedBy 스냅샷용)
  const updaterResults = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (updaterResults.length === 0) {
    throw new Error('인증된 사용자 정보를 찾을 수 없습니다.');
  }
  
  updateData.updatedBySnapshot = {
    id: updaterResults[0].id,
    name: updaterResults[0].name,
    mobile: updaterResults[0].phone_number || '',
    email: updaterResults[0].email || '',
    // 기타 필요한 사용자 정보
  } as any;
  
  // 4. 필드별 업데이트 처리
  
  // 4.1 주선사 담당자 변경 시
  if (payload.brokerManagerId !== undefined) {
    updateData.brokerManagerId = payload.brokerManagerId;
    
    // 담당자 스냅샷 업데이트 (값이 있는 경우만)
    if (payload.brokerManagerId) {
      const managerResults = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.brokerManagerId))
        .limit(1);
      
      if (managerResults.length > 0) {
        updateData.brokerManagerSnapshot = {          
          name: managerResults[0].name,
          mobile: managerResults[0].phone_number || '',
          email: managerResults[0].email || '',
          // 기타 필요한 사용자 정보
        } as any;
      }
    } else {
      // null로 설정된 경우 스냅샷도 null로 설정
      updateData.brokerManagerSnapshot = null;
    }
  }
  
  // 4.2 배차된 기사 변경 시
  if (payload.assignedDriverId !== undefined) {
    updateData.assignedDriverId = payload.assignedDriverId;
    
    // 기사 스냅샷 업데이트 (값이 있는 경우만)
    if (payload.assignedDriverId) {
      const driverResults = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.assignedDriverId))
        .limit(1);
      
      if (driverResults.length > 0) {
        updateData.assignedDriverSnapshot = {
          name: driverResults[0].name,
          mobile: driverResults[0].phone_number || '',
          email: driverResults[0].email || '',
          // 기타 필요한 사용자 정보
        } as any;
        
        updateData.assignedDriverPhone = driverResults[0].phone_number || null;
      }
    } else {
      // null로 설정된 경우 스냅샷도 null로 설정
      updateData.assignedDriverSnapshot = null;
      updateData.assignedDriverPhone = null;
    }
  }
  
  // 4.3 기타 필드 업데이트
  if (payload.assignedVehicleNumber !== undefined) {
    updateData.assignedVehicleNumber = payload.assignedVehicleNumber;
  }
  
  if (payload.assignedVehicleType !== undefined) {
    updateData.assignedVehicleType = payload.assignedVehicleType;
  }
  
  if (payload.assignedVehicleWeight !== undefined) {
    updateData.assignedVehicleWeight = payload.assignedVehicleWeight;
  }
  
  if (payload.assignedVehicleConnection !== undefined) {
    updateData.assignedVehicleConnection = payload.assignedVehicleConnection;
  }
  
  if (payload.agreedFreightCost !== undefined) {
    updateData.agreedFreightCost = payload.agreedFreightCost?.toString();
  }
  
  if (payload.brokerMemo !== undefined) {
    updateData.brokerMemo = payload.brokerMemo;
  }
  
  // 5. 배차 상태 업데이트 및 주문 상태 동기화
  if (payload.dispatchStatus !== undefined) {
    // 트랜잭션으로 배차 상태와 주문 상태 함께 업데이트
    await db.transaction(async (tx) => {
      // 배차 정보 업데이트
      await tx.update(orderDispatches)
        .set(updateData)
        .where(eq(orderDispatches.id, dispatchId));
      
      // 주문 상태 업데이트 (배차 상태에 따라 주문 흐름 상태 동기화)
      let orderFlowStatus;
      
      switch (payload.dispatchStatus) {
        case '배차완료':
          orderFlowStatus = '배차완료';
          break;
        case '상차중':
          orderFlowStatus = '상차대기';
          break;
        case '운송중':
          orderFlowStatus = '운송중';
          break;
        case '하차완료':
          orderFlowStatus = '하차완료';
          break;
        case '정산완료':
          orderFlowStatus = '운송완료';
          break;
        default:
          // 기본 상태는 변경하지 않음
          return;
      }
      
      await tx.update(orders)
        .set({ 
          flowStatus: orderFlowStatus as any, 
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    });
  } else {
    // 배차 상태 변경이 아닌 경우 단순 업데이트
    await db.update(orderDispatches)
      .set(updateData)
      .where(eq(orderDispatches.id, dispatchId));
  }
}

/**
 * 배차를 취소/삭제합니다.
 */
export async function deleteDispatch(dispatchId: string, userId: string): Promise<void> {
  // 1. 배차 정보 존재 확인
  const dispatchResults = await db
    .select({ orderId: orderDispatches.orderId })
    .from(orderDispatches)
    .where(eq(orderDispatches.id, dispatchId))
    .limit(1);
  
  if (dispatchResults.length === 0) {
    throw new Error('배차 정보를 찾을 수 없습니다.');
  }
  
  const orderId = dispatchResults[0].orderId;
  
  // 2. 트랜잭션으로 배차 삭제 및 주문 상태 업데이트
  await db.transaction(async (tx) => {
    // 2.1 배차 정보 삭제
    await tx.delete(orderDispatches)
      .where(eq(orderDispatches.id, dispatchId));
    
    // 2.2 주문 상태 '배차대기'로 되돌림
    await tx.update(orders)
      .set({ 
        flowStatus: '배차대기' as any,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
} 