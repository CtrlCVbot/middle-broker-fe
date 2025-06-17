// 화주 화물 관리 시스템 타입 정의
import { IAddress } from './address';

// 화물 상태 타입 정의
export const ORDER_FLOW_STATUSES = [
  '운송요청',
  '배차대기',
  '배차완료',
  '상차대기',
  '상차완료',
  '운송중',
  '하차완료',
  '운송완료'  
] as const;

export type OrderFlowStatus = typeof ORDER_FLOW_STATUSES[number];

export const ORDER_VEHICLE_TYPES = [
  '카고',
  '윙바디',
  '탑차',
  '냉장',
  '냉동',
  '트레일러'
] as const;

export type OrderVehicleType = typeof ORDER_VEHICLE_TYPES[number];

export const ORDER_VEHICLE_WEIGHTS = [
  '1톤',
  '1.4톤',
  '2.5톤',
  '3.5톤',
  '5톤',
  '11톤',
  '25톤'
] as const;

export type OrderVehicleWeight = typeof ORDER_VEHICLE_WEIGHTS[number];

// 주소 정보 인터페이스
export interface ILocationInfo {
  id: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
  detailedAddress?: string;
  name: string;
  company: string;
  contact: string;
  date: string;
  time: string;
  createdAt: string;
}


// 화물 상태 타입 정의
export type OrderStatusType = 
  | '운송요청'
  | '배차대기' 
  | '배차완료' 
  | '상차대기' 
  | '상차완료' 
  | '운송중' 
  | '하차완료' 
  | '운송완료';

// 화물 상태 배열 - 상태 순서대로 정의
export const ORDER_STATUS: OrderStatusType[] = [
  '운송요청',
  '배차대기', 
  '배차완료',
  '상차대기',
  '상차완료', 
  '운송중', 
  '하차완료', 
  '운송완료'
];

// 운송 옵션
export interface ITransportOption {
  id: string;
  label: string;
  description?: string;
}

export const TRANSPORT_OPTIONS: ITransportOption[] = [
  { id: 'direct', label: '이착', description: '상하차 지점 직접 운송' },
  { id: 'trace', label: '혼적', description: '다른 짐들과 합짐' },
  { id: 'fast', label: '빠른 배차', description: '우선 배차 처리' },
  { id: 'cod', label: '착불', description: '도착 후 결제' },
  { id: 'wing', label: '윙바디', description: '윙바디 차량으로 배차' },
  { id: 'duplicate', label: '중복화물', description: '중복 화물 허용' },
  { id: 'forklift', label: '지게차 하차', description: '하차 시 지게차 필요' },
  { id: 'special', label: '특수화물', description: '특수 운송 필요' },
];

// 차량 종류
//export const VEHICLE_TYPES =  OrderVehicleType;
export type VehicleType = OrderVehicleType;

// 차량 중량
//export const WEIGHT_TYPES = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤'] as const;
export type WeightType = OrderVehicleWeight;

// 화물 등록 정보 인터페이스
export interface IOrderRegisterData {
  vehicleType: VehicleType;
  weightType: WeightType;
  cargoType: string;
  remark?: string;
  departure: ILocationInfo;
  destination: ILocationInfo;
  selectedOptions: string[];
  estimatedDistance?: number;
  estimatedAmount?: number;
} 

// 검색 필터 인터페이스
export interface IOrderFilter {
  departureCity?: string;      // 출발지 도시
  arrivalCity?: string;        // 도착지 도시
  vehicleType?: string;        // 차량 종류
  weight?: string;             // 중량
  searchTerm?: string;         // 검색어
  status?: OrderStatusType;    // 배차상태
  startDate?: string;          // 검색 시작일
  endDate?: string;            // 검색 종료일
}

// 화물 로그 항목 인터페이스
export interface IOrderLog {
  status: OrderStatusType;
  time: string;
  date: string;
  handler?: string;
  location?: string;
  remark?: string;
}


// 화물 기본 정보 인터페이스
export interface IOrder1 {
  id: string;
  companyId: string;
  companySnapshot: ICompanySnapshot;
  orderContactId?: string;
  orderContactSnapshot?: IUserSnapshot;

  orderNumber: string;
  orderName: string;
  flowStatus: OrderFlowStatus;

  // 화물 정보
  cargoName: string;
  cargoWeight: number;
  cargoUnit: string;
  cargoQuantity: number;
  packagingType: string;

  // 차량 정보
  vehicleType: string;
  vehicleCount: number;

  // 가격 정보
  priceAmount: number;
  priceType: string;
  taxType: '과세' | '면세';

  // 주소 정보
  pickupAddressId: string;
  deliveryAddressId: string;
  pickupSnapshot: IAddressSnapshot;
  deliverySnapshot: IAddressSnapshot;

  // 일정 정보
  pickupDate: string;
  deliveryDate: string;

  // 상태 및 메모
  isCanceled: boolean;
  memo?: string;

  // 생성/수정 정보
  createdBy: string;
  createdBySnapshot: IUserSnapshot;
  createdAt: string;
  updatedBy: string;
  updatedBySnapshot: IUserSnapshot;
  updatedAt: string;
}

// 화주 화물 관리 시스템 타입 정의
export interface IOrder {
  id: string;
  companyId: string;
  companySnapshot: ICompanySnapshot;
  contactUserId: string;
  contactUserPhone: string;
  contactUserMail: string;
  contactUserSnapshot: IUserSnapshot;

