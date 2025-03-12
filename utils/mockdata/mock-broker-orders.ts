import { IBrokerOrder, IBrokerOrderResponse } from "@/types/broker-order";

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

// 목업 중개 화물 데이터 생성
const generateMockBrokerOrders = (count: number): IBrokerOrder[] => {
  const orders: IBrokerOrder[] = [];
  
  for (let i = 0; i < count; i++) {
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
    
    // 금액 (10만원 ~ 100만원)
    const amount = Math.floor(Math.random() * 900000) + 100000;
    
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
      settlementId
    });
  }
  
  return orders;
};

// 전체 목업 데이터 (500개)
const ALL_BROKER_ORDERS = generateMockBrokerOrders(500);

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
  endDate?: string
): IBrokerOrderResponse => {
  // 필터링
  let filteredOrders = [...ALL_BROKER_ORDERS];
  
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
      order.driver.name.toLowerCase().includes(term)
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
    }
  };
}; 