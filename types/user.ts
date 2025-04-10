import { users, userLoginLogs, userChangeLogs } from '@/db/schema/users';


// Drizzle 스키마에서 타입 생성
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserLoginLog = typeof userLoginLogs.$inferSelect;
export type NewUserLoginLog = typeof userLoginLogs.$inferInsert;
export type UserChangeLog = typeof userChangeLogs.$inferSelect;
export type NewUserChangeLog = typeof userChangeLogs.$inferInsert;

// 시스템 접근 레벨 상수 및 타입
export const SYSTEM_ACCESS_LEVELS = [
  'platform_admin',    // 전체 플랫폼 관리자
  'broker_admin',      // 주선사 관리자
  'shipper_admin',     // 화주 관리자
  'broker_member',     // 주선사 사용자
  'shipper_member',    // 화주 사용자
  'viewer',            // 읽기 전용
  'guest'              // 승인 대기 / 제한 계정
] as const;

export type SystemAccessLevel = typeof SYSTEM_ACCESS_LEVELS[number];

// 사용자 도메인 상수 및 타입
export const USER_DOMAINS = [
  'logistics',  // 운송
  'settlement', // 정산
  'sales',      // 영업
  'etc'         // 기타
] as const;

export type UserDomain = typeof USER_DOMAINS[number];

// 사용자 상태 상수 및 타입
export const USER_STATUSES = [
  'active',   // 활성
  'inactive', // 비활성
  'locked'    // 잠김
] as const;

export type UserStatus = typeof USER_STATUSES[number];

// 기존 인터페이스 확장
export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone_number: string;
  company_id: string | null;
  system_access_level: SystemAccessLevel;
  domains: UserDomain[];
  status: UserStatus;
  department?: string | null;
  position?: string | null;
  rank?: string | null;
  last_login_at?: Date | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: Date;
  updated_at: Date;
}

// 사용자 필터 인터페이스
export interface IUserFilter {
  searchTerm: string;
  domains: UserDomain[];
  status: UserStatus | '';
  system_access_level?: SystemAccessLevel;
  company_id?: string;
}

// 사용자 로그인 이력 인터페이스
export interface IUserLoginLog {
  id: string;
  user_id: string;
  login_at: Date;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  fail_reason?: string;
}

// 사용자 변경 이력 인터페이스
export interface IUserChangeLog {
  id: string;
  user_id: string;
  changed_by: string;
  changed_by_name: string;
  changed_by_email: string;
  changed_by_access_level: string | null;  // null 허용
  change_type: 'create' | 'update' | 'status_change' | 'delete';
  diff: unknown;  // 타입을 더 유연하게 변경
  reason: string | null;  // null 허용
  created_at: Date;
}

// 레이블 매핑
export const USER_SYSTEM_ACCESS_LEVEL_LABEL: Record<SystemAccessLevel, string> = {
  platform_admin: '전체 플랫폼 관리자',
  broker_admin: '주선사 관리자',
  shipper_admin: '화주 관리자',
  broker_member: '주선사 사용자',
  shipper_member: '화주 사용자',
  viewer: '읽기 전용',
  guest: '승인 대기 / 제한 계정',
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  locked: '잠김',
};

export const USER_DOMAIN_LABEL: Record<UserDomain, string> = {
  logistics: '운송',
  settlement: '정산',
  sales: '영업',
  etc: '기타',
};

export interface IChangeLogResponse {
  items: IUserChangeLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

