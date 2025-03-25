import { 
  IExpenditure, 
  ExpenditureStatusType, 
  IExpenditureResponse, 
  ExpenditureSummary,
  IAdditionalFee,
  AdditionalFeeType,
  IExpenditureLog,
  IExpenditureCreateRequest as IExpenditureCreateRequestOriginal
} from "@/types/expenditure";
import { IBrokerOrder } from "@/types/broker-order";
import { v4 as uuidv4 } from 'uuid';
import { addDays, format, subDays, addHours, addMinutes } from 'date-fns';

// 목업 데이터 생성을 위한 임포트
import { getMockBrokerOrders } from "./mock-broker-orders";

// 현재 날짜 문자열 가져오기
const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// 현재 시간 문자열 가져오기
const getCurrentTimeString = (): string => {
  return format(new Date(), 'HH:mm:ss');
};

// 무작위 기간으로 일자 형식 문자열 반환
const getRandomDateString = (startDaysBack: number = 30, endDaysBack: number = 0): string => {
  const daysBack = Math.floor(Math.random() * (startDaysBack - endDaysBack + 1)) + endDaysBack;
  return format(subDays(new Date(), daysBack), 'yyyy-MM-dd');
};

// 무작위 시간 문자열 반환
const getRandomTimeString = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return format(new Date().setHours(hours, minutes), 'HH:mm:ss');
};

// 화주별 화물을 그룹화하는 함수
const groupOrdersByShipper = (orders: IBrokerOrder[]): Record<string, IBrokerOrder[]> => {
  return orders.reduce((acc, order) => {
    const shipperName = order.company;
    if (!acc[shipperName]) {
      acc[shipperName] = [];
    }
    acc[shipperName].push(order);
    return acc;
  }, {} as Record<string, IBrokerOrder[]>);
};

// 무작위 추가금 목록 생성 함수
const generateAdditionalFees = (orderIds: string[] = [], count: number = 0): IAdditionalFee[] => {
  const result: IAdditionalFee[] = [];
  const feeTypes: AdditionalFeeType[] = ['대기비', '경유비', '왕복비', '하차비', '수작업비', '기타', '할인'];
  
  // 특정 화물에 대한 추가금
  if (orderIds.length > 0 && Math.random() > 0.5) {
    const randomOrderId = orderIds[Math.floor(Math.random() * orderIds.length)];
    const feeType = feeTypes[Math.floor(Math.random() * (feeTypes.length - 1))]; // '할인' 제외
    const amount = Math.round(Math.random() * 50000 + 10000);
    
    result.push({
      id: uuidv4(),
      type: feeType,
      amount,
      orderId: randomOrderId,
      description: `${feeType} 비용`,
      createdAt: `${getRandomDateString(10, 5)} ${getRandomTimeString()}`,
      createdBy: '관리자'
    });
  }
  
  // 전체 정산 묶음에 대한 추가금
  const additionalCount = count || Math.floor(Math.random() * 3);
  for (let i = 0; i < additionalCount; i++) {
    const isDiscount = Math.random() > 0.8;
    const feeType = isDiscount ? '할인' : feeTypes[Math.floor(Math.random() * (feeTypes.length - 1))];
    const amount = isDiscount 
      ? -Math.round(Math.random() * 50000 + 10000) 
      : Math.round(Math.random() * 100000 + 20000);
    
    result.push({
      id: uuidv4(),
      type: feeType,
      amount,
      description: isDiscount ? '정산 할인' : `${feeType} 추가 비용`,
      createdAt: `${getRandomDateString(10, 5)} ${getRandomTimeString()}`,
      createdBy: '관리자'
    });
  }
  
  return result;
};

