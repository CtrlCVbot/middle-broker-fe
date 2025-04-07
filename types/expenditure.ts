// 매출 정산 관리 시스템 타입 정의

// BrokerOrder에서 가져온 타입
import { IBrokerOrder, BrokerOrderStatusType } from "./broker-order";

// 매출 정산 상태 타입 정의
export type ExpenditureStatusType = "pending" | "approved" | "rejected";

// 매출 정산 상태 배열 - 상태 순서대로 정의
export const Expenditure_STATUS: ExpenditureStatusType[] = [
  "pending", 
  "approved", 
  "rejected"
];

// 매출 정산 추가금 유형 타입 정의
export type AdditionalFeeType = 
  | "대기비" 
  | "경유비" 
  | "왕복비" 
  | "하차비" 
  | "수작업비" 
  | "기타" 
  | "할인";

// 추가금 인터페이스
export interface IAdditionalFee {
  id: string;
  name: string;
  amount: number;
  description?: string;
  createdAt: string;
}

// 매출 정산 로그 항목 인터페이스
export interface IExpenditureLog {
  id: string;
  status: ExpenditureStatusType;
  message: string;
  createdAt: string;
  createdBy: string;
}

// 매출 정산 정보 인터페이스
export interface IExpenditure {
  id: string;
  orderId: string;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ExpenditureStatusType;
  additionalFees: IAdditionalFee[];
  orderIds: string[];
  totalAmount: number;
  totalAdditionalAmount: number;
  finalAmount: number;
  isTaxFree: boolean;
  createdBy: string;
  updatedBy: string;
}

// 응답 페이징 정보 인터페이스
export interface IExpenditurePagination {
  total: number;               // 전체 데이터 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
}

// 매출 정산 목록 응답 인터페이스
export interface IExpenditureResponse {
  data: IExpenditure[];             // 매출 정산 목록 데이터
  pagination: IExpenditurePagination; // 페이징 정보
  summary?: ExpenditureSummary;     // 요약 정보
}

// 매출 정산 요약 정보 인터페이스
export interface ExpenditureSummary {
  totalExpenditures: number;        // 총 정산 건수
  totalOrders: number;         // 총 화물 건수
  totalBaseAmount: number;     // 총 기본 운임
  totalAdditionalAmount: number; // 총 추가금
  totalAmount: number;         // 총 청구금액 (세금 제외)
  totalTax: number;            // 총 세금
  totalFinalAmount: number;    // 총 최종 금액 (세금 포함)
}

// 검색 필터 인터페이스
export interface IExpenditureFilter {
  shipperName?: string;        // 화주명
  businessNumber?: string;     // 사업자번호
  orderId?: string;            // 화물 번호
  searchTerm?: string;         // 검색어
  status?: ExpenditureStatusType;   // 정산 상태
  startDate?: string;          // 검색 시작일
  endDate?: string;            // 검색 종료일
  manager?: string;            // 담당자
  minAmount?: number;          // 최소 금액
  maxAmount?: number;          // 최대 금액
  invoiceStatus?: string;      // 세금계산서 상태
}

// 정산 생성 요청 인터페이스
export interface IExpenditureCreateRequest {
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
export const getExpenditureProgressPercentage = (currentStatus: ExpenditureStatusType): number => {
  const currentIndex = Expenditure_STATUS.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (Expenditure_STATUS.length - 1)) * 100;
};

// 정산 상태가 특정 상태 이상인지 확인하는 함수
export const isExpenditureStatusAtLeast = (currentStatus: ExpenditureStatusType, targetStatus: ExpenditureStatusType): boolean => {
  const currentIndex = Expenditure_STATUS.indexOf(currentStatus);
  const targetIndex = Expenditure_STATUS.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
};

export const EXPENDITURE_STATUS = [
  { value: "pending", label: "대기중" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "거절" },
] as const; 