import { faker } from '@faker-js/faker/locale/ko';
import { 
  ISettlement, 
  ISettlementResponse, 
  SettlementStatus, 
  SETTLEMENT_STATUS 
} from '@/types/settlement';

// 은행 목록
const BANKS = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '기업은행',
  '농협은행',
  '새마을금고',
  '카카오뱅크',
  '토스뱅크'
];

// 지불 방법 목록
const PAYMENT_METHODS = [
  '계좌이체',
  '카드결제',
  '세금계산서',
  '현금'
];

// 도시 목록
const CITIES = [
  '서울',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주'
];

// 화물 번호 형식 생성
const generateOrderId = (): string => {
  const year = new Date().getFullYear().toString().slice(2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OR${year}${month}-${randomNum}`;
};

// 정산 번호 형식 생성
const generateSettlementId = (): string => {
  const year = new Date().getFullYear().toString().slice(2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ST${year}${month}-${randomNum}`;
};

// 정산 목업 데이터 생성 함수
export const generateMockSettlement = (): ISettlement => {
  // 출발/도착 도시 랜덤 선택
  const departureCity = faker.helpers.arrayElement(CITIES);
  const arrivalCity = faker.helpers.arrayElement(CITIES.filter(city => city !== departureCity));
  
  // 운송비 금액 (100만원~300만원 사이)
  const amount = faker.number.int({ min: 1000000, max: 3000000 });
  
  // 수수료 (10% 기본)
  const fee = Math.round(amount * 0.1);
  
  // 최종 정산액 (운송비 - 수수료)
  const finalAmount = amount - fee;
  
  // 랜덤 상태 설정
  const status: SettlementStatus = faker.helpers.arrayElement(SETTLEMENT_STATUS);
  
  // 정산 상태에 따라 요청일, 완료일 설정
  let requestDate: string | undefined;
  let completedDate: string | undefined;
  let paymentMethod: string | undefined;
  
  if (status === '정산요청' || status === '정산진행중' || status === '정산완료') {
    requestDate = faker.date.recent({ days: 30 }).toISOString().split('T')[0];
    
    if (status === '정산완료') {
      completedDate = faker.date.recent({ days: 7 }).toISOString().split('T')[0];
      paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);
    }
  }
  
  // 은행 정보 생성
  const bank = faker.helpers.arrayElement(BANKS);
  const accountNumber = `${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(6)}`;
  const bankInfo = `${bank} ${accountNumber}`;
  
  // 세금 정보 (정산완료 상태인 경우만 설정)
  const tax = status === '정산완료' ? Math.round(amount * 0.033) : undefined;
  
  return {
    id: generateSettlementId(),
    status,
    orderId: generateOrderId(),
    departureDateTime: faker.date.recent({ days: 60 }).toISOString(),
    departureCity,
    departureLocation: `${departureCity} ${faker.location.streetAddress()}`,
    arrivalDateTime: faker.date.recent({ days: 30 }).toISOString(),
    arrivalCity,
    arrivalLocation: `${arrivalCity} ${faker.location.streetAddress()}`,
    amount,
    fee,
    finalAmount,
    driver: {
      name: faker.person.fullName(),
      contact: faker.phone.number(),
      bankInfo
    },
    requestDate,
    completedDate,
    paymentMethod,
    tax,
    createdAt: faker.date.recent({ days: 90 }).toISOString()
  };
};

// 대량의 정산 데이터 생성
export const generateMockSettlements = (count: number): ISettlement[] => {
  return Array.from({ length: count }, () => generateMockSettlement());
};

// 페이징된 정산 데이터 조회 함수
export const getSettlementsByPage = (
  page: number = 1,
  limit: number = 10,
  departureCity?: string,
  arrivalCity?: string,
  driverName?: string,
  searchTerm?: string,
  status?: SettlementStatus,
  startDate?: string,
  endDate?: string,
  minAmount?: number,
  maxAmount?: number,
  orderId?: string
): ISettlementResponse => {
  // 100개의 목업 데이터 생성
  let data = generateMockSettlements(100);
  
  // 필터링 적용
  if (departureCity) {
    data = data.filter(item => item.departureCity === departureCity);
  }
  
  if (arrivalCity) {
    data = data.filter(item => item.arrivalCity === arrivalCity);
  }
  
  if (driverName) {
    data = data.filter(item => item.driver.name.includes(driverName));
  }
  
  if (searchTerm) {
    data = data.filter(item => 
      item.id.includes(searchTerm) ||
      item.orderId.includes(searchTerm) ||
      item.departureLocation.includes(searchTerm) ||
      item.arrivalLocation.includes(searchTerm) ||
      item.driver.name.includes(searchTerm) ||
      item.driver.contact.includes(searchTerm)
    );
  }
  
  if (status) {
    data = data.filter(item => item.status === status);
  }
  
  if (startDate) {
    const start = new Date(startDate);
    data = data.filter(item => new Date(item.createdAt) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    data = data.filter(item => new Date(item.createdAt) <= end);
  }
  
  if (minAmount !== undefined) {
    data = data.filter(item => item.amount >= minAmount);
  }
  
  if (maxAmount !== undefined) {
    data = data.filter(item => item.amount <= maxAmount);
  }
  
  if (orderId) {
    data = data.filter(item => item.orderId === orderId);
  }
  
  // 총 데이터 수
  const total = data.length;
  
  // 현재 페이지의 데이터 추출
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      total,
      page,
      limit
    }
  };
};

// 단일 정산 데이터 조회 함수
export const getSettlementById = (id: string): ISettlement | null => {
  // 5개의 정산 데이터 생성
  const settlements = generateMockSettlements(5);
  
  // id가 일치하는 데이터를 반환하거나, 없으면 첫 번째 항목 반환
  return settlements.find(item => item.id === id) || settlements[0];
};

// 정산 로그 데이터 생성
export const getSettlementLogs = (settlementId: string) => {
  const settlement = getSettlementById(settlementId);
  
  if (!settlement) return [];
  
  const logs = [];
  const status = SETTLEMENT_STATUS.indexOf(settlement.status);
  
  // 상태에 따라 로그 생성
  for (let i = 0; i <= status; i++) {
    const logDate = new Date(settlement.createdAt);
    logDate.setDate(logDate.getDate() + i * 2);
    
    logs.push({
      status: SETTLEMENT_STATUS[i],
      date: logDate.toISOString().split('T')[0],
      time: logDate.toTimeString().split(' ')[0].substring(0, 5),
      handler: faker.person.fullName(),
      remark: i === status ? '현재 상태' : undefined
    });
  }
  
  return logs;
}; 