import { ApiClient, IApiError } from '@/utils/api-client';
import { IAddressSnapshot, ICompanySnapshot, IPriceSnapshot, ITransportOptionsSnapshot } from '@/types/order-ver01';
import { getCurrentUser } from '@/utils/auth';
import { validateOrderData, validateOrderDataWithErrors } from '@/utils/order-validation';
import { showValidationError } from '@/utils/order-utils';
import { IOrder, IOrderListResponse, OrderFlowStatus, OrderVehicleType, OrderVehicleWeight } from "@/types/order-ver01";
import { IOrderWithDispatchListResponse, IOrderWithDispatchDetailResponse } from "@/types/order-with-dispatch";
import { mapApiResponseToBrokerDispatchList, mapApiResponseToBrokerDispatchDetail } from '@/utils/data-mapper';

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

/**
 * 주선사 배차 목록을 조회하는 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @param filter 필터 조건
 * @returns 배차 목록 데이터
 */
export async function getBrokerDispatchList(
  page: number = 1,
  pageSize: number = 10,
  filter: any = {}
) {
  try {
    console.log('getBrokerDispatchList 호출됨:', { page, pageSize, filter });
    
    // 파라미터 구성
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    // hasDispatch 파라미터 추가 (filter에서 가져오거나 기본값 설정)
    if (filter.hasDispatch !== undefined) {
      params.append('hasDispatch', filter.hasDispatch);
    }

    // 필터 추가 (주선사 관련 필터)
    if (filter.brokerCompanyId) params.append('brokerCompanyId', filter.brokerCompanyId);
    if (filter.vehicleType) params.append('vehicleType', filter.vehicleType);
    if (filter.vehicleWeight) params.append('vehicleWeight', filter.vehicleWeight);
    if (filter.status) params.append('flowStatus', filter.status);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.keyword) params.append('keyword', filter.keyword);
    
    const apiUrl = `/api/orders/with-dispatch?${params.toString()}`;
    console.log('API 요청 URL:', apiUrl);

    // API 호출
    const response = await fetch(apiUrl);
    
    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 오류 응답:', errorText);
      throw new Error(`배차 목록 조회에 실패했습니다. 상태 코드: ${response.status}`);
    }

    let responseData;
    try {
      responseData = await response.json();
      console.log('API 응답 JSON 데이터 구조:', Object.keys(responseData));
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      throw new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
    }
    
    // 응답 검증
    if (!responseData.data) {
      console.warn('API 응답에 data 필드가 없습니다:', responseData);
      // 기본 구조 생성
      responseData = {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0
      };
    }
    
    // 데이터 매핑
    const mappedData = mapApiResponseToBrokerDispatchList(responseData);
    return mappedData;
  } catch (error) {
    console.error('배차 목록 조회 중 오류:', error);
    // 대체 데이터 반환 (빈 배열)
    return {
      data: [],
      pagination: {
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0
      }
    };
  }
}

/**
 * 특정 배차의 상세 정보를 조회하는 함수
 * @param orderId 주문 ID
 * @returns 배차 상세 정보
 */
export async function getBrokerDispatchDetail(orderId: string) {
  try {
    const response = await fetch(`/api/orders/with-dispatch/${orderId}`);

    if (!response.ok) {
      throw new Error('배차 상세 정보 조회에 실패했습니다.');
    }

    const data: IOrderWithDispatchDetailResponse = await response.json();
    
    // 배차 정보가 없는 경우 처리
    if (!data.data.dispatch) {
      throw new Error('해당 주문에 배차 정보가 없습니다.');
    }
    
    // 데이터 매핑
    return mapApiResponseToBrokerDispatchDetail(data.data);
  } catch (error) {
    console.error('배차 상세 정보 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 배차 정보 업데이트 함수
 * @param orderId 주문 ID
 * @param dispatch 업데이트할 배차 정보
 * @param orderStatus 변경할 주문 상태 (선택 사항)
 * @returns 업데이트된 배차 상세 정보
 */
export async function updateBrokerDispatchInfo(
  orderId: string,
  dispatch: {
    dispatchId: string;
    assignedDriverId?: string;
    assignedDriverPhone?: string;
    assignedVehicleNumber?: string;
    assignedVehicleType?: string;
    assignedVehicleWeight?: string;
    agreedFreightCost?: number;
    memo?: string;
  },
  orderStatus?: string
) {
  try {
    // 배차 정보 업데이트
    const dispatchResponse = await fetch(`/api/orders/${orderId}/dispatch`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: dispatch.dispatchId,
        assignedDriverId: dispatch.assignedDriverId,
        assignedDriverPhone: dispatch.assignedDriverPhone,
        assignedVehicleNumber: dispatch.assignedVehicleNumber,
        assignedVehicleType: dispatch.assignedVehicleType,
        assignedVehicleWeight: dispatch.assignedVehicleWeight,
        agreedFreightCost: dispatch.agreedFreightCost,
        brokerMemo: dispatch.memo,
      }),
    });

    if (!dispatchResponse.ok) {
      throw new Error('배차 정보 업데이트에 실패했습니다.');
    }

    // 주문 상태 변경이 필요한 경우
    if (orderStatus) {
      const statusResponse = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowStatus: orderStatus,
          reason: '배차 정보 업데이트와 함께 상태 변경',
        }),
      });

      if (!statusResponse.ok) {
        throw new Error('주문 상태 변경에 실패했습니다.');
      }
    }

    // 최신 정보 조회하여 반환
    return await getBrokerDispatchDetail(orderId);
  } catch (error) {
    console.error('배차 정보 업데이트 중 오류:', error);
    throw error;
  }
} 