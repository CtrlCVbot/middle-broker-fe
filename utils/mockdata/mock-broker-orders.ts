import { 
  IBrokerOrder, 
  IBrokerOrderResponse, 
  IBrokerOrderSummary,
  CallCenterType,
  PaymentMethodType
} from "@/types/broker-order";

// 도시 목록 (상수로 먼저 정의)
export const CITIES = [
  "서울",
  "부산",
  "인천",
  "대구",
  "대전",
  "광주",
  "울산",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주"
];

// 중개 화물 상태 목록
export const BROKER_ORDER_STATUS = [
  "배차대기",
  "배차전",
  "배차완료",
  "상차완료",
  "운송중",
  "하차완료",
  "운송마감"
];

// 차량 종류 목록
export const VEHICLE_TYPES = [
  "카고",
  "윙바디",
  "탑차",
  "냉장",
  "냉동",
  "트레일러"
];

// 중량 목록
export const WEIGHT_TYPES = [
  "1톤",
  "2.5톤",
  "3.5톤",
  "5톤",
  "11톤",
  "25톤"
];

// 콜센터 목록
export const CALL_CENTERS: CallCenterType[] = [
  "24시",
  "원콜",
  "화물맨",
  "직접"
];

// 결제 방식 목록
export const PAYMENT_METHODS: PaymentMethodType[] = [
  "인수증",
  "선불",
  "착불",
  "선착불"
];

// 화물 품목 목록
export const CARGO_ITEMS = [
  "일반화물",
  "식품류",
  "의류",
  "가구",
  "전자제품",
  "건축자재",
  "중장비",
  "화학제품",
  "농산물",
  "냉동식품",
  "냉장식품",
  "위험물"
];

// 회사 목록
export const COMPANIES = [
  "한국물류(주)",
  "서울택배",
  "부산운송",
  "대한물류",
  "국제운송",
  "로지스틱스",
  "스마트물류",
  "코리아익스프레스",
  "퀵배송",
  "현대물류",
  "삼성물류",
  "SK운송"
];

// 담당자 목록
export const MANAGERS = [
  { name: "김중개", contact: "010-1234-5678" },
  { name: "이주선", contact: "010-2345-6789" },
  { name: "박배송", contact: "010-3456-7890" },
  { name: "정관리", contact: "010-4567-8901" },
  { name: "최물류", contact: "010-5678-9012" }
];

