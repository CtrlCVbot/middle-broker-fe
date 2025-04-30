import { ApiClient, IApiError } from '@/utils/api-client';
import { IAddressSnapshot, ICompanySnapshot, IPriceSnapshot, ITransportOptionsSnapshot } from '@/types/order1';
import { getCurrentUser } from '@/utils/auth';
import { validateOrderData, validateOrderDataWithErrors } from '@/utils/order-validation';
import { showValidationError } from '@/utils/order-utils';
import { IOrder, IOrderListResponse, OrderFlowStatus, OrderVehicleType, OrderVehicleWeight } from "@/types/order1";

// API 클라이언트 인스턴스
const apiClient = new ApiClient();

// 화물 등록 요청 인터페이스
export interface ICreateOrderRequest {
  // 화물 정보
  cargoName: string;
  requestedVehicleType: "카고" | "윙바디" | "탑차" | "냉장" | "냉동" | "트레일러";
  requestedVehicleWeight: "1톤" | "2.5톤" | "3.5톤" | "5톤" | "11톤" | "25톤";
  memo?: string;
  
  // 상차지 정보
  pickupAddressId?: string;
  pickupAddressSnapshot: IAddressSnapshot;
  pickupAddressDetail?: string;
  pickupName: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupDate: string; // "YYYY-MM-DD" 형식
  pickupTime: string; // "HH:MM" 형식
  
  // 하차지 정보
  deliveryAddressId?: string;
  deliveryAddressSnapshot: IAddressSnapshot;
  deliveryAddressDetail?: string;
  deliveryName: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  deliveryDate: string; // "YYYY-MM-DD" 형식
  deliveryTime: string; // "HH:MM" 형식
  
  // 운송 옵션
  transportOptions?: ITransportOptionsSnapshot;
  
  // 가격 정보
  estimatedDistance?: number;
  estimatedPriceAmount?: number;
  priceType: "기본" | "계약";
  taxType: "비과세" | "과세";
  priceSnapshot?: IPriceSnapshot;
  
  // 화주 회사 정보
  companyId: string;
  companySnapshot?: ICompanySnapshot;
}

