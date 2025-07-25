import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { IOrderWithDispatchDetailResponse, IOrderWithDispatchDispatchDetail, IOrderWithDispatchItem, IOrderWithDispatchOrderDetail } from '@/types/order-with-dispatch';

// orderId 파라미터 검증 스키마
const orderIdSchema = z.string().uuid('유효한 주문 ID 형식이 아닙니다.');

/**
 * 특정 주문과 연결된 배차 정보를 상세 조회합니다.
 * 
 * @method GET
 * @route /api/orders/with-dispatch/:orderId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // 구조 분해 할당으로 orderId를 직접 추출
  const { orderId } = (await params);
  console.log('orderId: ', orderId);
  
  try {
    // 1. orderId가 존재하는지 확인
    

    // 2. orderId 유효성 검증
   
    
    try {
      const checkedOrderId = orderIdSchema.parse(orderId);
      console.log('checkedOrderId: ', checkedOrderId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: '유효하지 않은 주문 ID 형식입니다.',
          details: error.errors
        }, { status: 400 });
      }
      throw error;
    }
    
    // 3. 주문 정보 조회
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    
    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const order = orderResult[0];
    console.log('order: ', order);
    
    // 4. 연결된 배차 정보 조회 (없을 수도 있음)
    const dispatchResult = await db
      .select()
      .from(orderDispatches)
      .where(eq(orderDispatches.orderId, order.id))
      .limit(1);
    
    const dispatch = dispatchResult.length > 0 ? dispatchResult[0] : null;
    
    // 5. 응답 데이터 구성
    const orderDetail = {
      id: order.id,
      flowStatus: order.flowStatus || '',
      cargoName: order.cargoName || '',
      requestedVehicleType: order.requestedVehicleType || '',
      requestedVehicleWeight: order.requestedVehicleWeight || '',

      companyId: order.companyId || '',
      companySnapshot: order.companySnapshot || undefined,
      contactUserSnapshot: order.contactUserSnapshot || undefined,

      pickup: {
        name: order.pickupName || '',
        contactName: order.pickupContactName || '',
        contactPhone: order.pickupContactPhone || '',
        address: order.pickupAddressSnapshot,
        date: order.pickupDate?.toString().split('T')[0] || '',
        time: order.pickupTime || '',
      },
      delivery: {
        name: order.deliveryName || '',
        contactName: order.deliveryContactName || '',
        contactPhone: order.deliveryContactPhone || '',
        address: order.deliveryAddressSnapshot,
        date: order.deliveryDate?.toString().split('T')[0] || '',
        time: order.deliveryTime || '',
      },
      estimatedDistance: order.estimatedDistanceKm ? Number(order.estimatedDistanceKm) : undefined,
      estimatedPriceAmount: order.estimatedPriceAmount ? Number(order.estimatedPriceAmount) : undefined,
      priceType: order.priceType || '',
      taxType: order.taxType || '',
      memo: order.memo || '',
      isCanceled: order.isCanceled || false,
      
      createdAt: order.createdAt?.toISOString() || '',
      updatedAt: order.updatedAt?.toISOString() || '',
    };
    
    // 배차 정보가 있는 경우
    let dispatchDetail = null;
    if (dispatch) {
      dispatchDetail = {
        id: dispatch.id,
        brokerCompanyId: dispatch.brokerCompanyId || '',
        brokerCompanySnapshot: dispatch.brokerCompanySnapshot || undefined,
        brokerManagerId: dispatch.brokerManagerId || '',
        brokerManagerSnapshot: dispatch.brokerManagerSnapshot || undefined,
        assignedDriverId: dispatch.assignedDriverId || '',
        assignedDriverSnapshot: dispatch.assignedDriverSnapshot || undefined,
        assignedDriverPhone: dispatch.assignedDriverPhone || '',
        assignedVehicleNumber: dispatch.assignedVehicleNumber || '',
        assignedVehicleType: dispatch.assignedVehicleType || '',
        assignedVehicleWeight: dispatch.assignedVehicleWeight || '',
        assignedVehicleConnection: dispatch.assignedVehicleConnection || '',
        agreedFreightCost: dispatch.agreedFreightCost ? Number(dispatch.agreedFreightCost) : undefined,
        brokerMemo: dispatch.brokerMemo || '',
        createdBy: dispatch.createdBy || '',
        createdBySnapshot: dispatch.createdBySnapshot || undefined,
        updatedBy: dispatch.updatedBy || '',
        updatedBySnapshot: dispatch.updatedBySnapshot || undefined,
        createdAt: dispatch.createdAt?.toISOString() || '',
        updatedAt: dispatch.updatedAt?.toISOString() || '',
      };
    }
    
    // 응답 데이터 구성
    const responseData: IOrderWithDispatchItem = {
      order: orderDetail as IOrderWithDispatchOrderDetail,
      dispatch: dispatchDetail as IOrderWithDispatchDispatchDetail,
      charge: {
        groups: [],
        summary: {
          totalAmount: 0,
          salesAmount: 0,
          purchaseAmount: 0,
          profit: 0
        }
      },
    };
    
    // 응답 반환
    const response: IOrderWithDispatchDetailResponse = {
      success: true,
      data: responseData,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    // 오류 응답 처리
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 요청 데이터입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 그 외 오류 처리
    console.error('주문-배차 상세 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '주문-배차 정보를 조회하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 