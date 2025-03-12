// 정산 관리 시스템 타입 정의

// 정산 상태 타입 정의
export type SettlementStatus = 
  | '정산대기' 
  | '정산요청' 
  | '정산진행중' 
  | '정산완료' 
  | '정산취소';

// 정산 상태 배열 - 상태 순서대로 정의
export const SETTLEMENT_STATUS: SettlementStatus[] = [
  '정산대기', 
  '정산요청', 
  '정산진행중', 
  '정산완료',
  '정산취소'
];

// 정산 로그 항목 인터페이스
export interface ISettlementLog {
  status: SettlementStatus;
  time: string;
  date: string;
  handler?: string;
  remark?: string;
}

// 정산 정보 인터페이스
export interface ISettlement {
  id: string;                  // 정산번호 (고유 식별자)
  status: SettlementStatus;    // 상태 (정산대기, 정산요청, 정산진행중, 정산완료, 정산취소)
  orderId: string;             // 관련 화물 번호
  departureDateTime: string;   // 출발 일시
  departureCity: string;       // 출발지 도시
  departureLocation: string;   // 출발지
  arrivalDateTime: string;     // 도착 예정 일시
  arrivalCity: string;         // 도착지 도시
  arrivalLocation: string;     // 도착지
  amount: number;              // 운송비 총액
  fee: number;                 // 수수료
  finalAmount: number;         // 최종 정산액 (운송비 - 수수료)
  driver: {                    // 차주 정보
    name: string;              // 차주명
    contact: string;           // 연락처
    bankInfo: string;          // 계좌 정보
  };
  requestDate?: string;        // 정산 요청일
  completedDate?: string;      // 정산 완료일
  paymentMethod?: string;      // 지불 방법 (계좌이체, 카드 등)
  tax?: number;                // 세금
  createdAt: string;           // 등록일
}

// 응답 페이징 정보 인터페이스
export interface ISettlementPagination {
  total: number;               // 전체 데이터 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
}

// 정산 목록 응답 인터페이스
export interface ISettlementResponse {
  data: ISettlement[];              // 정산 목록 데이터
  pagination: ISettlementPagination; // 페이징 정보
}

// 검색 필터 인터페이스
export interface ISettlementFilter {
  orderId?: string;            // 화물 번호
  departureCity?: string;      // 출발지 도시
  arrivalCity?: string;        // 도착지 도시
  driverName?: string;         // 차주명
  searchTerm?: string;         // 검색어
  status?: SettlementStatus;   // 정산 상태
  startDate?: string;          // 검색 시작일
  endDate?: string;            // 검색 종료일
  minAmount?: number;          // 최소 금액
  maxAmount?: number;          // 최대 금액
}

// 정산 상태 진행도를 계산하는 함수
export const getProgressPercentage = (currentStatus: SettlementStatus): number => {
  const currentIndex = SETTLEMENT_STATUS.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (SETTLEMENT_STATUS.length - 1)) * 100;
};

// 정산 상태가 특정 상태 이상인지 확인하는 함수
export const isStatusAtLeast = (currentStatus: SettlementStatus, targetStatus: SettlementStatus): boolean => {
  const currentIndex = SETTLEMENT_STATUS.indexOf(currentStatus);
  const targetIndex = SETTLEMENT_STATUS.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
}; 