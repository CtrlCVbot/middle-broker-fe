// 업체 구분 타입
export type CompanyType = '화주' | '운송사' | '주선사';

// 전표 구분 타입
export type StatementType = '매입처' | '매출처';

// 업체 상태 타입
export type CompanyStatus = '활성' | '비활성';

// 담당자 역할 타입
export type ManagerRole = '배차' | '정산' | '관리';

// 담당자 상태 타입
export type ManagerStatus = '활성' | '비활성';

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
  managers?: IBrokerCompanyManager[]; // 담당자 목록 추가
}

// 담당자 정보 인터페이스
export interface IBrokerCompanyManager {
  id: string;
  managerId: string; // 로그인 ID
  password: string; // 실제 구현에서는 해시 처리된 값
  name: string;
  email: string;
  phoneNumber: string;
  roles: ManagerRole[]; // 역할(배차, 정산, 관리) - 다중 선택 가능
  department?: string; // 부서 (선택 사항)
  position?: string; // 직책 (선택 사항)
  rank?: string; // 직급 (선택 사항)
  status: ManagerStatus; // 활성 상태
  companyId: string; // 소속 업체 ID
  registeredDate: string;
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