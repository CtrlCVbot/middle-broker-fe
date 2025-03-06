import { IOrder, IOrderResponse } from "@/types/order";

// 화물 상태 목록
export const ORDER_STATUS = [
  "배차대기",
  "배차완료",
  "상차완료",
  "운송중",
  "하차완료",
  "정산완료"
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

// 도시 목록
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

// 목업 화물 데이터
export const mockOrders: IOrder[] = [
  {
    id: "202103150123",
    status: "배차대기",
    departureDateTime: "2023-03-15 11:00",
    departureLocation: "경기도 성남시 중원구 은행동",
    arrivalDateTime: "2023-03-15 15:00",
    arrivalLocation: "경기도 성남시 중원구 은행동",
    amount: 114000,
    fee: 4000,
    vehicle: {
      type: "카고",
      weight: "2.5톤"
    },
    driver: {
      name: "김성철",
      contact: "010-9104-1200"
    },
    createdAt: "2023-03-14 14:30"
  },
  {
    id: "202103150124",
    status: "배차완료",
    departureDateTime: "2023-03-16 09:00",
    departureLocation: "서울특별시 강남구 역삼동",
    arrivalDateTime: "2023-03-16 17:00",
    arrivalLocation: "부산광역시 해운대구 우동",
    amount: 370000,
    fee: 12000,
    vehicle: {
      type: "윙바디",
      weight: "5톤"
    },
    driver: {
      name: "이준호",
      contact: "010-2345-6789"
    },
    createdAt: "2023-03-14 15:20"
  },
  {
    id: "202103150125",
    status: "상차완료",
    departureDateTime: "2023-03-15 13:30",
    departureLocation: "인천광역시 서구 청라동",
    arrivalDateTime: "2023-03-16 10:00",
    arrivalLocation: "대구광역시 동구 신천동",
    amount: 250000,
    fee: 8500,
    vehicle: {
      type: "탑차",
      weight: "3.5톤"
    },
    driver: {
      name: "박민수",
      contact: "010-9876-5432"
    },
    createdAt: "2023-03-14 16:45"
  },
  {
    id: "202103150126",
    status: "운송중",
    departureDateTime: "2023-03-16 07:00",
    departureLocation: "대전광역시 유성구 궁동",
    arrivalDateTime: "2023-03-16 14:00",
    arrivalLocation: "광주광역시 북구 용봉동",
    amount: 200000,
    fee: 7000,
    vehicle: {
      type: "냉동",
      weight: "3.5톤"
    },
    driver: {
      name: "정도현",
      contact: "010-1122-3344"
    },
    createdAt: "2023-03-15 08:10"
  },
  {
    id: "202103150127",
    status: "하차완료",
    departureDateTime: "2023-03-15 10:00",
    departureLocation: "울산광역시 남구 삼산동",
    arrivalDateTime: "2023-03-15 18:00",
    arrivalLocation: "경남 창원시 성산구 가음동",
    amount: 180000,
    fee: 6500,
    vehicle: {
      type: "탑차",
      weight: "2.5톤"
    },
    driver: {
      name: "강지훈",
      contact: "010-5566-7788"
    },
    createdAt: "2023-03-14 12:30"
  },
  {
    id: "202103150128",
    status: "정산완료",
    departureDateTime: "2023-03-14 14:00",
    departureLocation: "경북 포항시 남구 오천읍",
    arrivalDateTime: "2023-03-15 01:00",
    arrivalLocation: "경북 구미시 원평동",
    amount: 220000,
    fee: 7800,
    vehicle: {
      type: "윙바디",
      weight: "5톤"
    },
    driver: {
      name: "양세준",
      contact: "010-3344-5566"
    },
    createdAt: "2023-03-13 09:50"
  },
  {
    id: "202103150129",
    status: "배차대기",
    departureDateTime: "2023-03-17 08:00",
    departureLocation: "전북 전주시 완산구 효자동",
    arrivalDateTime: "2023-03-17 16:00",
    arrivalLocation: "전남 순천시 연향동",
    amount: 240000,
    fee: 8200,
    vehicle: {
      type: "카고",
      weight: "3.5톤"
    },
    driver: {
      name: "",
      contact: ""
    },
    createdAt: "2023-03-15 14:15"
  },
  {
    id: "202103150130",
    status: "배차대기",
    departureDateTime: "2023-03-17 09:30",
    departureLocation: "충북 청주시 상당구 용암동",
    arrivalDateTime: "2023-03-17 15:30",
    arrivalLocation: "충남 천안시 서북구 두정동",
    amount: 190000,
    fee: 6700,
    vehicle: {
      type: "탑차",
      weight: "2.5톤"
    },
    driver: {
      name: "",
      contact: ""
    },
    createdAt: "2023-03-15 10:25"
  },
  {
    id: "202103150131",
    status: "배차완료",
    departureDateTime: "2023-03-16 11:00",
    departureLocation: "강원 춘천시 후평동",
    arrivalDateTime: "2023-03-16 19:00",
    arrivalLocation: "서울특별시 송파구 문정동",
    amount: 230000,
    fee: 8000,
    vehicle: {
      type: "카고",
      weight: "3.5톤"
    },
    driver: {
      name: "이태호",
      contact: "010-7788-9900"
    },
    createdAt: "2023-03-15 11:30"
  },
  {
    id: "202103150132",
    status: "운송중",
    departureDateTime: "2023-03-15 16:00",
    departureLocation: "제주 제주시 노형동",
    arrivalDateTime: "2023-03-16 08:00",
    arrivalLocation: "제주 서귀포시 대정읍",
    amount: 150000,
    fee: 5500,
    vehicle: {
      type: "냉장",
      weight: "1톤"
    },
    driver: {
      name: "송민재",
      contact: "010-2233-4455"
    },
    createdAt: "2023-03-15 09:00"
  },
  {
    id: "202103150133",
    status: "정산완료",
    departureDateTime: "2023-03-14 08:30",
    departureLocation: "서울특별시 서초구 서초동",
    arrivalDateTime: "2023-03-14 14:30",
    arrivalLocation: "경기도 화성시 동탄",
    amount: 160000,
    fee: 5800,
    vehicle: {
      type: "윙바디",
      weight: "2.5톤"
    },
    driver: {
      name: "홍기태",
      contact: "010-6677-8899"
    },
    createdAt: "2023-03-13 16:00"
  },
  {
    id: "202103150134",
    status: "배차대기",
    departureDateTime: "2023-03-18 07:00",
    departureLocation: "부산광역시 사상구 감전동",
    arrivalDateTime: "2023-03-18 17:00",
    arrivalLocation: "경남 진주시 충무공동",
    amount: 280000,
    fee: 9500,
    vehicle: {
      type: "트레일러",
      weight: "25톤"
    },
    driver: {
      name: "",
      contact: ""
    },
    createdAt: "2023-03-15 13:45"
  },
  {
    id: "202103150135",
    status: "상차완료",
    departureDateTime: "2023-03-16 10:30",
    departureLocation: "인천광역시 미추홀구 주안동",
    arrivalDateTime: "2023-03-16 15:30",
    arrivalLocation: "경기도 수원시 영통구",
    amount: 140000,
    fee: 5000,
    vehicle: {
      type: "탑차",
      weight: "1톤"
    },
    driver: {
      name: "김영수",
      contact: "010-1234-5678"
    },
    createdAt: "2023-03-15 09:40"
  },
  {
    id: "202103150136",
    status: "하차완료",
    departureDateTime: "2023-03-15 09:00",
    departureLocation: "대구광역시 수성구 범어동",
    arrivalDateTime: "2023-03-15 18:30",
    arrivalLocation: "경북 경주시 황성동",
    amount: 170000,
    fee: 6000,
    vehicle: {
      type: "카고",
      weight: "2.5톤"
    },
    driver: {
      name: "박지성",
      contact: "010-8877-6655"
    },
    createdAt: "2023-03-14 17:20"
  },
  {
    id: "202103150137",
    status: "배차완료",
    departureDateTime: "2023-03-17 13:00",
    departureLocation: "광주광역시 서구 치평동",
    arrivalDateTime: "2023-03-17 19:00",
    arrivalLocation: "전남 목포시 상동",
    amount: 190000,
    fee: 6700,
    vehicle: {
      type: "윙바디",
      weight: "3.5톤"
    },
    driver: {
      name: "권상현",
      contact: "010-9988-7766"
    },
    createdAt: "2023-03-15 15:10"
  }
];

// 페이지별 데이터 조회 함수
export const getOrdersByPage = (
  page: number, 
  limit: number,
  city?: string,
  vehicleType?: string,
  weight?: string,
  searchTerm?: string
): IOrderResponse => {
  let filteredData = [...mockOrders];
  
  // 도시 필터링
  if (city) {
    filteredData = filteredData.filter(
      (order) =>
        order.departureLocation.includes(city) || 
        order.arrivalLocation.includes(city)
    );
  }
  
  // 차량 종류 필터링
  if (vehicleType) {
    filteredData = filteredData.filter(
      (order) => order.vehicle.type === vehicleType
    );
  }
  
  // 중량 필터링
  if (weight) {
    filteredData = filteredData.filter(
      (order) => order.vehicle.weight === weight
    );
  }
  
  // 검색어 필터링
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredData = filteredData.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.departureLocation.toLowerCase().includes(term) ||
        order.arrivalLocation.toLowerCase().includes(term) ||
        order.driver.name.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term)
    );
  }
  
  // 전체 데이터 수
  const total = filteredData.length;
  
  // 페이지 계산
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  
  // 필요한 데이터만 잘라서 반환
  const data = filteredData.slice(startIndex, endIndex);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit
    }
  };
}; 