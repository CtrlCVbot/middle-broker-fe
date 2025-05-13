import { IOrder as IFrontendOrder, OrderStatusType } from "@/types/order";
import { IOrder as IBackendOrder, OrderFlowStatus, IOrderListResponse } from "@/types/order-ver01";
import { IBrokerOrder, IBrokerOrderResponse, IBrokerOrderSummary } from "@/types/broker-order";
import { IOrderWithDispatchItem, IOrderWithDispatchListResponse, IOrderWithDispatchDetailResponse } from "@/types/order-with-dispatch";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 백엔드 API 응답을 프론트엔드 데이터 구조로 변환
 * @param apiResponse API 응답 데이터
 * @returns 프론트엔드용 화물 목록 데이터
 */
export function mapApiResponseToOrderList(apiResponse: any): {
  data: IFrontendOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
} {
  // 디버깅을 위한 로그 추가
  console.log('API 응답 구조:', apiResponse);
  
  // 페이지네이션 정보 추출 (구조 변경)
  const pagination = {
    total: apiResponse.total || 0,
    page: apiResponse.page || 1,
    limit: apiResponse.pageSize || 10
  };

  // 화물 데이터 매핑
  const data = Array.isArray(apiResponse.data) 
    ? apiResponse.data//.map(mapBackendOrderToFrontendOrder)
    : [];

  return {
    data,
    pagination
  };
}

/**
 * 백엔드 화물 데이터를 프론트엔드 화물 데이터로 변환
 * @param backendOrder 백엔드 화물 데이터
 * @returns 프론트엔드용 화물 데이터
 */
export function mapBackendOrderToFrontendOrder(backendOrder: IBackendOrder): IFrontendOrder {
  // 디버깅
  console.log('백엔드 데이터1:', backendOrder);
  console.log('백엔드 상차지 주소 스냅샷:', backendOrder.pickupAddressSnapshot);
  console.log('백엔드 하차지 주소 스냅샷:', backendOrder.deliveryAddressSnapshot);
  
  // 주소 스냅샷 추출
  const pickupAddressSnapshot = backendOrder.pickupAddressSnapshot || {};
  const deliveryAddressSnapshot = backendOrder.deliveryAddressSnapshot || {};
  
  // 도시 정보 추출 
  let departureCity = '';
  let arrivalCity = '';
  
  try {
    if (pickupAddressSnapshot.roadAddress) {
      const addressParts = pickupAddressSnapshot.roadAddress.split(' ');
      if (addressParts.length > 0) {
        departureCity = addressParts[0];
      }
    }
    
    if (deliveryAddressSnapshot.roadAddress) {
      const addressParts = deliveryAddressSnapshot.roadAddress.split(' ');
      if (addressParts.length > 0) {
        arrivalCity = addressParts[0];
      }
    }
  } catch (error) {
    console.error('도시 정보 추출 에러:', error);
  }

  return {
    id: backendOrder.id,
    status: mapFlowStatusToUiStatus(backendOrder.flowStatus) as OrderStatusType,
    departureLocation: getAddressName(pickupAddressSnapshot),
    departureCity: departureCity,
    departureDateTime: backendOrder.pickupDate + ' ' + backendOrder.pickupTime,
    arrivalLocation: getAddressName(deliveryAddressSnapshot),
    arrivalCity: arrivalCity,
    arrivalDateTime: backendOrder.deliveryDate + ' ' + backendOrder.deliveryTime,
    amount: backendOrder.estimatedPriceAmount,
    fee: calculateFee(backendOrder.estimatedPriceAmount),
    vehicle: {
      type: backendOrder.requestedVehicleType,
      weight: backendOrder.requestedVehicleWeight
    },
    driver: {
      name: "-", // 백엔드 데이터에 없는 필드, 향후 데이터가 추가되면 업데이트
      contact: "-" // 백엔드 데이터에 없는 필드, 향후 데이터가 추가되면 업데이트
    },
    createdAt: backendOrder.createdAt,
    // 필요한 경우 settlement 관련 필드 추가 가능
  };
}

/**
 * 상태값 매핑: 백엔드 상태 코드를 프론트엔드 표시용 상태로 변환
 * @param flowStatus 백엔드 상태 코드
 * @returns 프론트엔드 표시용 상태
 */
function mapFlowStatusToUiStatus(flowStatus: OrderFlowStatus): string {
  const statusMap: Record<OrderFlowStatus, string> = {
    '운송요청': '배차대기',
    '배차대기': '배차대기',
    '배차완료': '배차완료',
    '상차대기': '배차완료',
    '상차완료': '상차완료',
    '운송중': '운송중',
    '하차완료': '하차완료',
    '운송완료': '운송마감'
  };
  
  return statusMap[flowStatus] || flowStatus;
}

/**
 * 주소 정보 조합
 * @param addressSnapshot 주소 스냅샷 객체
 * @returns 전체 주소 문자열
 */
