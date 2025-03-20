// 매출 정산 관리 시스템 타입 정의

// BrokerOrder에서 가져온 타입
import { IBrokerOrder, BrokerOrderStatusType } from "./broker-order";

// 매출 정산 상태 타입 정의
export type IncomeStatusType = 
  | '정산대기' 
  | '정산대사' 
  | '정산완료';

// 매출 정산 상태 배열 - 상태 순서대로 정의
export const INCOME_STATUS: IncomeStatusType[] = [
  '정산대기', 
  '정산대사', 
  '정산완료'
];

// 매출 정산 추가금 유형 타입 정의
export type AdditionalFeeType =
  | '대기비'
  | '경유비'
  | '왕복비'
  | '하차비'
  | '수작업비'
  | '기타'
  | '할인';

// 추가금 인터페이스
export interface IAdditionalFee {
  id: string;                  // 고유 ID
  type: AdditionalFeeType;     // 추가금 유형
  amount: number;              // 금액 (할인인 경우 음수값)
  description?: string;        // 설명
  orderId?: string;            // 특정 화물에 대한 추가금인 경우, 화물 ID
  createdAt: string;           // 생성일
  createdBy: string;           // 생성자
}

// 매출 정산 로그 항목 인터페이스
export interface IIncomeLog {
  status: IncomeStatusType;    // 상태
  time: string;                // 시간
  date: string;                // 날짜
  handler?: string;            // 처리자
  remark?: string;             // 비고
}

// 매출 정산 정보 인터페이스
export interface IIncome {
  id: string;                  // 정산번호 (고유 식별자)
  status: IncomeStatusType;    // 상태 (정산대기, 정산대사, 정산완료)
  orderIds: string[];          // 포함된 화물 ID 목록
  orders?: IBrokerOrder[];     // 포함된 화물 목록 (채울 수 있는 경우)
  orderCount: number;          // 화물 건수
  
  // 화주 정보
  shipperId?: string;          // 화주 ID
  shipperName: string;         // 화주명
  businessNumber: string;      // 사업자번호
  shipperContact?: string;     // 화주 연락처
  shipperEmail?: string;       // 화주 이메일
  
  // 정산 기간
  startDate: string;           // 시작 일자
  endDate: string;             // 종료 일자
  
  // 금액 정보
  totalBaseAmount: number;     // 기본 운임 합계
  totalAdditionalAmount: number; // 추가금 합계
  totalAmount: number;         // 총 청구금액 (세금 제외)
  tax: number;                 // 세금 (10%)
  isTaxFree: boolean;          // 면세 여부
  finalAmount: number;         // 최종 금액 (세금 포함)
  
  // 추가 정보
  additionalFees: IAdditionalFee[]; // 추가금 목록
  logs: IIncomeLog[];          // 로그 정보
  
  // 정산서 관련 정보
  invoiceNumber?: string;      // 세금계산서 번호
  invoiceIssuedDate?: string;  // 세금계산서 발행일
  invoiceStatus?: '미발행' | '발행대기' | '발행완료' | '발행오류'; // 세금계산서 상태
  
  // 관리 정보
  manager: string;             // 담당자
  managerContact?: string;     // 담당자 연락처
  createdAt: string;           // 등록일
  updatedAt: string;           // 수정일
}

// 응답 페이징 정보 인터페이스
export interface IIncomePagination {
  total: number;               // 전체 데이터 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
}

// 매출 정산 목록 응답 인터페이스
export interface IIncomeResponse {
  data: IIncome[];             // 매출 정산 목록 데이터
  pagination: IIncomePagination; // 페이징 정보
  summary?: IncomeSummary;     // 요약 정보
}

// 매출 정산 요약 정보 인터페이스
export interface IncomeSummary {
  totalIncomes: number;        // 총 정산 건수
  totalOrders: number;         // 총 화물 건수
  totalBaseAmount: number;     // 총 기본 운임
  totalAdditionalAmount: number; // 총 추가금
  totalAmount: number;         // 총 청구금액 (세금 제외)
  totalTax: number;            // 총 세금
  totalFinalAmount: number;    // 총 최종 금액 (세금 포함)
}

// 검색 필터 인터페이스
export interface IIncomeFilter {
  shipperName?: string;        // 화주명
  businessNumber?: string;     // 사업자번호
  orderId?: string;            // 화물 번호
  searchTerm?: string;         // 검색어
  status?: IncomeStatusType;   // 정산 상태
  startDate?: string;          // 검색 시작일
  endDate?: string;            // 검색 종료일
  manager?: string;            // 담당자
  minAmount?: number;          // 최소 금액
  maxAmount?: number;          // 최대 금액
  invoiceStatus?: string;      // 세금계산서 상태
}

// 정산 생성 요청 인터페이스
export interface IIncomeCreateRequest {
  orderIds: string[];          // 포함할 화물 ID 목록
  shipperName: string;         // 화주명
  businessNumber: string;      // 사업자번호
  startDate: string;           // 시작 일자
  endDate: string;             // 종료 일자
  manager: string;             // 담당자
  additionalFees?: IAdditionalFee[]; // 추가금 목록
  isTaxFree?: boolean;         // 면세 여부
}

// 정산 상태 진행도를 계산하는 함수
export const getIncomeProgressPercentage = (currentStatus: IncomeStatusType): number => {
  const currentIndex = INCOME_STATUS.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (INCOME_STATUS.length - 1)) * 100;
};

// 정산 상태가 특정 상태 이상인지 확인하는 함수
export const isIncomeStatusAtLeast = (currentStatus: IncomeStatusType, targetStatus: IncomeStatusType): boolean => {
  const currentIndex = INCOME_STATUS.indexOf(currentStatus);
  const targetIndex = INCOME_STATUS.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
}; 