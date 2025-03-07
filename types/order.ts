// 화물 관리 시스템 타입 정의

// 화물 상태 타입 정의
export type OrderStatusType = 
  | '배차대기' 
  | '배차완료' 
  | '상차완료' 
  | '운송중' 
  | '하차완료' 
  | '정산완료';

// 화물 상태 배열 - 상태 순서대로 정의
export const ORDER_STATUS: OrderStatusType[] = [
  '배차대기', 
  '배차완료', 
  '상차완료', 
  '운송중', 
  '하차완료', 
  '정산완료'
];

// 화물 로그 항목 인터페이스
export interface IOrderLog {
  status: OrderStatusType;
  time: string;
  date: string;
  handler?: string;
  location?: string;
  remark?: string;
}

// 화물 정보 인터페이스
export interface IOrder {
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
}

// 응답 페이징 정보 인터페이스
export interface IOrderPagination {
  total: number;               // 전체 데이터 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
}

// 화물 목록 응답 인터페이스
export interface IOrderResponse {
  data: IOrder[];              // 화물 목록 데이터
  pagination: IOrderPagination; // 페이징 정보
}

// 검색 필터 인터페이스
export interface IOrderFilter {
  departureCity?: string;      // 출발지 도시
  arrivalCity?: string;        // 도착지 도시
  vehicleType?: string;        // 차량 종류
  weight?: string;             // 중량
  searchTerm?: string;         // 검색어
}

// 배차 상태 진행도를 계산하는 함수
export const getProgressPercentage = (currentStatus: OrderStatusType): number => {
  const currentIndex = ORDER_STATUS.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (ORDER_STATUS.length - 1)) * 100;
};

// 배차 상태가 특정 상태 이상인지 확인하는 함수
export const isStatusAtLeast = (currentStatus: OrderStatusType, targetStatus: OrderStatusType): boolean => {
  const currentIndex = ORDER_STATUS.indexOf(currentStatus);
  const targetIndex = ORDER_STATUS.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
};

// 화물 등록 관련 타입 정의

// 차량 종류
export const VEHICLE_TYPES = ['카고', '라보', '윙바디', '탑차', '냉동', '냉장'] as const;
export type VehicleType = typeof VEHICLE_TYPES[number];

// 차량 중량
export const WEIGHT_TYPES = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤'] as const;
export type WeightType = typeof WEIGHT_TYPES[number];

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

// 주소 정보 인터페이스
export interface ILocationInfo {
  address: string;
  detailedAddress?: string;
  name: string;
  company: string;
  contact: string;
  date: string;
  time: string;
}

// 화물 등록 정보 인터페이스
export interface IOrderRegisterData {
  vehicleType: VehicleType;
  weightType: WeightType;
  cargoType: string;
  specialRequirements?: string;
  remark?: string;
  departure: ILocationInfo;
  destination: ILocationInfo;
  selectedOptions: string[];
  estimatedDistance?: number;
  estimatedAmount?: number;
} 