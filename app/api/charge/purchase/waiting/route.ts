import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, not, inArray, sql, asc, ilike, or } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
//import { orderSales } from '@/db/schema/orderPurchases';
import { orderPurchases } from '@/db/schema/orderPurchases';
import { companies } from '@/db/schema/companies';
import { drivers } from '@/db/schema/drivers';

// 정산 대기 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    console.log("정산 대기 목록 조회 API 호출");
    const searchParams = request.nextUrl.searchParams;
    
    console.log("페이지네이션 파라미터");
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm');
    
    // 조건 구성
    const conditions = [];
    
    // 주문이 완료 상태인 것만 조회
    conditions.push(eq(orders.flowStatus, '운송완료'));
    conditions.push(eq(orderDispatches.isClosed, true));
    
    // 필터 조건 추가
    if (companyId) {
      conditions.push(eq(orders.companyId, companyId));
    }
    
    if (startDate) {
      conditions.push(sql`${orders.pickupDate} >= ${startDate}`);
    }
    
    if (endDate) {
      // endDate에 하루를 더해서 해당 날짜를 포함시킴
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const adjustedEndDate = endDateObj.toISOString().split('T')[0];
      conditions.push(sql`${orders.pickupDate} < ${adjustedEndDate}`);
    }

    if (searchTerm) {
      conditions.push(or(
        ilike(companies.name, `%${searchTerm}%`),        
        ilike(companies.businessNumber, `%${searchTerm}%`),
        //ilike(companies.ceoName, `%${searchTerm}%`),
        ilike(orders.pickupName, `%${searchTerm}%`),
        ilike(orders.deliveryName, `%${searchTerm}%`),
        ilike(orderDispatches.assignedVehicleNumber, `%${searchTerm}%`),
      ));
    }
    
    // 정산이 이미 생성된 주문 ID 조회 (서브쿼리용)
    const orderIdsWithSales = db
      .select({ orderId: orderPurchases.orderId })
      .from(orderPurchases);

    conditions.push(eq(orderPurchases.status, 'draft'));
    
    // 정산이 아직 생성되지 않은 주문만 필터링
    // conditions.push(
    //   not(inArray(orders.id, orderIdsWithSales.map((item: any) => item.orderId)))
    // );    
    
    const query = and(...conditions);
    
    // 주문 데이터 조회
    const [waitingOrders, total] = await Promise.all([
      db.select({
        id: orderPurchases.id,
        orderId: orderPurchases.orderId,
        companyId: orderPurchases.companyId,
        companyName: companies.name,
        companyBusinessNumber: companies.businessNumber,
        companyCeo: companies.ceoName,
        companyBankCode: companies.bankCode,
        companyBankAccountHolder: companies.bankAccountHolder,
        companyBankAccount: companies.bankAccountNumber,
        chargeAmount: orderPurchases.totalAmount,
        createdAt: orderPurchases.createdAt,
        pickupName: orders.pickupName,
        deliveryName: orders.deliveryName,
        pickupDate: orders.pickupDate,
        pickupAddressSnapshot: orders.pickupAddressSnapshot,
        pickupTime: orders.pickupTime,
        deliveryDate: orders.deliveryDate,
        deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
        deliveryTime: orders.deliveryTime,
        requestedVehicleWeight: orders.requestedVehicleWeight,
        requestedVehicleType: orders.requestedVehicleType,
        assignedDriverSnapshot: orderDispatches.assignedDriverSnapshot,        
        isClosed: orderDispatches.isClosed,
        flowStatus: orderDispatches.brokerFlowStatus,
        amount: orderPurchases.subtotalAmount,
        amountWithTax: orderPurchases.totalAmount,
        assignedDriverId: orderDispatches.assignedDriverId,
        driverId: orderDispatches.assignedDriverId,
          // driverBankCode: drivers.bankCode,
          // driverBankAccountHolder: drivers.bankAccountHolder,
          // driverBankAccount: drivers.bankAccountNumber,
      })
      .from(orders)
      .leftJoin(companies, eq(orders.companyId, companies.id))
      //.leftJoin(drivers, eq(orderDispatches.assignedDriverId, drivers.id))
      .innerJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
      .innerJoin(orderPurchases, eq(orders.id, orderPurchases.orderId))
      .where(query)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
      
      db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .leftJoin(companies, eq(orders.companyId, companies.id))
      .innerJoin(orderDispatches, eq(orderDispatches.orderId, orders.id)) // ✅ 필수
      .innerJoin(orderPurchases, eq(orders.id, orderPurchases.orderId)) // ✅ 필요한 경우만
      .where(query)
      .execute()
      .then(res => Number(res[0].count))
    ]);
    console.log("주문 데이터 조회 완료", waitingOrders);
    
    // 각 주문에 대한 예상 배차비 계산 (실제로는 dispatch 테이블에서 가져와야 함)
    // 테스트를 위해 임시로 총액의 90%로 설정
    const waitingItems = waitingOrders.map(order => {
      const dispatchAmount = Math.round(Number(order.chargeAmount) * 0.9);
      return {
        ...order,
        dispatchAmount,
        profitAmount: Number(order.chargeAmount) - Number(dispatchAmount)
      };
    });
    
    return NextResponse.json({
      data: waitingItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('정산 대기 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 