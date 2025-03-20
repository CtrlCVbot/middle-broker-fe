import { 
  IIncome, 
  IncomeStatusType, 
  IIncomeResponse, 
  IncomeSummary,
  IAdditionalFee,
  AdditionalFeeType,
  IIncomeLog 
} from "@/types/income";
import { IBrokerOrder } from "@/types/broker-order";
import { v4 as uuidv4 } from 'uuid';
import { addDays, format, subDays, addHours, addMinutes } from 'date-fns';

// 목업 데이터 생성을 위한 임포트
import { mockBrokerOrders } from "./mock-broker-orders";

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

// 정산 로그 생성 함수
const generateIncomeLogs = (status: IncomeStatusType, createdDays: number = 7): IIncomeLog[] => {
  const logs: IIncomeLog[] = [];
  const createdDate = format(subDays(new Date(), createdDays), 'yyyy-MM-dd');
  const createdTime = format(
    addHours(addMinutes(new Date(), -createdDays * 24 * 60), Math.random() * 12),
    'HH:mm:ss'
  );
  
  // 초기 상태 로그 추가
  logs.push({
    status: '정산대기',
    date: createdDate,
    time: createdTime,
    handler: '시스템',
    remark: '정산 대기 전환'
  });
  
  // 상태에 따라 추가 로그 생성
  if (status === '정산대사' || status === '정산완료') {
    const processDate = format(addDays(new Date(createdDate), Math.floor(Math.random() * 3) + 1), 'yyyy-MM-dd');
    const processTime = getRandomTimeString();
    
    logs.push({
      status: '정산대사',
      date: processDate,
      time: processTime,
      handler: '관리자',
      remark: '정산 대사 진행'
    });
  }
  
  if (status === '정산완료') {
    const completeDate = format(new Date(), 'yyyy-MM-dd');
    const completeTime = getRandomTimeString();
    
    logs.push({
      status: '정산완료',
      date: completeDate,
      time: completeTime,
      handler: '관리자',
      remark: '정산 완료 처리'
    });
  }
  
  return logs;
};

// 무작위 사업자번호 생성 함수
const generateBusinessNumber = (): string => {
  const part1 = Math.floor(Math.random() * 900) + 100;
  const part2 = Math.floor(Math.random() * 90) + 10;
  const part3 = Math.floor(Math.random() * 90000) + 10000;
  
  return `${part1}-${part2}-${part3}`;
};

