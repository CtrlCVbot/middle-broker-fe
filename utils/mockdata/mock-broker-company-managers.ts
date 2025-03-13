import { IBrokerCompanyManager, ManagerRole, ManagerStatus } from '@/types/broker-company';

// 담당자 역할 옵션
export const MANAGER_ROLES: ManagerRole[] = ['배차', '정산', '관리'];

// 담당자 상태 옵션
export const MANAGER_STATUS: ManagerStatus[] = ['활성', '비활성'];

// 직급 옵션
export const RANKS = ['사원', '대리', '과장', '차장', '부장', '이사', '상무', '전무', '대표'];

// 직책 옵션
export const POSITIONS = ['팀원', '팀장', '매니저', '책임자', '대표'];

// 부서 옵션
export const DEPARTMENTS = ['운영팀', '배차팀', '영업팀', '기획팀', '관리팀', '재무팀', '인사팀', '경영지원팀'];

// 랜덤 담당자 데이터 생성 함수
export const generateRandomManagers = (companyId: string, count = 1): IBrokerCompanyManager[] => {
  return Array.from({ length: count }).map((_, index) => {
    const id = `manager-${companyId}-${index + 1}`;
    
    // 담당자명 랜덤 생성
    const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const firstNames = ['영수', '미영', '철수', '영희', '민수', '지영', '승민', '현주', '준호', '수진'];
    const name = lastNames[Math.floor(Math.random() * lastNames.length)] +
                 firstNames[Math.floor(Math.random() * firstNames.length)];
    
    // 로그인 ID 생성
    const managerId = `user_${name}_${Math.floor(Math.random() * 1000)}`;
    
    // 역할 랜덤 선택 (1~3개)
    const roleCount = Math.floor(Math.random() * 3) + 1;
    const shuffledRoles = [...MANAGER_ROLES].sort(() => 0.5 - Math.random());
    const roles = shuffledRoles.slice(0, roleCount);
    
    // 상태 결정 (90%는 활성)
    const status = Math.random() > 0.1 ? '활성' : '비활성';
    
    // 부서, 직책, 직급 랜덤 선택
    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    
    // 전화번호 생성
    const phone1 = Math.floor(Math.random() * 9000) + 1000;
    const phone2 = Math.floor(Math.random() * 9000) + 1000;
    const phoneNumber = `010-${phone1}-${phone2}`;
    
    // 이메일 생성
    const domains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'example.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${managerId.toLowerCase()}@${domain}`;
    
    // 등록일 (최근 1년 내)
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const randomDate = new Date(oneYearAgo.getTime() + Math.random() * (today.getTime() - oneYearAgo.getTime()));
    const registeredDate = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    return {
      id,
      managerId,
      password: 'password123', // 실제 구현에서는 해시 처리된 값
      name,
      email,
      phoneNumber,
      roles,
      department,
      position,
      rank,
      status: status as ManagerStatus,
      companyId,
      registeredDate,
    };
  });
};

// 모든 업체에 대한 담당자 데이터를 생성
export const generateAllManagersData = (companyIds: string[]): Record<string, IBrokerCompanyManager[]> => {
  const managersData: Record<string, IBrokerCompanyManager[]> = {};
  
  companyIds.forEach(companyId => {
    // 각 업체당 1~5명의 담당자 생성
    const managerCount = Math.floor(Math.random() * 5) + 1;
    managersData[companyId] = generateRandomManagers(companyId, managerCount);
  });
  
  return managersData;
};

// 특정 업체의 담당자 목록 조회
export const getManagersByCompanyId = (companyId: string, allManagers: Record<string, IBrokerCompanyManager[]>): IBrokerCompanyManager[] => {
  return allManagers[companyId] || [];
};

// 담당자 추가 함수
export const addManager = (
  manager: Omit<IBrokerCompanyManager, 'id' | 'registeredDate'>, 
  allManagers: Record<string, IBrokerCompanyManager[]>
): IBrokerCompanyManager => {
  const id = `manager-${manager.companyId}-${Date.now()}`;
  const registeredDate = new Date().toISOString().split('T')[0];
  
  const newManager: IBrokerCompanyManager = {
    ...manager,
    id,
    registeredDate
  };
  
  if (!allManagers[manager.companyId]) {
    allManagers[manager.companyId] = [];
  }
  
  allManagers[manager.companyId].push(newManager);
  return newManager;
};

// 담당자 업데이트 함수
export const updateManager = (
  updatedManager: IBrokerCompanyManager, 
  allManagers: Record<string, IBrokerCompanyManager[]>
): IBrokerCompanyManager | null => {
  const companyManagers = allManagers[updatedManager.companyId];
  
  if (!companyManagers) return null;
  
  const managerIndex = companyManagers.findIndex(m => m.id === updatedManager.id);
  
  if (managerIndex === -1) return null;
  
  companyManagers[managerIndex] = updatedManager;
  return updatedManager;
};

// 담당자 상태 변경 함수
export const changeManagerStatus = (
  managerId: string, 
  companyId: string, 
  newStatus: ManagerStatus, 
  allManagers: Record<string, IBrokerCompanyManager[]>
): IBrokerCompanyManager | null => {
  const companyManagers = allManagers[companyId];
  
  if (!companyManagers) return null;
  
  const managerIndex = companyManagers.findIndex(m => m.id === managerId);
  
  if (managerIndex === -1) return null;
  
  companyManagers[managerIndex].status = newStatus;
  return companyManagers[managerIndex];
}; 