// 정산 상태 로그 생성 함수
function generateStatusLogs(status: ExpenditureStatusType, createdAt: Date): IExpenditureLog[] {
  const logs: IExpenditureLog[] = [];
  const createdDate = new Date(createdAt);
  
  // 항상 정산대기 로그 추가
  logs.push({
    status: 'WAITING',
    time: createdDate.toTimeString().split(' ')[0],
    date: createdDate.toISOString().split('T')[0],
    handler: '시스템',
    remark: '정산 생성'
  });
  
  // 정산대사 상태인 경우
  if (status === 'MATCHING' || status === 'COMPLETED') {
    const matchingDate = new Date(createdDate);
    matchingDate.setDate(matchingDate.getDate() + 1); // 하루 뒤
    
    logs.push({
      status: 'MATCHING',
      time: matchingDate.toTimeString().split(' ')[0],
      date: matchingDate.toISOString().split('T')[0],
      handler: '김담당',
      remark: '정산 검토 완료'
    });
  }
  
  // 정산완료 상태인 경우
  if (status === 'COMPLETED') {
    const completedDate = new Date(createdDate);
    completedDate.setDate(completedDate.getDate() + 2); // 이틀 뒤
    
    logs.push({
      status: 'COMPLETED',
      time: completedDate.toTimeString().split(' ')[0],
      date: completedDate.toISOString().split('T')[0],
      handler: '이승인',
      remark: '최종 승인 완료'
    });
  }
  
  return logs;
}

// 무작위 사업자번호 생성 함수
const generateBusinessNumber = (): string => {
  const part1 = Math.floor(Math.random() * 900) + 100;
  const part2 = Math.floor(Math.random() * 90) + 10;
  const part3 = Math.floor(Math.random() * 90000) + 10000;
  
  return `${part1}-${part2}-${part3}`;
};

// 정산 생성 요청을 위한 인터페이스 재정의
export interface IExpenditureCreateRequest {
  orderIds: string[];
  dueDate: Date;
  memo?: string;
  taxFree: boolean;
  hasTax: boolean;
  invoiceNumber?: string;
  paymentMethod: string;
}

// 특정 화물 ID 목록으로 정산 데이터 생성 함수
export const createExpenditureFromOrders = (
  orders: IBrokerOrder[], 
  status: ExpenditureStatusType = 'WAITING',
  additionalFeesCount: number = 0
): IExpenditure => {
  // 화주 정보 추출 (첫 번째 화물에서 가져옴)
  const firstOrder = orders[0];
  const shipperName = firstOrder.company;
  const shipperContact = firstOrder.contactPerson;
  
  // 정산 기간 계산 (최초 출발일 ~ 최종 도착일)
  let startDate = firstOrder.departureDateTime.split(' ')[0];
  let endDate = firstOrder.arrivalDateTime.split(' ')[0];
  
  orders.forEach((order: IBrokerOrder) => {
    const departureDate = order.departureDateTime.split(' ')[0];
    const arrivalDate = order.arrivalDateTime.split(' ')[0];
    
    if (departureDate < startDate) {
      startDate = departureDate;
    }
    
    if (arrivalDate > endDate) {
      endDate = arrivalDate;
    }
  });
  
  // 기본 금액 계산
  const totalBaseAmount = orders.reduce((sum, order) => sum + (order.chargeAmount || order.amount), 0);
  
  // 추가금 생성
  const orderIds = orders.map(order => order.id);
  const additionalFees = generateAdditionalFees(orderIds, additionalFeesCount);
  const totalAdditionalAmount = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  
  // 총 금액 및 세금 계산
  const totalAmount = totalBaseAmount + totalAdditionalAmount;
  const isTaxFree = Math.random() > 0.9; // 10%의 확률로 면세 처리
  const tax = isTaxFree ? 0 : Math.round(totalAmount * 0.1);
  const finalAmount = totalAmount + tax;
  
  // 로그 생성
  const logs = generateStatusLogs(status, new Date());
  
  // 정산서 상태 처리
  let invoiceStatus: '미발행' | '발행대기' | '발행완료' | '발행오류' = '미발행';
  let invoiceNumber: string | undefined = undefined;
  let invoiceIssuedDate: string | undefined = undefined;
  
  if (status === 'COMPLETED') {
    invoiceStatus = '발행완료';
    invoiceNumber = `INV-${Math.floor(Math.random() * 10000) + 1000}`;
    invoiceIssuedDate = getCurrentDateString();
  } else if (status === 'MATCHING') {
    invoiceStatus = Math.random() > 0.7 ? '발행대기' : '미발행';
  }
  
  // 관리자 정보
  const managers = ['김관리', '이담당', '박매니저', '정책임'];
  const manager = managers[Math.floor(Math.random() * managers.length)];
  
  // 정산 데이터 생성 - orders 객체 전체를 포함하지 않도록 수정
  return {
    id: `INC-${Math.floor(Math.random() * 100000) + 10000}`,
    status,
    orderIds,
    orderCount: orders.length,
    
    shipperName,
    businessNumber: generateBusinessNumber(),
    shipperContact: firstOrder.contactPerson,
    shipperEmail: `info@${shipperName.toLowerCase().replace(/\s+/g, '')}.com`,
    
    startDate,
    endDate,
    
    totalBaseAmount,
    totalAdditionalAmount,
    totalAmount,
    tax,
    isTaxFree,
    finalAmount,
    
    additionalFees,
    logs,
    
    invoiceNumber,
    invoiceIssuedDate,
    invoiceStatus,
    
    manager,
    managerContact: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    createdAt: logs[0].date + ' ' + logs[0].time,
    updatedAt: logs[logs.length - 1].date + ' ' + logs[logs.length - 1].time
  };
};

