// 업체 구분 타입
export type CompanyType = '화주' | '운송사' | '주선사';

// 전표 구분 타입
export type StatementType = '매입처' | '매출처';

// 업체 상태 타입
export type CompanyStatus = '활성' | '비활성';

// 업체 정보 인터페이스
export interface IBrokerCompany {
  id: string;
  code: string;
  type: CompanyType;
  statementType: StatementType;
  businessNumber: string;
  name: string;
  representative: string;
  email: string | '';
  phoneNumber: string;
  faxNumber: string;
  managerName: string;
  managerPhoneNumber: string;
  registeredDate: string;
  status: CompanyStatus;
  warnings?: { id: string; text: string }[];
  files?: { id: string; name: string; url: string; type: string }[];
}

// 업체 필터 인터페이스
export interface IBrokerCompanyFilter {
  searchTerm: string;
  type: CompanyType | '';
  statementType: StatementType | '';
  status: CompanyStatus | '';
  startDate: string | null;
  endDate: string | null;
}

// 상태 변경 이력 인터페이스
export interface IStatusChangeHistory {
  id: string;
  companyId: string;
  previousStatus: CompanyStatus;
  newStatus: CompanyStatus;
  changedBy: string;
  reason: string;
  changedAt: string;
} 