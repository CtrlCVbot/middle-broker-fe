// 화주 화물 관리 시스템 타입 정의

// 화물 상태 타입 정의
export type OrderFlowStatus =
  | '등록'
  | '운송요청'
  | '배차대기'
  | '배차완료'
  | '상차대기'
  | '상차완료'
  | '운송중'
  | '하차완료'
  | '운송완료'
  | '취소';

// 화물 기본 정보 인터페이스
export interface IOrder1 {
  id: string;
  companyId: string;
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
  name: string;              // 장소명
  roadAddress: string;       // 도로명 주소
  jibunAddress: string;      // 지번 주소
  detailAddress: string | null;    // 상세 주소
  postalCode: string | null;       // 우편번호

  contactName: string | null;      // 담당자 이름
  contactPhone: string | null;     // 연락처

  metadata?: {
    originalInput?: string;     // 사용자가 직접 입력한 전체 주소
    source?: string;           // 주소가 어디서 왔는지 출처 보존
    lat?: number;             // 위도
    lng?: number;             // 경도
    buildingName?: string;    // 건물명
    floor?: string;           // 층수
    tags?: string[];          // 자유 태그
  };

  memo: string | null;             // 메모
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
  data: IOrder1[];
  pagination: IOrderPagination;
} 