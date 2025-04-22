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

// 백엔드 타입 참조를 위한 임포트 추가
import { IUser, UserDomain, UserStatus, SystemAccessLevel } from '@/types/user';

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
  //faxNumber: string;
  //managerName: string;
  mobileNumber: string;
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
  password?: string; // 실제 구현에서는 해시 처리된 값
  name: string;
  email: string;
  phoneNumber: string;
  roles: ManagerRole[]; // 역할(배차, 정산, 관리) - 다중 선택 가능
  department?: string; // 부서 (선택 사항)
  position?: string; // 직책 (선택 사항)
  rank?: string; // 직급 (선택 사항)
  status: ManagerStatus; // 활성 상태
  companyId: string; // 소속 업체 ID
  registeredDate: string | Date;
}

// 담당자 필터 인터페이스 추가
export interface IBrokerManagerFilter {
  searchTerm?: string;
  roles?: ManagerRole[];
  status?: ManagerStatus | '';
  showInactive?: boolean;
  page?: number;
  pageSize?: number;
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

// ----------------- API 연동을 위한 매핑 정의 추가 -----------------

// 역할과 도메인 매핑 (프론트엔드 ↔ 백엔드)
export const ROLE_TO_DOMAIN_MAP: Record<ManagerRole, UserDomain> = {
  '배차': 'logistics',
  '정산': 'settlement',
  '관리': 'sales'
};

export const DOMAIN_TO_ROLE_MAP: Record<UserDomain, ManagerRole> = {
  'logistics': '배차',
  'settlement': '정산',
  'sales': '관리',
  'etc': '관리' // 기타는 관리로 매핑
};

// 상태 매핑 (프론트엔드 ↔ 백엔드)
export const STATUS_MAP: Record<ManagerStatus, UserStatus> = {
  '활성': 'active',
  '비활성': 'inactive'
};

export const REVERSE_STATUS_MAP: Record<UserStatus, ManagerStatus> = {
  'active': '활성',
  'inactive': '비활성',
  'locked': '비활성' // locked는 비활성으로 간주
};

/**
 * 백엔드 IUser 객체를 프론트엔드 IBrokerCompanyManager 객체로 변환
 */
export function convertUserToBrokerManager(user: IUser): IBrokerCompanyManager {
  return {
    id: user.id,
    companyId: user.companyId || '',
    managerId: user.email.split('@')[0], // 이메일에서 ID 부분 추출
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    department: user.department || '',
    position: user.position || '',
    rank: user.rank || '',
    status: REVERSE_STATUS_MAP[user.status] || '비활성',
    roles: (user.domains || []).map(domain => DOMAIN_TO_ROLE_MAP[domain]).filter(Boolean),
    registeredDate: user.createdAt
  };
}

/**
 * 사용자 생성/수정 API 요청 인터페이스
 * IUser 인터페이스와 구분하여 requestUserId를 포함시킴
 */
export interface IBrokerManagerRequest {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  phoneNumber?: string;
  companyId?: string;
  department?: string | null;
  position?: string | null;
  rank?: string | null;
  systemAccessLevel?: SystemAccessLevel;
  status?: UserStatus;
  domains?: UserDomain[];
}

/**
 * 프론트엔드 IBrokerCompanyManager 객체를 백엔드 API 요청 객체로 변환 (생성/수정용)
 */
export function convertBrokerManagerToUser(
  manager: Partial<IBrokerCompanyManager> 
  
): IBrokerManagerRequest {
  return {
    id: manager.id,
    email: manager.email,
    password: manager.password,
    name: manager.name,
    phoneNumber: manager.phoneNumber,
    companyId: manager.companyId,
    department: manager.department || null,
    position: manager.position || null,
    rank: manager.rank || null,
    systemAccessLevel: 'broker_member' as SystemAccessLevel, // 기본값
    status: manager.status ? STATUS_MAP[manager.status] : 'active',
    domains: manager.roles ? manager.roles.map(role => ROLE_TO_DOMAIN_MAP[role]).filter(Boolean) : [],
    
  };
}

/**
 * IBrokerManagerFilter를 백엔드 API 요청용 쿼리 파라미터로 변환
 */
export function convertFilterToQueryParams(
  companyId: string,
  filter: IBrokerManagerFilter
): URLSearchParams {
  const { searchTerm, roles, status, showInactive, page = 1, pageSize = 10 } = filter;
  
  // 역할을 도메인으로 변환
  const domains = roles?.map(role => ROLE_TO_DOMAIN_MAP[role]).filter(Boolean);
  
  // 상태 변환
  let apiStatus = '';
  if (status) {
    apiStatus = STATUS_MAP[status as ManagerStatus] || '';
  } else if (!showInactive) {
    apiStatus = 'active'; // 비활성 표시가 꺼진 경우 활성 상태만 조회
  }
  
  // 쿼리 파라미터 구성
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  params.append('companyId', companyId);
  
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (apiStatus) params.append('status', apiStatus);
  if (domains && domains.length > 0) params.append('domains', domains.join(','));
  
  return params;
} 