// 정산 목업 데이터 생성 함수
export function generateMockExpenditures(): IExpenditure[] {
  console.log('정산 데이터 생성 시작...');
  
  // getMockBrokerOrders에서 원본 배열 복사
  const orders = [...getMockBrokerOrders()].filter(order => 
    order.status === '운송마감' || order.status === '하차완료'
  );
  
  // 완료된 주문을 화주별로 그룹화
  const groupedOrders: { [key: string]: IBrokerOrder[] } = {};
  for (const order of orders) {
    if (!order.company) continue;
    if (!groupedOrders[order.company]) {
      groupedOrders[order.company] = [];
    }
    groupedOrders[order.company].push(order);
  }
  
  const shippers = Object.keys(groupedOrders);
  let Expenditures: IExpenditure[] = [];
  
  // 최대 15개의 정산 데이터 생성 (최적화)
  for (let i = 0; i < 15; i++) {
    // 랜덤 화주 선택
    const randomShipper = shippers[Math.floor(Math.random() * shippers.length)];
    const shippersOrders = groupedOrders[randomShipper];
    
    // 화주의 주문이 없거나 모두 소진된 경우 스킵
    if (!shippersOrders || shippersOrders.length === 0) {
      continue;
    }
    
    // 랜덤하게 화물 선택 (3~5개) - 원본 배열을 변형하지 않도록 복사본 사용
    const orderCount = Math.min(Math.floor(Math.random() * 3) + 3, shippersOrders.length);
    const availableOrderIndices = Array.from({ length: shippersOrders.length }, (_, i) => i);
    const selectedOrders = [];
    
    for (let i = 0; i < orderCount; i++) {
      if (availableOrderIndices.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableOrderIndices.length);
      const orderIndex = availableOrderIndices[randomIndex];
      selectedOrders.push(shippersOrders[orderIndex]);
      
      // 선택된 인덱스 제거 (중복 방지)
      availableOrderIndices.splice(randomIndex, 1);
    }
    
    // 정산 상태 랜덤 선택
    const statusOptions: ExpenditureStatusType[] = ['WAITING', 'MATCHING', 'COMPLETED'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // 정산 생성
    const Expenditure = createExpenditureFromOrders(selectedOrders, status);
    Expenditures.push(Expenditure);
  }
  
  // 생성 날짜 순으로 정렬 (최신순)
  Expenditures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  console.log(`총 ${Expenditures.length}개의 정산 데이터 생성 완료`);
  return Expenditures;
}

// 정산 요약 정보 계산 함수
export const calculateExpenditureSummary = (Expenditures: IExpenditure[]): ExpenditureSummary => {
  const summary: ExpenditureSummary = {
    totalExpenditures: Expenditures.length,
    totalOrders: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.orderCount, 0),
    totalBaseAmount: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.totalBaseAmount, 0),
    totalAdditionalAmount: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.totalAdditionalAmount, 0),
    totalAmount: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.totalAmount, 0),
    totalTax: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.tax, 0),
    totalFinalAmount: Expenditures.reduce((sum, Expenditure) => sum + Expenditure.finalAmount, 0)
  };
  
  return summary;
};

