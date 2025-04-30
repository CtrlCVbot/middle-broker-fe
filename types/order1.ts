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
  '2.5톤',
  '3.5톤',
  '5톤',
  '11톤',
  '25톤'
] as const;

export type OrderVehicleWeight = typeof ORDER_VEHICLE_WEIGHTS[number];




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
  pickupSnapshot: IAddressSnapshot;

  deliveryAddressId: string;
  deliveryAddressDetail: string;
  deliveryName: string;
  deliveryContactName: string;
  deliveryContactPhone: string;  
  deliverySnapshot: IAddressSnapshot; 

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

// 사용자 스냅샷 인터페이스
export interface IUserSnapshot {
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