function getFullAddress(addressSnapshot: any): string {
  if (!addressSnapshot) return "-";
  
  const parts = [
    addressSnapshot.roadAddress,
    addressSnapshot.detailAddress
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(" ") : "-";
}

/**
 * 주소 이름 정보 조합
 * @param addressSnapshot 주소 스냅샷 객체
 * @returns 전체 주소 문자열
 */
function getAddressName(addressSnapshot: any): string {
    console.log('addressSnapshot: ', addressSnapshot);
    if (!addressSnapshot) return "-";
    
    const parts = [
      addressSnapshot.name
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(" ") : "-";
  }



/**
 * 날짜와 시간 조합
 * @param date 날짜 문자열 (YYYY-MM-DD)
 * @param time 시간 문자열 (HH:mm)
 * @returns 날짜시간 문자열
 */
function combineDateAndTime(date: string, time: string): string {
  if (!date) return "-";
  
  try {
    const dateTimeString = `${date}T${time || '00:00'}:00`;
    return dateTimeString;
  } catch (error) {
    console.error("날짜 포맷 에러:", error);
    return date;
  }
}

/**
 * 날짜 포맷팅
 * @param dateString 날짜 문자열
 * @param formatStr 포맷 형식
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(dateString: string, formatStr: string = "MM.dd (E) HH:mm"): string {
  try {
    const date = new Date(dateString);
    return format(date, formatStr, { locale: ko });
  } catch (error) {
    console.error("날짜 포맷 에러:", error);
    return dateString;
  }
}

/**
 * 수수료 계산
 * @param amount 금액
 * @returns 계산된 수수료
 */
function calculateFee(amount: number): number {
  // 임시로 금액의 10%를 수수료로 계산
  return Math.round(amount * 0.1);
}

/**
 * orderWithDispatch API 응답을 주선사 배차 관리용 데이터로 변환하는 함수
 * @param apiResponse API 응답 데이터
 * @returns 주선사 배차 관리용 데이터 구조
 */
export function mapApiResponseToBrokerDispatchList(
  apiResponse: IOrderWithDispatchListResponse
): {
  data: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
} {
  // 배차 정보가 있는 주문만 필터링
  const dispatchItems = apiResponse.data.filter(item => item.dispatch !== null);

  // 주선사 배차 관리용 데이터 구조로 변환
  const data = dispatchItems.map(item => {
    const { order, dispatch } = item;
    
    return {
      orderId: order.id,
      dispatchId: dispatch?.id,
      flowStatus: order.flowStatus,
      cargoName: order.cargoName,
      dispatchDate: dispatch?.createdAt,
      
      // 출발지/도착지 정보
      pickupAddress: order.pickup.address?.roadAddress || '',
      pickupDateTime: `${order.pickup.date} ${order.pickup.time}`,
      deliveryAddress: order.delivery.address?.roadAddress || '',
      deliveryDateTime: `${order.delivery.date} ${order.delivery.time}`,
      
      // 차량 정보
      vehicleType: order.requestedVehicleType,
      vehicleWeight: order.requestedVehicleWeight,
      assignedVehicleNumber: dispatch?.assignedVehicleNumber || '',
      assignedVehicleType: dispatch?.assignedVehicleType || '',
      
      // 배차 상세 정보
      driverName: dispatch?.assignedDriverSnapshot?.name || '',
      driverPhone: dispatch?.assignedDriverPhone || '',
      freightCost: dispatch?.agreedFreightCost || 0,
      estimatedAmount: order.estimatedPriceAmount || 0,
      
      // 메모 정보
      memo: order.memo,
      brokerMemo: dispatch?.brokerMemo,
    };
  });
  
  return {
    data,
    pagination: {
      total: apiResponse.total,
      page: apiResponse.page,
      pageSize: apiResponse.pageSize,
      totalPages: apiResponse.totalPages
    }
  };
}

/**
 * orderWithDispatch API 상세 응답을 주선사 배차 상세 정보로 변환하는 함수
 * @param item API 상세 응답 데이터
 * @returns 주선사 배차 상세 정보
 */
export function mapApiResponseToBrokerDispatchDetail(
  item: IOrderWithDispatchItem
): any {
  const { order, dispatch } = item;
  
  if (!dispatch) {
    throw new Error('배차 정보가 없습니다.');
  }
  
  return {
    orderId: order.id,
    dispatchId: dispatch.id,
    flowStatus: order.flowStatus,
    cargoName: order.cargoName,
    
    // 주문 정보
    requestedVehicleType: order.requestedVehicleType,
    requestedVehicleWeight: order.requestedVehicleWeight,
    estimatedAmount: order.estimatedPriceAmount,
    
    // 상하차 정보
    pickup: {
      name: order.pickup.name,
      contactName: order.pickup.contactName,
      contactPhone: order.pickup.contactPhone,
      address: order.pickup.address,
      date: order.pickup.date,
      time: order.pickup.time,
    },
    delivery: {
      name: order.delivery.name,
      contactName: order.delivery.contactName,
      contactPhone: order.delivery.contactPhone,
      address: order.delivery.address,
      date: order.delivery.date,
      time: order.delivery.time,
    },
    
    // 배차 정보
    broker: {
      companyId: dispatch.brokerCompanyId,
      companyName: dispatch.brokerCompanySnapshot?.name || '',
      managerId: dispatch.brokerManagerId,
      managerName: dispatch.brokerManagerSnapshot?.name || '',
    },
    
    // 배차 상세 정보
    assignedDriver: {
      id: dispatch.assignedDriverId,
      name: dispatch.assignedDriverSnapshot?.name || '',
      phone: dispatch.assignedDriverPhone,
    },
    
    assignedVehicle: {
      number: dispatch.assignedVehicleNumber,
      type: dispatch.assignedVehicleType,
      weight: dispatch.assignedVehicleWeight,
      connection: dispatch.assignedVehicleConnection,
    },
    
    // 배차 금액 정보
    agreedFreightCost: dispatch.agreedFreightCost,
    
    // 메모 정보
    orderMemo: order.memo,
    brokerMemo: dispatch.brokerMemo,
    
    // 생성/수정 정보
    createdAt: dispatch.createdAt,
    updatedAt: dispatch.updatedAt,
    createdBy: dispatch.createdBySnapshot?.name || '',
    updatedBy: dispatch.updatedBySnapshot?.name || '',
  };
} 