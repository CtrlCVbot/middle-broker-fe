// 화물 관리 시스템 타입 정의

// 화물 정보 인터페이스
export interface IOrder {
  id: string;                  // 화물번호 (고유 식별자)
  status: string;              // 상태 (배차대기, 배차완료, 상차완료, 하차완료 등)
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