  //상태
  isCanceled: boolean;  
  flowStatus: OrderFlowStatus;

  // 화물 정보
  cargoName: string;
  requestedVehicleType: string;
  requestedVehicleWeight: string;
  memo: string;

  // 주소 정보
  pickupAddressId: string;
  pickupAddressDetail: string;
  pickupName: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupAddressSnapshot: IAddressSnapshot;

  deliveryAddressId: string;
  deliveryAddressDetail: string;
  deliveryName: string;
  deliveryContactName: string;
  deliveryContactPhone: string;  
  deliveryAddressSnapshot: IAddressSnapshot; 

  //일정 정보
  pickupDate: string;
  deliveryDate: string;
  pickupTime: string;
  deliveryTime: string;

  //운송 옵션
  transportOptions: ITransportOptionsSnapshot;

  //거리 및 가격 정보
  estimatedDistance: number;
  estimatedPriceAmount: number;
  priceType: string;
  taxType: '과세' | '면세';
  priceSnapshot: IPriceSnapshot;


  // 생성/수정 정보
  createdBy: string;
  createdBySnapshot: IUserSnapshot;
  createdAt: string;
  updatedBy: string;
  updatedBySnapshot: IUserSnapshot;
  updatedAt: string;
}

export interface ICompanySnapshot {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface ICompanySnapshotForSales extends ICompanySnapshot {
  id: string;
  businessNumber: string;
  ceoName: string;
}

// 사용자 스냅샷 인터페이스
export interface IUserSnapshot {
  name: string;
  email: string;
  mobile?: string;
  department?: string;
  position?: string;
}
//
export interface IDriverSnapshot {
  name: string;
  email: string;
  mobile?: string;
  department?: string;
  position?: string;
}

// 가격 스냅샷 인터페이스
export interface IPriceSnapshot {
  basicAmount: number;
  surchargeAmount: number;
  totalAmount: number; 
  surcharges?: {
    label: string;                  // 항목 명칭 (예: '야간비', '심야추가', '고속도로비용')
    amount: number;                 // 금액
  }[];   
}

// 주소 스냅샷 인터페이스
export interface IAddressSnapshot {  
  name: string;           // 장소명
  
  roadAddress: string;     // 도로명 주소
  jibunAddress: string;    // 지번 주소
  detailAddress: string | null;  // 상세 주소
  postalCode: string | null;     // 우편번호
  
  metadata?: {
    originalInput?: string;     // 사용자가 직접 입력한 전체 주소
    source?: string;           // 주소가 어디서 왔는지 출처 보존 (카카오, 공공API 등)
    lat?: number;
    lng?: number;
    buildingName?: string;
    floor?: string;
    tags?: string[];          // 자유 태그, 건물명 등 비정형 데이터 저장 가능
  };

  contactName: string | null;    // 담당자명
  contactPhone: string | null;   // 전화번호
  memo?: string | null; // 메모

}
// 운송 옵션 스냅샷 인터페이스
export interface ITransportOptionsSnapshot {
  earlyDelivery?: boolean; // 빠른배차
  forkLiftLoad?: boolean; // 지게차 상차
  forkliftUnload?: boolean; // 지게차 하차
  exclusiveLoad?: boolean; // 단독배차
  mixedLoad?: boolean; // 혼적 가능
  payOnDelivery?: boolean; // 착불
  duplicateLoad?: boolean; // 중복화물 가능
  specialLoad?: boolean; // 특수화물 필요
}

// API 요청/응답 타입
export interface ICreateOrderRequest {
  orderName: string;
  cargo: {
    name: string;
    weight: number;
    unit: string;
    quantity: number;
    packagingType: string;
  };
  vehicle: {
    type: string;
    count: number;
  };
  price: {
    amount: number;
    priceType: string;
    taxType: '과세' | '면세';
  };
  route: {
    pickupAddressId: string;
    deliveryAddressId: string;
    pickupDate: string;
    deliveryDate: string;
  };
  memo?: string;
}

export interface IUpdateOrderRequest extends Partial<ICreateOrderRequest> {}

export interface IOrderResponse {
  id: string;
  orderNumber: string;
  createdAt: string;
}

export interface IOrderStatusUpdateRequest {
  flowStatus: OrderFlowStatus;
  reason?: string;
}

// 페이지네이션 인터페이스
export interface IOrderPagination {
  page: number;
  limit: number;
  total: number;
}

// 목록 조회 응답 인터페이스
export interface IOrderListResponse {
  data: IOrder[];
  pagination: IOrderPagination;
} 

// 배차 상태 진행도를 계산하는 함수
export const getProgressPercentage = (currentStatus: OrderFlowStatus): number => {
  const currentIndex = ORDER_FLOW_STATUSES.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (ORDER_FLOW_STATUSES.length - 1)) * 100;
};

// 배차 상태가 특정 상태 이상인지 확인하는 함수
export const isStatusAtLeast = (currentStatus: OrderFlowStatus, targetStatus: OrderFlowStatus): boolean => {
  const currentIndex = ORDER_FLOW_STATUSES.indexOf(currentStatus);
  const targetIndex = ORDER_FLOW_STATUSES.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
};