// 정산 목업 데이터
console.log('정산 목업 데이터 초기화 중...');
// 직접 생성하는 대신 지연 초기화를 위한 함수로 변경
let _mockExpenditures: IExpenditure[] | null = null;

// 지연 초기화 함수 - 실제로 필요할 때만 데이터 생성
export const getMockExpenditures = (): IExpenditure[] => {
  if (_mockExpenditures === null) {
    console.log('최초 정산 데이터 생성 시작...');
    _mockExpenditures = generateMockExpenditures();
    console.log('최초 정산 데이터 생성 완료:', _mockExpenditures.length);
  }
  return _mockExpenditures;
};
console.log('정산 목업 데이터 초기화 완료 (지연 로딩 준비)');

// 페이지별 정산 데이터 가져오기 함수
export const getExpendituresByPage = (
  page: number, 
  limit: number,
  filter: any = {}
): IExpenditureResponse => {
  console.log(`[getExpendituresByPage] 페이지: ${page}, 한 페이지당 항목: ${limit}, 필터:`, filter);
  
  // 지연 초기화된 데이터 사용
  const mockExpenditures = getMockExpenditures();
  
  // 필터링
  let filteredExpenditures = [...mockExpenditures];
  console.log('전체 정산 데이터 수:', mockExpenditures.length);
  
  // 화주명 필터
  if (filter.shipperName) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.shipperName?.includes(filter.shipperName)
    );
  }
  
  // 사업자번호 필터
  if (filter.businessNumber) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.businessNumber?.includes(filter.businessNumber)
    );
  }
  
  // 상태 필터
  if (filter.status) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.status === filter.status
    );
  }
  
  // 검색어 필터 (정산번호, 화주명, 사업자번호 등)
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.id.toLowerCase().includes(term) ||
      Expenditure.shipperName.toLowerCase().includes(term) ||
      Expenditure.businessNumber.toLowerCase().includes(term) ||
      Expenditure.manager.toLowerCase().includes(term)
    );
  }
  
  // 날짜 범위 필터
  if (filter.startDate) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.createdAt >= filter.startDate
    );
  }
  
  if (filter.endDate) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.createdAt <= filter.endDate
    );
  }
  
  // 담당자 필터
  if (filter.manager) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.manager === filter.manager
    );
  }
  
  // 세금계산서 상태 필터
  if (filter.invoiceStatus) {
    filteredExpenditures = filteredExpenditures.filter(Expenditure => 
      Expenditure.invoiceStatus === filter.invoiceStatus
    );
  }
  
  // 요약 정보 계산
  const summary = calculateExpenditureSummary(filteredExpenditures);
  
  // 페이징 처리
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedExpenditures = filteredExpenditures.slice(startIndex, endIndex);
  
  console.log(`[getExpendituresByPage] 필터링 후 데이터 수: ${filteredExpenditures.length}, 페이지 데이터 수: ${paginatedExpenditures.length}`);
  
  return {
    data: paginatedExpenditures,
    pagination: {
      total: filteredExpenditures.length,
      page,
      limit
    },
    summary
  };
};

// ID로 특정 정산 정보 조회 함수
export const getExpenditureById = (id: string): IExpenditure | undefined => {
  // 지연 초기화된 데이터 사용
  const mockExpenditures = getMockExpenditures();
  return mockExpenditures.find(Expenditure => Expenditure.id === id);
};

