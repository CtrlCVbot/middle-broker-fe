import { IOrder as IFrontendOrder } from "@/types/order";
import { IOrder as IBackendOrder, OrderFlowStatus, IOrderListResponse } from "@/types/order1";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 백엔드 API 응답을 프론트엔드 데이터 구조로 변환
 * @param apiResponse API 응답 데이터
 * @returns 프론트엔드용 화물 목록 데이터
 */
export function mapApiResponseToOrderList(apiResponse: IOrderListResponse): {
  data: IFrontendOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
} {
  // 페이지네이션 정보 추출
  const pagination = {
    total: apiResponse.pagination.total,
    page: apiResponse.pagination.page,
    limit: apiResponse.pagination.limit
  };

  // 화물 데이터 매핑
  const data = apiResponse.data.map(mapBackendOrderToFrontendOrder);

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
  return {
    id: backendOrder.id,
    status: mapFlowStatusToUiStatus(backendOrder.flowStatus),
    departureLocation: getFullAddress(backendOrder.pickupSnapshot),
    departureCity: backendOrder.pickupSnapshot?.roadAddress?.split(' ')[0] || '',
    departureDateTime: combineDateAndTime(backendOrder.pickupDate, backendOrder.pickupTime),
    arrivalLocation: getFullAddress(backendOrder.deliverySnapshot),
    arrivalCity: backendOrder.deliverySnapshot?.roadAddress?.split(' ')[0] || '',
    arrivalDateTime: combineDateAndTime(backendOrder.deliveryDate, backendOrder.deliveryTime),
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