// 중개 화물 목업 데이터 생성
const generateMockBrokerOrders = (count: number): IBrokerOrder[] => {
  console.log('화물 목업 데이터 생성 시작:', count);
  const orders: IBrokerOrder[] = [];
  
  for (let i = 10; i < count; i++) {
    const id = `BRO-${(1000 + i).toString().padStart(6, '0')}`;
    const departureCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const arrivalCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const status = BROKER_ORDER_STATUS[Math.floor(Math.random() * BROKER_ORDER_STATUS.length)];
    const vehicleType = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
    const weight = WEIGHT_TYPES[Math.floor(Math.random() * WEIGHT_TYPES.length)];
    
    // 날짜 생성 (최근 30일 내)
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setDate(date.getDate() - randomDays);
    
    // 출발일 (오늘 ~ 7일 후)
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 7));
    
    // 도착일 (출발일 ~ 3일 후)
    const arrivalDate = new Date(departureDate);
    arrivalDate.setDate(arrivalDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    // 견적 금액 (10만원 ~ 100만원)
    const amount = Math.floor(Math.random() * 900000) + 100000;
    
    // 계약 금액 (견적 금액의 90~110%)
    const contractAmount = Math.round(amount * (0.9 + Math.random() * 0.2));
    
    // 청구 금액 (계약 금액의 100~120%)
    const chargeAmount = Math.round(contractAmount * (1 + Math.random() * 0.2));
    
    // 공급가 (청구 금액의 70~90%)
    const supplyAmount = Math.round(chargeAmount * (0.7 + Math.random() * 0.2));
    
    // 수수료 (금액의 10%)
    const fee = Math.floor(amount * 0.1);
    
    // 차주 이름 생성
    const driverNames = ["김운송", "이배송", "박화물", "최운반", "정물류", "강배달"];
    const driverName = driverNames[Math.floor(Math.random() * driverNames.length)];
    
    // 연락처 생성
    const contact = `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // 출발지 상세 주소
    const departureLocations = [
      "물류센터",
      "공장",
      "창고",
      "마트",
      "배송센터",
      "물류단지"
    ];
    const departureLocation = `${departureCity} ${departureLocations[Math.floor(Math.random() * departureLocations.length)]}`;
    
    // 도착지 상세 주소
    const arrivalLocations = [
      "물류센터",
      "공장",
      "창고",
      "마트",
      "배송센터",
      "물류단지"
    ];
    const arrivalLocation = `${arrivalCity} ${arrivalLocations[Math.floor(Math.random() * arrivalLocations.length)]}`;
    
    // 정산 상태 (50% 확률로 정산 완료)
    const hasSettlement = Math.random() > 0.5;
    const settlementStatus = hasSettlement ? "정산완료" : undefined;
    const settlementId = hasSettlement ? `SET-${(1000 + i).toString().padStart(6, '0')}` : undefined;
    
    // 콜센터
    const callCenter = CALL_CENTERS[Math.floor(Math.random() * CALL_CENTERS.length)];
    
    // 업체명
    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    
    // 업체 담당자
    const contactPerson = `${["김", "이", "박", "최", "정"][Math.floor(Math.random() * 5)]}${["대표", "과장", "팀장", "사원", "주임"][Math.floor(Math.random() * 5)]}`;
    
    // 결제 방식
    const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
    
    // 화물 품목
    const cargoItem = CARGO_ITEMS[Math.floor(Math.random() * CARGO_ITEMS.length)];
    
    // 담당자 정보
    const managerIndex = Math.floor(Math.random() * MANAGERS.length);
    const manager = MANAGERS[managerIndex].name;
    const managerContact = MANAGERS[managerIndex].contact;
    
    // GPS 위치 (70% 확률로 데이터 있음)
    const hasGpsData = Math.random() > 0.3;
    const gpsLocation = hasGpsData ? {
      lat: 35.5 + Math.random() * 3, // 한국 위도 범위 내 임의 값
      lng: 126.5 + Math.random() * 3, // 한국 경도 범위 내 임의 값
      lastUpdated: new Date(today.getTime() - Math.floor(Math.random() * 3600000)).toISOString(), // 최근 1시간 내
      status: ["좌표 확인", "상차 도착", "하차 도착", "상차 지각", "하차 지각"][Math.floor(Math.random() * 5)]
    } : undefined;
    
    orders.push({
      id,
      status: status as any,
      departureDateTime: departureDate.toISOString().split('T')[0],
      departureCity,
      departureLocation,
      arrivalDateTime: arrivalDate.toISOString().split('T')[0],
      arrivalCity,
      arrivalLocation,
      amount,
      fee,
      vehicle: {
        type: vehicleType,
        weight
      },
      driver: {
        name: driverName,
        contact
      },
      createdAt: date.toISOString().split('T')[0],
      settlementStatus: settlementStatus as any,
      settlementId,
      
      // 추가 필드
      callCenter: callCenter,
      company,
      contactPerson,
      contractAmount,
      chargeAmount,
      supplyAmount,
      paymentMethod,
      cargoItem,
      manager,
      managerContact,
      gpsLocation
    });
  }
  
  console.log('화물 목업 데이터 생성 완료:', orders.length);
  return orders;
};

// 생성된 목업 데이터
console.log('화물 목업 데이터 초기화 중...');
// 직접 생성하는 대신 지연 초기화를 위한 변수와 함수 정의
let _mockBrokerOrders: IBrokerOrder[] | null = null;

// 지연 초기화 함수 - 실제로 필요할 때만 데이터 생성
export const getMockBrokerOrders = (): IBrokerOrder[] => {
  if (_mockBrokerOrders === null) {
    console.log('최초 화물 데이터 생성 시작...');
    _mockBrokerOrders = generateMockBrokerOrders(30); // 데이터 수 감소
    console.log('최초 화물 데이터 생성 완료:', _mockBrokerOrders.length);
  }
  return _mockBrokerOrders;
};
console.log('화물 목업 데이터 초기화 완료 (지연 로딩 준비)');

// 주문 요약 정보 계산 함수
const calculateOrdersSummary = (orders: IBrokerOrder[]): IBrokerOrderSummary => {
  return {
    totalOrders: orders.length,
    totalChargeAmount: orders.reduce((sum, order) => sum + (order.chargeAmount || 0), 0),
    totalContractAmount: orders.reduce((sum, order) => sum + (order.contractAmount || 0), 0),
    totalSupplyAmount: orders.reduce((sum, order) => sum + (order.supplyAmount || 0), 0),
    totalProfit: orders.reduce((sum, order) => sum + ((order.chargeAmount || 0) - (order.supplyAmount || 0)), 0),
  };
};

// 페이지네이션 및 필터링된 중개 화물 목록 반환 함수
export const getBrokerOrdersByPage = (
  page: number, 
  limit: number,
  departureCity?: string,
  arrivalCity?: string,
  vehicleType?: string,
  weight?: string,
  searchTerm?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
  callCenter?: string,
  manager?: string
): IBrokerOrderResponse => {
  // 지연 초기화된 데이터 사용
  const mockBrokerOrders = getMockBrokerOrders();
  
  // 필터링
  let filteredOrders = [...mockBrokerOrders];
  
  // 출발지 필터
  if (departureCity) {
    filteredOrders = filteredOrders.filter(order => 
      order.departureCity === departureCity
    );
  }
  
  // 도착지 필터
  if (arrivalCity) {
    filteredOrders = filteredOrders.filter(order => 
      order.arrivalCity === arrivalCity
    );
  }
  
  // 차량 종류 필터
  if (vehicleType) {
    filteredOrders = filteredOrders.filter(order => 
      order.vehicle.type === vehicleType
    );
  }
  
  // 중량 필터
  if (weight) {
    filteredOrders = filteredOrders.filter(order => 
      order.vehicle.weight === weight
    );
  }
  
  // 상태 필터
  if (status) {
    filteredOrders = filteredOrders.filter(order => 
      order.status === status
    );
  }
  
  // 검색어 필터 (화물번호, 출발지, 도착지, 차주명 검색)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(order => 
      order.id.toLowerCase().includes(term) ||
      order.departureLocation.toLowerCase().includes(term) ||
      order.arrivalLocation.toLowerCase().includes(term) ||
      order.driver.name.toLowerCase().includes(term) ||
      order.company.toLowerCase().includes(term) ||
      order.contactPerson.toLowerCase().includes(term) ||
      order.cargoItem.toLowerCase().includes(term)
    );
  }
  
  // 날짜 범위 필터
  if (startDate) {
    filteredOrders = filteredOrders.filter(order => 
      order.departureDateTime >= startDate
    );
  }
  
  if (endDate) {
    filteredOrders = filteredOrders.filter(order => 
      order.departureDateTime <= endDate
    );
  }
  
  // 콜센터 필터
  if (callCenter) {
    filteredOrders = filteredOrders.filter(order => 
      order.callCenter === callCenter
    );
  }
  
  // 담당자 필터
  if (manager) {
    filteredOrders = filteredOrders.filter(order => 
      order.manager === manager
    );
  }
  
  // 요약 정보 계산
  const summary = calculateOrdersSummary(filteredOrders);
  
  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  return {
    data: paginatedOrders,
    pagination: {
      total: filteredOrders.length,
      page,
      limit
    },
    summary
  };
}; 