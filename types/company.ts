import { companies, companyChangeLogs } from '@/db/schema/companies';

// Drizzle 스키마에서 타입 생성
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type CompanyChangeLog = typeof companyChangeLogs.$inferSelect;
export type NewCompanyChangeLog = typeof companyChangeLogs.$inferInsert;

// 회사 상태 타입
export const COMPANY_STATUSES = [
    'active',
    'inactive'
] as const;

export type CompanyStatus = typeof COMPANY_STATUSES[number];

// 회사 유형 타입
export const COMPANY_TYPES = [
    'broker',
    'shipper',
    'carrier'
] as const;

export type CompanyType = typeof COMPANY_TYPES[number];


export interface ICompany {
  id: string;
  name: string;
  businessNumber: string;
  ceoName: string;
  type: CompanyType;
  status: CompanyStatus;
  address: {
    postal: string;
    road: string;
    detail: string;
  };
  contact: {
    tel: string;
    mobile: string;
    email: string;
  };
  registeredAt: string;
  updatedAt: string;
}

// 회사 변경 이력 인터페이스
export interface ICompanyChangeLog {
  id: string;
  companyId: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  changeType: 'create' | 'update' | 'status_change' | 'delete';
  diff: Record<string, [any, any]>;  // 변경된 필드: [이전, 이후]
  reason?: string;
  createdAt: string;
}

// 회사 유형 레이블 매핑
export const COMPANY_TYPE_LABEL: Record<CompanyType, string> = {
    broker: '주선사',
    shipper: '화주',
    carrier: '운송사',
};

// 회사 상태 레이블 매핑
export const COMPANY_STATUS_LABEL: Record<CompanyStatus, string> = {
    active: '활성',
    inactive: '비활성',
};

// API 응답 관련 인터페이스
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  error?: string;
  details?: any;
}

// 회사 목록 조회 응답 인터페이스
export interface CompanyListResponse {
  data: ICompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 회사 필터 인터페이스
export interface CompanyFilter {
  keyword?: string;
  type?: CompanyType | '';
  status?: CompanyStatus | '';
  region?: string;
}

// 회사 생성/수정 요청 인터페이스
export interface CompanyRequest {
  name: string;
  businessNumber: string;
  ceoName: string;
  type: CompanyType;
  status?: CompanyStatus;
  address?: {
    postal?: string;
    road?: string;
    detail?: string;
  };
  contact?: {
    tel?: string;
    mobile?: string;
    email?: string;
  };
  requestUserId: string;
}

// 회사 상태 변경 요청 인터페이스
export interface CompanyStatusChangeRequest {
  status: CompanyStatus;
  reason?: string;
  requestUserId: string;
}

// 회사 배치 처리 요청 인터페이스
export interface CompanyBatchRequest {
  companyIds: string[];
  action: 'activate' | 'deactivate' | 'delete';
  reason?: string;
}

// 회사 유효성 검사 응답 인터페이스
export interface CompanyValidationResponse {
  valid: boolean;
  errors?: Record<string, string>;
}

// 기존 타입 연결을 위한 브릿지 인터페이스
export interface ILegacyCompany {
  id: string;
  code: string;
  type: string;
  statementType: string;
  businessNumber: string;
  name: string;
  representative: string;
  email: string;
  phoneNumber: string;
  faxNumber: string;
  managerName: string;
  managerPhoneNumber: string;
  registeredDate: string;
  status: string;
  warnings?: { id: string; text: string }[];
  files?: { id: string; name: string; url: string; type: string }[];
  managers?: any[];
}

// API 응답 데이터를 레거시 형식으로 변환하는 유틸리티 함수
export const convertApiToLegacyCompany = (company: ICompany): ILegacyCompany => {
  return {
    id: company.id,
    code: company.id.substring(0, 8),  // 임시로 ID의 앞 8자리를 코드로 사용
    type: COMPANY_TYPE_LABEL[company.type],
    statementType: '매출처',  // 기본값으로 설정
    businessNumber: company.businessNumber,
    name: company.name,
    representative: company.ceoName,
    email: company.contact.email || '',
    phoneNumber: company.contact.tel || '',
    faxNumber: '',  // API에 없는 필드이므로 빈 값으로 설정
    managerName: '',  // API에 없는 필드이므로 빈 값으로 설정
    managerPhoneNumber: company.contact.mobile || '',
    registeredDate: company.registeredAt,
    status: COMPANY_STATUS_LABEL[company.status],
    warnings: [],
    files: [],
  };
};

// 레거시 형식 데이터를 API 요청 형식으로 변환하는 유틸리티 함수
export const convertLegacyToApiCompany = (company: ILegacyCompany, requestUserId: string): CompanyRequest => {
  // 업체 타입 변환 (한글 -> 영문)
  let apiType: CompanyType;
  
  // 정확한 타입 매핑을 위해 switch문 사용
  switch(company.type) {
    case '운송사':
      apiType = 'carrier';
      break;
    case '화주':
      apiType = 'shipper';
      break;
    case '주선사':
    default:
      apiType = 'broker';
      break;
  }
  
  // 업체 상태 변환 (한글 -> 영문)
  const apiStatus: CompanyStatus = company.status === '비활성' ? 'inactive' : 'active';
  
  // business number 형식 정리 (하이픈 유지 여부는 API 요구사항에 따라 결정)
  const businessNumber = company.businessNumber?.trim() || '';
  
  // 전화번호 및 모바일 번호 형식 정리
  const tel = company.phoneNumber?.trim() || '';
  const mobile = company.managerPhoneNumber?.trim() || '';
  
  // 이메일이 없는 경우 빈 문자열로 설정
  const email = company.email?.trim() || '';
  
  console.log('변환 전 데이터:', {
    type: company.type,
    status: company.status,
    apiType,
    apiStatus
  });
  
  return {
    name: company.name,
    businessNumber: businessNumber,
    ceoName: company.representative,
    type: apiType,
    status: apiStatus,
    address: {
      postal: '',  // 레거시 데이터에 없는 필드
      road: '',    // 레거시 데이터에 없는 필드
      detail: '',  // 레거시 데이터에 없는 필드
    },
    contact: {
      tel: tel,
      mobile: mobile,
      email: email,
    },
    requestUserId,
  };
};
