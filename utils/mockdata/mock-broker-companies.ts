import { IBrokerCompany, CompanyType, StatementType, CompanyStatus } from '@/types/broker-company';
import { generateAllManagersData, getManagersByCompanyId } from './mock-broker-company-managers';

// 업체 구분 옵션
export const COMPANY_TYPES: CompanyType[] = ['화주', '운송사', '주선사'];

// 전표 구분 옵션
export const STATEMENT_TYPES: StatementType[] = ['매입처', '매출처'];

// 업체 상태 옵션
export const COMPANY_STATUS: CompanyStatus[] = ['활성', '비활성'];

// 목업 데이터 생성 (50개 업체)
const mockCompanies: IBrokerCompany[] = Array.from({ length: 50 }).map((_, index) => {
  const id = `company-${index + 1}`;
  const companyType = COMPANY_TYPES[Math.floor(Math.random() * COMPANY_TYPES.length)];
  const statementType = STATEMENT_TYPES[Math.floor(Math.random() * STATEMENT_TYPES.length)];
  const status = Math.random() > 0.2 ? '활성' : '비활성';
  
  // 업체명 랜덤 생성
  const companyNames = [
    '대한물류', '서울택배', '부산운송', '전진물류', '하나물류', 
    '성원운수', '제일운송', '해성물류', '명문택배', '우리화물',
    '태양물류', '동방운송', '인천물류', '국제화물', '대륙물류',
    '센트럴물류', '태평양운수', '동아화물', '세계물류', '대진운송'
  ];
  const companyName = companyNames[Math.floor(Math.random() * companyNames.length)] + (Math.floor(Math.random() * 100) + 1);
  
  // 대표자명 랜덤 생성
  const names = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const representativeName = names[Math.floor(Math.random() * names.length)] + '대표';
  
  // 사업자번호 포맷 (123-45-67890)
  const part1 = Math.floor(Math.random() * 900) + 100;
  const part2 = Math.floor(Math.random() * 90) + 10;
  const part3 = Math.floor(Math.random() * 90000) + 10000;
  const businessNumber = `${part1}-${part2}-${part3}`;
  
  // 전화번호 포맷 (02-1234-5678 or 010-1234-5678)
  const areaCode = Math.random() > 0.5 ? '02' : '031';
  const phone1 = Math.floor(Math.random() * 9000) + 1000;
  const phone2 = Math.floor(Math.random() * 9000) + 1000;
  const phoneNumber = `${areaCode}-${phone1}-${phone2}`;
  
  // 핸드폰번호 포맷 (010-1234-5678)
  const mobile1 = Math.floor(Math.random() * 9000) + 1000;
  const mobile2 = Math.floor(Math.random() * 9000) + 1000;
  const mobileNumber = `010-${mobile1}-${mobile2}`;
  
  // 팩스번호 포맷 (02-1234-5678)
  const fax1 = Math.floor(Math.random() * 9000) + 1000;
  const fax2 = Math.floor(Math.random() * 9000) + 1000;
  const faxNumber = `${areaCode}-${fax1}-${fax2}`;
  
  // 이메일 포맷
  const domains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'example.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${companyName.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 1000)}@${domain}`;
  
  // 담당자명 랜덤 생성
  const managerLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const managerFirstNames = ['영수', '미영', '철수', '영희', '민수', '지영', '승민', '현주', '준호', '수진'];
  const managerName = managerLastNames[Math.floor(Math.random() * managerLastNames.length)] +
                      managerFirstNames[Math.floor(Math.random() * managerFirstNames.length)];
  
  // 등록일 (최근 2년 내)
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const randomDate = new Date(twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime()));
  const registeredDate = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  
  return {
    id,
    code: `CM${(index + 1).toString().padStart(5, '0')}`, // CM00001 형식의 코드
    type: companyType,
    statementType: statementType,
    businessNumber,
    name: companyName,
    representative: representativeName,
    email,
    phoneNumber,
    faxNumber,
    managerName,
    managerPhoneNumber: mobileNumber,
    registeredDate,
    status: status as CompanyStatus,
    warnings: [],
    files: []
  };
});

// 담당자 데이터 생성
const mockManagersData = generateAllManagersData(mockCompanies.map(company => company.id));

// 페이지네이션 처리된 업체 목록 반환 함수
export const getBrokerCompaniesByPage = (
  page: number = 1,
  pageSize: number = 10,
  filter: {
    searchTerm?: string;
    type?: CompanyType | '';
    statementType?: StatementType | '';
    status?: CompanyStatus | '';
    startDate?: string | null;
    endDate?: string | null;
  } = {}
): { 
  data: IBrokerCompany[]; 
  total: number; 
  page: number; 
  pageSize: number; 
  totalPages: number;
} => {
  // 필터링
  let filteredData = [...mockCompanies];
  
  // 검색어 필터링
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredData = filteredData.filter(company => 
      company.name.toLowerCase().includes(searchTerm) ||
      company.representative.toLowerCase().includes(searchTerm) ||
      company.businessNumber.includes(searchTerm) ||
      company.phoneNumber.includes(searchTerm)
    );
  }
  
  // 업체 구분 필터링
  if (filter.type) {
    filteredData = filteredData.filter(company => company.type === filter.type);
  }
  
  // 전표 구분 필터링
  if (filter.statementType) {
    filteredData = filteredData.filter(company => company.statementType === filter.statementType);
  }
  
  // 업체 상태 필터링
  if (filter.status) {
    filteredData = filteredData.filter(company => company.status === filter.status);
  }
  
  // 등록일 기간 필터링
  if (filter.startDate && filter.endDate) {
    filteredData = filteredData.filter(company => {
      const registeredDate = new Date(company.registeredDate);
      const start = new Date(filter.startDate!);
      const end = new Date(filter.endDate!);
      end.setHours(23, 59, 59, 999); // 종료일 23:59:59로 설정
      
      return registeredDate >= start && registeredDate <= end;
    });
  }
  
  // 정렬 (등록일 기준 최신순)
  filteredData.sort((a, b) => 
    new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime()
  );
  
  // 페이지네이션
  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  
  // 각 업체에 담당자 데이터 연결
  const dataWithManagers = paginatedData.map(company => {
    const managers = getManagersByCompanyId(company.id, mockManagersData);
    return {
      ...company,
      managers
    };
  });
  
  return {
    data: dataWithManagers,
    total,
    page,
    pageSize,
    totalPages
  };
};

// 단일 업체 정보 반환 함수
export const getBrokerCompanyById = (id: string): IBrokerCompany | undefined => {
  const company = mockCompanies.find(company => company.id === id);
  
  if (company) {
    // 담당자 데이터 연결
    const managers = getManagersByCompanyId(company.id, mockManagersData);
    return {
      ...company,
      managers
    };
  }
  
  return undefined;
};

// 업체 정보 업데이트 함수
export const updateBrokerCompany = (updatedCompany: IBrokerCompany): IBrokerCompany => {
  const index = mockCompanies.findIndex(company => company.id === updatedCompany.id);
  
  if (index !== -1) {
    // 기존 담당자 데이터 유지
    const managers = mockManagersData[updatedCompany.id] || [];
    
    // 업체 정보 업데이트
    mockCompanies[index] = {
      ...updatedCompany,
      managers
    };
    
    return mockCompanies[index];
  }
  
  throw new Error(`업체 ID ${updatedCompany.id}를 찾을 수 없습니다.`);
};

export default mockCompanies; 