// 특정 화물 ID가 포함된 정산 정보 조회 함수
export const getExpenditureByOrderId = (orderId: string): IExpenditure | undefined => {
  // 지연 초기화된 데이터 사용
  const mockExpenditures = getMockExpenditures();
  return mockExpenditures.find(Expenditure => Expenditure.orderIds.includes(orderId));
};

/**
 * 새로운 정산 생성
 */
export const createExpenditure = async (data: IExpenditureCreateRequest): Promise<IExpenditure> => {
  console.log('정산 생성 요청 처리:', data);
  
  // 모든 broker orders 가져오기
  const allOrders = getMockBrokerOrders();
  
  // 선택된 주문 ID들에 해당하는 주문만 필터링
  const selectedOrders = allOrders.filter(order => data.orderIds.includes(order.id));
  
  if (selectedOrders.length === 0) {
    throw new Error('유효한 주문을 찾을 수 없습니다.');
  }
  
  // 첫 번째 주문으로부터 화주 정보 가져오기
  const firstOrder = selectedOrders[0];
  const shipperId = firstOrder.company; // IBrokerOrder에는 shipperId가 없으므로 company 필드를 사용
  const shipperName = firstOrder.company; // 마찬가지로 company 필드 사용
  
  // 총 운임료 및 배차비용 계산
  const totalFreight = selectedOrders.reduce((sum, order) => sum + (order.amount || 0), 0); // freightCharge 대신 amount 사용
  const totalDispatch = selectedOrders.reduce((sum, order) => sum + (order.fee || 0), 0); // dispatchCost 대신 fee 사용
  
  // 순이익 및 세금 계산
  const totalBaseAmount = totalFreight - totalDispatch;
  const tax = data.taxFree ? 0 : Math.round(totalBaseAmount * 0.1);
  const totalAmount = totalBaseAmount + tax;
  
  // 정산 기간 계산 (첫 주문의 상차일부터 마지막 주문의 하차일까지)
  const departureDate = new Date(Math.min(...selectedOrders.map(order => new Date(order.departureDateTime).getTime()))); // departureDate 대신 departureDateTime 사용
  const arrivalDate = new Date(Math.max(...selectedOrders.map(order => new Date(order.arrivalDateTime).getTime()))); // arrivalDate 대신 arrivalDateTime 사용
  
  // 현재 날짜 기준의 타임스탬프 생성
  const now = new Date();
  const createdAt = now.toISOString();
  const updatedAt = now.toISOString();
  
  // 정산 로그 생성
  const logs: IExpenditureLog[] = [
    {
      status: 'MATCHING',
      time: new Date().toLocaleTimeString('ko-KR'),
      date: new Date().toLocaleDateString('ko-KR'),
      handler: '시스템',
      remark: '정산이 생성되었습니다.'
    }
  ];
  
  // 새 정산 객체 생성
  const newExpenditure: IExpenditure = {
    id: `INC-${Math.floor(Math.random() * 100000) + 10000}`,
    status: 'MATCHING', // ExpenditureStatusType에 맞게 수정
    orderIds: data.orderIds,
    orderCount: selectedOrders.length,
    shipperId: shipperId,
    shipperName: shipperName,
    businessNumber: `123-45-${Math.floor(Math.random() * 100000)}`,
    shipperContact: `010-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
    manager: '담당자1',
    managerContact: '010-1234-5678',
    startDate: departureDate.toISOString(),
    endDate: arrivalDate.toISOString(),
    totalBaseAmount,
    totalAdditionalAmount: 0,
    totalAmount,
    tax,
    isTaxFree: data.taxFree,
    finalAmount: totalAmount,
    additionalFees: [],
    memo: data.memo || '',
    invoiceStatus: '미발행',
    invoiceNumber: data.invoiceNumber || '',
    createdAt,
    updatedAt,
    logs,
  };
  
  // 목업 데이터에 새 정산 추가
  const mockExpenditures = getMockExpenditures();
  mockExpenditures.push(newExpenditure);
  
  console.log('새 정산이 생성되었습니다:', newExpenditure.id);
  return newExpenditure;
}; 