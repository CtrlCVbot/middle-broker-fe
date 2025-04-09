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