// 특정 화물 ID 목록으로 정산 데이터 생성 함수
export const createIncomeFromOrders = (
  orders: IBrokerOrder[], 
  status: IncomeStatusType = '정산대기',
  additionalFeesCount: number = 0
): IIncome => {
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
  const logs = generateIncomeLogs(status, Math.floor(Math.random() * 7) + 1);
  
  // 정산서 상태 처리
  let invoiceStatus: '미발행' | '발행대기' | '발행완료' | '발행오류' = '미발행';
  let invoiceNumber: string | undefined = undefined;
  let invoiceIssuedDate: string | undefined = undefined;
  
  if (status === '정산완료') {
    invoiceStatus = '발행완료';
    invoiceNumber = `INV-${Math.floor(Math.random() * 10000) + 1000}`;
    invoiceIssuedDate = getCurrentDateString();
  } else if (status === '정산대사') {
    invoiceStatus = Math.random() > 0.7 ? '발행대기' : '미발행';
  }
  
  // 관리자 정보
  const managers = ['김관리', '이담당', '박매니저', '정책임'];
  const manager = managers[Math.floor(Math.random() * managers.length)];
  
  // 정산 데이터 생성
  return {
    id: `INC-${Math.floor(Math.random() * 100000) + 10000}`,
    status,
    orderIds,
    orders,
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
export const generateMockIncomes = (count: number = 20): IIncome[] => {
  // 운송 마감된 화물만 필터링
  const completedOrders = mockBrokerOrders.filter(order => order.status === '운송마감');
  
  // 화주별로 화물 그룹화
  const groupedOrders = groupOrdersByShipper(completedOrders);
  
  const incomes: IIncome[] = [];
  
  // 각 화주별로 정산 데이터 생성
  Object.entries(groupedOrders).forEach(([shipperName, orders]) => {
    // 화주의 화물이 많을 경우, 여러 묶음으로 나눠서 정산 생성
    if (orders.length > 5 && Math.random() > 0.5) {
      const batch1 = orders.slice(0, Math.floor(orders.length / 2));
      const batch2 = orders.slice(Math.floor(orders.length / 2));
      
      // 첫 번째 묶음 - 정산 완료 상태
      if (batch1.length > 0) {
        incomes.push(createIncomeFromOrders(batch1, '정산완료', 2));
      }
      
      // 두 번째 묶음 - 정산 대사 또는 정산 대기 상태
      if (batch2.length > 0) {
        const status: IncomeStatusType = Math.random() > 0.5 ? '정산대사' : '정산대기';
        incomes.push(createIncomeFromOrders(batch2, status, 1));
      }
    } else {
      // 단일 묶음으로 정산 생성
      if (orders.length > 0) {
        // 랜덤 상태 지정
        const statusRand = Math.random();
        let status: IncomeStatusType = '정산대기';
        
        if (statusRand > 0.7) {
          status = '정산완료';
        } else if (statusRand > 0.4) {
          status = '정산대사';
        }
        
        incomes.push(createIncomeFromOrders(orders, status));
      }
    }
  });
  
  // 필요한 경우 더 많은 정산 생성
  while (incomes.length < count) {
    // 랜덤하게 화주 선택
    const shippers = Object.keys(groupedOrders);
    const randomShipper = shippers[Math.floor(Math.random() * shippers.length)];
    const orders = groupedOrders[randomShipper];
    
    // 랜덤하게 화물 선택 (3~5개)
    const orderCount = Math.floor(Math.random() * 3) + 3;
    const selectedOrders = [];
    for (let i = 0; i < orderCount && i < orders.length; i++) {
      const randomIndex = Math.floor(Math.random() * orders.length);
      selectedOrders.push(orders[randomIndex]);
      // 중복 방지를 위해 선택된 화물 제거
      orders.splice(randomIndex, 1);
    }
    
    if (selectedOrders.length > 0) {
      // 랜덤 상태 지정
      const statusRand = Math.random();
      let status: IncomeStatusType = '정산대기';
      
      if (statusRand > 0.7) {
        status = '정산완료';
      } else if (statusRand > 0.4) {
        status = '정산대사';
      }
      
      incomes.push(createIncomeFromOrders(selectedOrders, status));
    }
  }
  
  return incomes.slice(0, count);
};

// 정산 요약 정보 계산 함수
export const calculateIncomeSummary = (incomes: IIncome[]): IncomeSummary => {
  return {
    totalIncomes: incomes.length,
    totalOrders: incomes.reduce((sum, income) => sum + income.orderCount, 0),
    totalBaseAmount: incomes.reduce((sum, income) => sum + income.totalBaseAmount, 0),
    totalAdditionalAmount: incomes.reduce((sum, income) => sum + income.totalAdditionalAmount, 0),
    totalAmount: incomes.reduce((sum, income) => sum + income.totalAmount, 0),
    totalTax: incomes.reduce((sum, income) => sum + income.tax, 0),
    totalFinalAmount: incomes.reduce((sum, income) => sum + income.finalAmount, 0)
  };
};

// 정산 목업 데이터
export const mockIncomes = generateMockIncomes(30);

// 페이지별 정산 데이터 가져오기 함수
export const getIncomesByPage = (
  page: number, 
  limit: number,
  status?: IncomeStatusType,
  shipperName?: string,
  startDate?: string,
  endDate?: string,
  searchTerm?: string,
  invoiceStatus?: string,
  minAmount?: number,
  maxAmount?: number,
  manager?: string
): IIncomeResponse => {
  // 필터링
  let filteredIncomes = [...mockIncomes];
  
  if (status) {
    filteredIncomes = filteredIncomes.filter(income => income.status === status);
  }
  
  if (shipperName) {
    filteredIncomes = filteredIncomes.filter(income => 
      income.shipperName.toLowerCase().includes(shipperName.toLowerCase())
    );
  }
  
  if (startDate) {
    filteredIncomes = filteredIncomes.filter(income => income.endDate >= startDate);
  }
  
  if (endDate) {
    filteredIncomes = filteredIncomes.filter(income => income.startDate <= endDate);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredIncomes = filteredIncomes.filter(income => 
      income.id.toLowerCase().includes(term) ||
      income.shipperName.toLowerCase().includes(term) ||
      income.manager.toLowerCase().includes(term) ||
      (income.businessNumber && income.businessNumber.includes(term))
    );
  }
  
  if (invoiceStatus) {
    filteredIncomes = filteredIncomes.filter(income => income.invoiceStatus === invoiceStatus);
  }
  
  if (minAmount !== undefined) {
    filteredIncomes = filteredIncomes.filter(income => income.finalAmount >= minAmount);
  }
  
  if (maxAmount !== undefined) {
    filteredIncomes = filteredIncomes.filter(income => income.finalAmount <= maxAmount);
  }
  
  if (manager) {
    filteredIncomes = filteredIncomes.filter(income => 
      income.manager.toLowerCase().includes(manager.toLowerCase())
    );
  }
  
  // 정렬 - 최신 정산부터
  filteredIncomes.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  // 페이징 처리
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);
  
  // 요약 정보 계산
  const summary = calculateIncomeSummary(filteredIncomes);
  
  return {
    data: paginatedIncomes,
    pagination: {
      total: filteredIncomes.length,
      page,
      limit
    },
    summary
  };
};

// ID로 특정 정산 정보 조회 함수
export const getIncomeById = (id: string): IIncome | undefined => {
  return mockIncomes.find(income => income.id === id);
};

// 특정 화물 ID가 포함된 정산 정보 조회 함수
export const getIncomeByOrderId = (orderId: string): IIncome | undefined => {
  return mockIncomes.find(income => income.orderIds.includes(orderId));
}; 