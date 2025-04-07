// 중개 화물 관리 시스템 타입 정의

// Settlement 관련 타입 임포트
import { SettlementStatus } from "./settlement";

// 중개 화물 상태 타입 정의
export type BrokerOrderStatusType = 
  | '배차대기' 
  | '배차완료' 
  | '상차완료' 
  | '운송중' 
  | '하차완료' 
  | '운송마감';

// 중개 화물 상태 배열 - 상태 순서대로 정의
export const BROKER_ORDER_STATUS: BrokerOrderStatusType[] = [
  '배차대기', 
  '배차완료', 
  '상차완료', 
  '운송중', 
  '하차완료', 
  '운송마감'
];

// 콜센터 유형 정의
export type CallCenterType = '24시' | '원콜' | '화물맨' | '직접';

// 결제 방식 타입 정의
export type PaymentMethodType = '인수증' | '선불' | '착불' | '선착불';

// 중개 화물 로그 항목 인터페이스
export interface IBrokerOrderLog {
  status: BrokerOrderStatusType;
  time: string;
  date: string;
  handler?: string;
  location?: string;
  remark?: string;
}

// 중개 화물 정보 인터페이스
export interface IBrokerOrder {
  id: string;                  // 중개 화물번호 (고유 식별자)
  status: BrokerOrderStatusType;     // 상태 (배차대기, 배차완료, 상차완료, 하차완료 등)
  departureDateTime: string;   // 출발 일시
  departureCity: string;       // 출발지 도시
  departureLocation: string;   // 출발지
  arrivalDateTime: string;     // 도착 예정 일시
  arrivalCity: string;         // 도착지 도시
  arrivalLocation: string;     // 도착지
  amount: number;              // 금액 (견적금)
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
  updatedAt: string;           // 수정일
  settlementStatus?: SettlementStatus; // 정산 상태
  settlementId?: string;       // 정산 ID
  
  // PRD에 따른 추가 필드
  callCenter: CallCenterType;  // 콜센터 정보 (24시, 원콜, 화물맨, 직접)
  company: string;             // 업체명
  contactPerson: string;       // 업체담당자(신청자)
  contractAmount?: number;     // 계약 금액
  chargeAmount?: number;       // 청구 금액
  supplyAmount?: number;       // 공급가(배차금)
  paymentMethod: PaymentMethodType; // 결제 방식 (인수증, 선불, 착불, 선착불)
  cargoItem: string;           // 화물 품목
  manager: string;             // 담당자 정보
  managerContact: string;      // 담당자 연락처
  gpsLocation?: {              // 실시간 차주 위치 정보
    lat: number;              // 위도
    lng: number;              // 경도
    lastUpdated: string;      // 마지막 업데이트 시간
    status?: string;          // 상태 (좌표 확인, 상차 도착, 하차 도착, 상차 지각, 하차 지각)
  }
}

// 응답 페이징 정보 인터페이스
export interface IBrokerOrderPagination {
  total: number;               // 전체 데이터 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
}

// 중개 화물 목록 응답 인터페이스
export interface IBrokerOrderResponse {
  data: IBrokerOrder[];              // 중개 화물 목록 데이터
  pagination: IBrokerOrderPagination; // 페이징 정보
  summary?: IBrokerOrderSummary;      // 요약 정보
}

// 검색 필터 인터페이스
export interface IBrokerOrderFilter {
  departureCity?: string;      // 출발지 도시
  arrivalCity?: string;        // 도착지 도시
  vehicleType?: string;        // 차량 종류
  weight?: string;             // 중량
  searchTerm?: string;         // 검색어
  status?: BrokerOrderStatusType;    // 배차상태
  startDate?: string;          // 검색 시작일
  endDate?: string;            // 검색 종료일
  callCenter?: CallCenterType; // 콜센터 필터
  manager?: string;            // 담당자 필터
}

// 정산 요약 정보 인터페이스
export interface IBrokerOrderSummary {
  totalOrders: number;         // 총 주문 수
  totalChargeAmount: number;   // 총 청구 금액
  totalContractAmount: number; // 총 계약 금액
  totalSupplyAmount: number;   // 총 공급가(배차금)
  totalProfit: number;         // 총 수익 (청구금-공급가)
}

// 배차 상태 진행도를 계산하는 함수
export const getBrokerProgressPercentage = (currentStatus: BrokerOrderStatusType): number => {
  const currentIndex = BROKER_ORDER_STATUS.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (BROKER_ORDER_STATUS.length - 1)) * 100;
};

// 배차 상태가 특정 상태 이상인지 확인하는 함수
export const isBrokerStatusAtLeast = (currentStatus: BrokerOrderStatusType, targetStatus: BrokerOrderStatusType): boolean => {
  const currentIndex = BROKER_ORDER_STATUS.indexOf(currentStatus);
  const targetIndex = BROKER_ORDER_STATUS.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
};

// 중개 화물 등록 관련 타입 정의

// 차량 종류
export const BROKER_VEHICLE_TYPES = ['카고', '라보', '윙바디', '탑차', '냉동', '냉장'] as const;
export type BrokerVehicleType = typeof BROKER_VEHICLE_TYPES[number];

// 차량 중량
export const BROKER_WEIGHT_TYPES = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤'] as const;
export type BrokerWeightType = typeof BROKER_WEIGHT_TYPES[number];

// 운송 옵션
export interface IBrokerTransportOption {
  id: string;
  label: string;
  description?: string;
}

export const BROKER_TRANSPORT_OPTIONS: IBrokerTransportOption[] = [
  { id: 'direct', label: '이착', description: '상하차 지점 직접 운송' },
  { id: 'trace', label: '혼적', description: '다른 짐들과 합짐' },
  { id: 'fast', label: '빠른 배차', description: '우선 배차 처리' },
  { id: 'cod', label: '착불', description: '도착 후 결제' },
  { id: 'wing', label: '윙바디', description: '윙바디 차량으로 배차' },
  { id: 'duplicate', label: '중복화물', description: '중복 화물 허용' },
  { id: 'forklift', label: '지게차 하차', description: '하차 시 지게차 필요' },
  { id: 'special', label: '특수화물', description: '특수 운송 필요' },
];

// 주소 정보 인터페이스
export interface IBrokerLocationInfo {
  address: string;
  detailedAddress?: string;
  name: string;
  company: string;
  contact: string;
  date: string;
  time: string;
}

// 중개 화물 등록 정보 인터페이스
export interface IBrokerOrderRegisterData {
  vehicleType: BrokerVehicleType;
  weightType: BrokerWeightType;
  cargoType: string;
  remark?: string;
  departure: IBrokerLocationInfo;
  destination: IBrokerLocationInfo;
  selectedOptions: string[];
  estimatedDistance?: number;
  estimatedAmount?: number;
} 