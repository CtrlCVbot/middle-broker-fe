import { DriverStatus, IBrokerDriver, IBrokerDriverFilter, TonnageType, VehicleType } from "@/types/broker-driver";

// 차량 종류
export const VEHICLE_TYPES: VehicleType[] = ['카고', '윙바디', '냉동', '탑차', '리프트', '기타'];

// 톤수
export const TONNAGE_TYPES: TonnageType[] = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '8톤', '11톤', '18톤', '25톤', '기타'];

// 차주 상태
export const DRIVER_STATUS: DriverStatus[] = ['활성', '비활성'];

// 배차 횟수 필터 옵션
export const DISPATCH_COUNT_OPTIONS = [
  { value: '10건 이상', label: '10건 이상', min: 10 },
  { value: '30건 이상', label: '30건 이상', min: 30 },
  { value: '50건 이상', label: '50건 이상', min: 50 },
];

// 더미 차주 데이터 생성
const generateMockDrivers = (count: number): IBrokerDriver[] => {
  const status = ['활성', '비활성'];
  const settlementStatus = ['완료', '미정산', '-'];
  
  return Array.from({ length: count }).map((_, index) => {
    const isActive = Math.random() > 0.2; // 80%는 활성 상태
    const vehicleType = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
    const tonnage = TONNAGE_TYPES[Math.floor(Math.random() * TONNAGE_TYPES.length)];
    const dispatchCount = Math.floor(Math.random() * 100);
    const lastSettlementStatus = settlementStatus[Math.floor(Math.random() * settlementStatus.length)] as '완료' | '미정산' | '-';
    
    // 정산 상태가 미정산이면 금액 생성, 아니면 0
    const unsettledAmount = lastSettlementStatus === '미정산' 
      ? Math.floor(Math.random() * 1000000) + 500000 
      : 0;
    
    // 최근 배차일 생성 (50%는 최근 일자, 50%는 null)
    const hasRecentDispatch = Math.random() > 0.5;
    const lastDispatchedAt = hasRecentDispatch 
      ? new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;
    
    return {
      id: `driver-${index + 1}`,
      code: `DR${(index + 1).toString().padStart(5, '0')}`,
      name: `차주 ${index + 1}`,
      phoneNumber: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleNumber: `${['서울', '경기', '인천', '부산'][Math.floor(Math.random() * 4)]}${Math.floor(10 + Math.random() * 90)}아${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType,
      tonnage,
      address: `서울시 강남구 테헤란로 ${Math.floor(Math.random() * 500) + 1}길 ${Math.floor(Math.random() * 100) + 1}`,
      companyName: Math.random() > 0.7 ? `${Math.floor(Math.random() * 100)}운수` : '개인사업자',
      businessNumber: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10000 + Math.random() * 90000)}`,
      dispatchCount,
      status: isActive ? '활성' : '비활성',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastDispatchedAt,
      lastSettlementStatus,
      unsettledAmount,
      isActive,
      inactiveReason: !isActive ? ['장기 미사용', '서비스 이용 중지', '개인 사유'][Math.floor(Math.random() * 3)] : undefined,
    };
  });
};

// 목업 데이터 저장
let mockDriversData: IBrokerDriver[] = generateMockDrivers(100);

// ID로 차주 조회
export const getBrokerDriverById = (id: string): IBrokerDriver | undefined => {
  return mockDriversData.find(driver => driver.id === id);
};

// 차주 업데이트
export const updateBrokerDriver = (updatedDriver: IBrokerDriver): IBrokerDriver => {
  const index = mockDriversData.findIndex(driver => driver.id === updatedDriver.id);
  
  if (index === -1) {
    throw new Error(`ID가 ${updatedDriver.id}인 차주를 찾을 수 없습니다.`);
  }
  
  mockDriversData[index] = updatedDriver;
  return updatedDriver;
};

// 필터링된 차주 목록 조회
export const getBrokerDriversByPage = (
  page: number = 1,
  pageSize: number = 10,
  filter: IBrokerDriverFilter
): { data: IBrokerDriver[], total: number, page: number, pageSize: number, totalPages: number } => {
  let filteredDrivers = [...mockDriversData];
  
  // 검색어 필터링
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredDrivers = filteredDrivers.filter(driver => 
      driver.name.toLowerCase().includes(searchTerm) ||
      driver.phoneNumber.includes(searchTerm) ||
      driver.vehicleNumber.toLowerCase().includes(searchTerm) ||
      (driver.companyName?.toLowerCase() || '').includes(searchTerm) ||
      driver.businessNumber.includes(searchTerm)
    );
  }
  
  // 차량 종류 필터링
  if (filter.vehicleType) {
    filteredDrivers = filteredDrivers.filter(driver => driver.vehicleType === filter.vehicleType);
  }
  
  // 톤수 필터링
  if (filter.tonnage) {
    filteredDrivers = filteredDrivers.filter(driver => driver.tonnage === filter.tonnage);
  }
  
  // 상태 필터링
  if (filter.status) {
    filteredDrivers = filteredDrivers.filter(driver => driver.status === filter.status);
  }
  
  // 배차 횟수 필터링
  if (filter.dispatchCount) {
    const option = DISPATCH_COUNT_OPTIONS.find(opt => opt.value === filter.dispatchCount);
    if (option) {
      filteredDrivers = filteredDrivers.filter(driver => (driver.dispatchCount ?? 0) >= option.min);
    }
  }
  
  // 날짜 필터링
  if (filter.startDate) {
    filteredDrivers = filteredDrivers.filter(
      driver => (driver.createdAt ?? '') >= filter.startDate!
    );
  }
  
  if (filter.endDate) {
    filteredDrivers = filteredDrivers.filter(
      driver => (driver.createdAt ?? '') <= filter.endDate!
    );
  }
  
  // 정렬: 배차 횟수 기준 내림차순
  filteredDrivers.sort((a, b) => (b.dispatchCount ?? 0) - (a.dispatchCount ?? 0));
  
  // 페이지네이션 적용
  const total = filteredDrivers.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);
  
  return {
    data: paginatedDrivers,
    total,
    page,
    pageSize,
    totalPages
  };
}; 