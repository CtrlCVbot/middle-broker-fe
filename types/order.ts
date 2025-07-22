// 화주 화물 관리 시스템 타입 정의
import { IAddress } from './address';
// Settlement 관련 타입 임포트
import { SettlementStatus } from "./settlement";
import { IOrderCharge } from './order-with-dispatch';

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
  { id: 'fast', label: '빠른 배차', description: '우선 배차 처리' },
  { id: 'roundTrip', label: '왕복', description: '왕복 운송' },
  { id: 'direct', label: '이착', description: '상하차 지점 직접 운송' },
  { id: 'trace', label: '혼적', description: '다른 짐들과 합짐' },      
  { id: 'forklift', label: '지게차', description: '지게차 필요' },  
  { id: 'manual', label: '수작업', description: '수작업 필요' },  
  { id: 'cod', label: '착불', description: '도착 후 결제' },   
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
  selectedCompanyId?: string;
  selectedManagerId?: string;
  // 거리 정보 연동 필드 추가
  //estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  distanceCalculationMethod?: string;
  distanceCalculatedAt?: string;
  distanceCacheId?: string;
  distanceMetadata?: import("@/types/distance").IDistanceMetadata;
} 

// 검색 필터 인터페이스
export interface IOrderFilter {
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
  charge?: IOrderCharge;

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

export interface ICompanySnapshotForPurchase extends ICompanySnapshot {
  id: string;
  businessNumber: string;
  ceoName: string;
}

export interface IDriverSnapshotForPurchase extends IDriverSnapshot {
  id: string;
  name: string;
  contact: string;
  businessNumber: string;  
  vehicle: {
    type: string;
    weight: string;
    licensePlate: string;
  };


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

// order.ts에서 사용되던 간단한 화물 정보 인터페이스 (호환성을 위해 유지)
export interface ISimpleOrder {
  id: string;                  // 화물번호 (고유 식별자)
  status: OrderStatusType;     // 상태 (배차대기, 배차완료, 상차완료, 하차완료 등)
  departureDateTime: string;   // 출발 일시
  departureCity: string;       // 출발지 도시
  departureLocation: string;   // 출발지
  arrivalDateTime: string;     // 도착 예정 일시
  arrivalCity: string;         // 도착지 도시
  arrivalLocation: string;     // 도착지
  amount: number;              // 금액
  fee: number;                 // 수수료
  vehicle: {                   // 차량 정보
    type: string;              // 차량 종류
    weight: string;            // 중량
  };
  driver: {                    // 차주 정보
    name: string;              // 차주명
    contact: string;           // 연락처
  };
  createdAt: string;           // 등록일
  settlementStatus?: SettlementStatus; // 정산 상태
  settlementId?: string;       // 정산 ID
}

// order + 배차 정보 인터페이스
export interface IOrderWithDispatch {
  dispatchId: string;
  assignedDriverId: string;
  assignedDriverName: string;
  assignedDriverPhone: string;
  assignedVehicleConnection: string;
  assignedVehicleNumber: string;
  assignedDriverSnapshot: IDriverSnapshot;
}

// order.ts에서 사용되던 목록 조회 응답 인터페이스 (호환성을 위해 유지)
export interface ISimpleOrderResponse {
  data: ISimpleOrder[];        // 화물 목록 데이터
  pagination: IOrderPagination; // 페이징 정보
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