// 화물 등록 응답 인터페이스
export interface ICreateOrderResponse {
  id: string;
  flowStatus: string;
  cargoName: string;
  requestedVehicleType: string;
  requestedVehicleWeight: string;
  memo: string;
  pickup: {
    name: string;
    contactName: string;
    contactPhone: string;
    date: string;
    time: string;
    addressSnapshot: IAddressSnapshot;
  };
  delivery: {
    name: string;
    contactName: string;
    contactPhone: string;
    date: string;
    time: string;
    addressSnapshot: IAddressSnapshot;
  };
  estimatedDistance: number | null;
  estimatedPriceAmount: number | null;
  priceType: string;
  taxType: string;
  isCanceled: boolean;
  companyId: string;
  companySnapshot: ICompanySnapshot | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 화물 등록 API
 * @param orderData 화물 등록 요청 데이터
 * @returns 등록된 화물 정보
 */
export const registerOrder = async (orderData: ICreateOrderRequest): Promise<ICreateOrderResponse> => {
  try {
    // API 호출 전 스키마 유효성 검증
    const validationResult = validateOrderData(orderData);
    if (!validationResult.success) {
      // 첫 번째 에러 메시지 표시
      const firstError = validationResult.error.errors[0];
      const errorMsg = firstError.message || '입력 데이터가 유효하지 않습니다.';
      showValidationError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // 유효성 검증 통과 후 API 호출
    return await apiClient.post<ICreateOrderResponse>('/orders', orderData);
  } catch (error) {
    console.error('화물 등록 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 화물 정보를 등록 형식으로 변환
 * @param formData 폼 데이터
 * @returns API 요청 데이터
 */
export const convertFormDataToApiRequest = (formData: any): ICreateOrderRequest => {
  const user = getCurrentUser();
  
  // 상차지 주소 스냅샷 생성
  const pickupAddressSnapshot: IAddressSnapshot = {
    name: formData.departure.company || '',
    roadAddress: formData.departure.roadAddress || formData.departure.address || '',
    jibunAddress: formData.departure.jibunAddress || '',
    detailAddress: formData.departure.detailedAddress || null,
    postalCode: null,
    metadata: {
      lat: formData.departure.latitude || 0,
      lng: formData.departure.longitude || 0,
    },
    contactName: formData.departure.name || null,
    contactPhone: formData.departure.contact || null
  };

  // 하차지 주소 스냅샷 생성
  const deliveryAddressSnapshot: IAddressSnapshot = {
    name: formData.destination.company || '',
    roadAddress: formData.destination.roadAddress || formData.destination.address || '',
    jibunAddress: formData.destination.jibunAddress || '',
    detailAddress: formData.destination.detailedAddress || null,
    postalCode: null,
    metadata: {
      lat: formData.destination.latitude || 0,
      lng: formData.destination.longitude || 0,
    },
    contactName: formData.destination.name || null,
    contactPhone: formData.destination.contact || null
  };

  // 운송 옵션 변환
  const transportOptions: ITransportOptionsSnapshot = {};
  if (formData.selectedOptions.includes('early_delivery')) transportOptions.earlyDelivery = true;
  if (formData.selectedOptions.includes('forklift_load')) transportOptions.forkLiftLoad = true;
  if (formData.selectedOptions.includes('forklift_unload')) transportOptions.forkliftUnload = true;
  if (formData.selectedOptions.includes('exclusive_load')) transportOptions.exclusiveLoad = true;
  if (formData.selectedOptions.includes('mixed_load')) transportOptions.mixedLoad = true;
  if (formData.selectedOptions.includes('pay_on_delivery')) transportOptions.payOnDelivery = true;
  if (formData.selectedOptions.includes('duplicate_load')) transportOptions.duplicateLoad = true;
  if (formData.selectedOptions.includes('special_load')) transportOptions.specialLoad = true;

  // API 요청 데이터 구성
  const requestData: ICreateOrderRequest = {
    cargoName: formData.cargoType || '미지정 화물',
    requestedVehicleType: formData.vehicleType || '카고',
    requestedVehicleWeight: formData.weightType || '1톤',
    memo: formData.remark,
    
    pickupAddressId: formData.departure.id || undefined,
    pickupAddressSnapshot,
    pickupAddressDetail: formData.departure.detailedAddress || '',
    pickupName: formData.departure.company || '',
    pickupContactName: formData.departure.name || '',
    pickupContactPhone: formData.departure.contact || '',
    pickupDate: formData.departure.date || '',
    pickupTime: formData.departure.time || '',
    
    deliveryAddressId: formData.destination.id || undefined,
    deliveryAddressSnapshot,
    deliveryAddressDetail: formData.destination.detailedAddress || '',
    deliveryName: formData.destination.company || '',
    deliveryContactName: formData.destination.name || '',
    deliveryContactPhone: formData.destination.contact || '',
    deliveryDate: formData.destination.date || '',
    deliveryTime: formData.destination.time || '',
    
    transportOptions,
    
    estimatedDistance: formData.estimatedDistance || 0,
    estimatedPriceAmount: formData.estimatedAmount || 0,
    priceType: "기본",
    taxType: "과세",
    
    companyId: user?.companyId || '',
  };
  
  // 변환된 데이터의 유효성 검증 (디버깅 목적)
  const validationErrors = validateOrderDataWithErrors(requestData);
  if (validationErrors) {
    console.warn('화물 등록 데이터 유효성 검증 실패:', validationErrors);
  }
  
  return requestData;
};

interface OrderListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  flowStatus?: OrderFlowStatus;
  vehicleType?: OrderVehicleType;
  vehicleWeight?: OrderVehicleWeight;
  pickupCity?: string;
  deliveryCity?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

/**
 * 화물 목록 조회 API
 * @param params 조회 파라미터
 * @returns Promise<IOrderListResponse> 화물 목록 응답
 */
export async function fetchOrders(params: OrderListParams): Promise<IOrderListResponse> {
  // URL 파라미터 구성
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/orders?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '화물 목록을 불러오는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 화물 상세 정보 조회 API
 * @param orderId 화물 ID
 * @returns Promise<IOrder> 화물 상세 정보
 */
export async function fetchOrderDetail(orderId: string): Promise<IOrder> {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '화물 상세 정보를 불러오는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 화물 상태 변경 API
 * @param orderId 화물 ID
 * @param flowStatus 변경할 상태
 * @returns Promise<IOrder> 업데이트된 화물 정보
 */
export async function updateOrderStatus(orderId: string, flowStatus: OrderFlowStatus): Promise<IOrder> {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ flowStatus })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '화물 상태 변경에 실패했습니다.');
  }

  return response.json();
}

/**
 * 화물 변경 이력 조회 API
 * @param orderId 화물 ID
 * @returns Promise<any> 화물 변경 이력
 */
export async function fetchOrderChangeLogs(orderId: string): Promise<any> {
  const response = await fetch(`/api/orders/${orderId}/change-logs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '화물 변경 이력을 불러오는 데 실패했습니다.');
  }

  return response.json();
} 