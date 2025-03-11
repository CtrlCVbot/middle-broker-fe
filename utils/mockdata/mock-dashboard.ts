import { OrderStatusType } from "@/types/order";
import { addDays, format, subDays } from "date-fns";
import { ko } from "date-fns/locale";

// KPI 지표 타입 정의
export interface IKPI {
  monthlyOrderCount: number;
  monthlyOrderAmount: number;
  monthlyOrderAverage: number;
  weeklyTarget: {
    target: number;
    current: number;
    percentage: number;
  };
  monthlyTarget: {
    target: number;
    current: number;
    percentage: number;
  };
}

// 배차 상태별 통계 타입 정의
export interface IStatusStat {
  status: OrderStatusType;
  count: number;
  percentage: number;
}

// 운송 상태 변경 로그 타입 정의
export interface IStatusLog {
  id: string;
  orderNumber: string;
  timestamp: string;
  previousStatus: OrderStatusType | null;
  currentStatus: OrderStatusType;
  description: string;
  operator: string;
}

// 트렌드 데이터 포인트 타입 정의
export interface ITrendDataPoint {
  date: string;
  displayDate: string;
  orderCount: number;
  orderAmount: number;
}

// 지역별 운송 현황 타입 정의
export interface IRegionStat {
  name: string;
  count: number;
  percentage: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 지역별 운송 통계 타입 정의
export interface IRegionStats {
  departure: IRegionStat[];
  destination: IRegionStat[];
}

// 중량별 운송 통계 타입 정의
export interface IWeightStat {
  weight: string;
  count: number;
  percentage: number;
}

// 최근 등록된 화물 타입 정의 (간략 정보)
export interface IRecentOrder {
  id: string;
  orderNumber: string;
  status: OrderStatusType;
  departure: {
    address: string;
  };
  destination: {
    address: string;
  };
  amount: string;
  registeredDate: string;
  vehicleType: string;
  weightType: string;
}

// 상태 변경 로그를 위한 카운터 함수
let logCounter = 0;
export const getNextLogId = () => {
  logCounter += 1;
  return `log_${logCounter}`;
};

// 현재 날짜 기준 최근 n일 데이터 생성 헬퍼 함수
const generateDatesArray = (days: number): { date: Date; formatted: string; display: string }[] => {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    result.push({
      date,
      formatted: format(date, 'yyyy-MM-dd'),
      display: format(date, 'M/d', { locale: ko })
    });
  }
  
  return result;
};

// KPI 데이터 가져오기
export const getKpiData = (): IKPI => ({
  monthlyOrderCount: 325,
  monthlyOrderAmount: 128500000,
  monthlyOrderAverage: 395384,
  weeklyTarget: {
    target: 100,
    current: 78,
    percentage: 78
  },
  monthlyTarget: {
    target: 350,
    current: 325,
    percentage: 93
  }
});

// 배차 상태별 통계 가져오기
export const getStatusStats = (): IStatusStat[] => [
  { status: '배차대기', count: 45, percentage: 30 },
  { status: '배차완료', count: 62, percentage: 42 },
  { status: '상차완료', count: 23, percentage: 15 },
  { status: '운송중', count: 10, percentage: 7 },
  { status: '하차완료', count: 5, percentage: 3 },
  { status: '정산완료', count: 4, percentage: 3 }
];

// 최근 운송 상태 변경 로그 가져오기
export const getStatusLogs = (): IStatusLog[] => [
  {
    id: 'log_101',
    orderNumber: '202103150123',
    timestamp: '2023-03-11T10:15:30',
    previousStatus: '배차대기',
    currentStatus: '배차완료',
    description: '기사 배정 완료',
    operator: '김성환'
  },
  {
    id: 'log_102',
    orderNumber: '202103150124',
    timestamp: '2023-03-11T09:30:00',
    previousStatus: '배차완료',
    currentStatus: '상차완료',
    description: '출발지 상차 완료',
    operator: '김성환'
  },
  {
    id: 'log_103',
    orderNumber: '202103150125',
    timestamp: '2023-03-11T08:45:15',
    previousStatus: '상차완료',
    currentStatus: '운송중',
    description: '목적지로 운송 중',
    operator: '이재민'
  },
  {
    id: 'log_104',
    orderNumber: '202103150126',
    timestamp: '2023-03-11T08:30:00',
    previousStatus: '운송중',
    currentStatus: '하차완료',
    description: '목적지 하차 완료',
    operator: '이재민'
  },
  {
    id: 'log_105',
    orderNumber: '202103150127',
    timestamp: '2023-03-11T07:15:45',
    previousStatus: '하차완료',
    currentStatus: '정산완료',
    description: '운송비 정산 완료',
    operator: '박관리'
  },
  {
    id: 'log_106',
    orderNumber: '202103150129',
    timestamp: '2023-03-10T18:20:10',
    previousStatus: null,
    currentStatus: '배차대기',
    description: '화물 등록 완료',
    operator: '정등록'
  },
  {
    id: 'log_107',
    orderNumber: '202103150130',
    timestamp: '2023-03-10T17:45:30',
    previousStatus: '배차대기',
    currentStatus: '배차완료',
    description: '기사 배정 완료',
    operator: '김성환'
  },
  {
    id: 'log_108',
    orderNumber: '202103150131',
    timestamp: '2023-03-10T16:30:00',
    previousStatus: '배차완료',
    currentStatus: '상차완료',
    description: '출발지 상차 완료',
    operator: '이재민'
  },
  {
    id: 'log_109',
    orderNumber: '202103150132',
    timestamp: '2023-03-10T15:20:45',
    previousStatus: '상차완료',
    currentStatus: '운송중',
    description: '목적지로 운송 중',
    operator: '이재민'
  },
  {
    id: 'log_110',
    orderNumber: '202103150133',
    timestamp: '2023-03-10T14:10:15',
    previousStatus: '운송중',
    currentStatus: '하차완료',
    description: '목적지 하차 완료',
    operator: '이재민'
  }
];

// 트렌드 데이터 생성 및 가져오기
export const getTrendData = (days: 7 | 30 = 7): ITrendDataPoint[] => {
  const dates = generateDatesArray(days);
  
  // 간단한 시뮬레이션을 위한 값들
  const baseCount = days === 7 ? 30 : 10;
  const baseAmount = days === 7 ? 12000000 : 5000000;
  const countVariation = days === 7 ? 10 : 5;
  const amountVariation = days === 7 ? 3000000 : 1500000;
  
  return dates.map(({ formatted, display }, index) => {
    // 주말(토,일)에는 주문량 감소 시뮬레이션
    const date = new Date(formatted);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendFactor = isWeekend ? 0.6 : 1;
    
    // 시간이 지날수록 주문량 증가 시뮬레이션 (최근 데이터일수록 더 많은 주문)
    const timeFactor = 0.85 + (index / dates.length) * 0.3;
    
    const orderCount = Math.round((baseCount + Math.random() * countVariation) * weekendFactor * timeFactor);
    const orderAmount = Math.round((baseAmount + Math.random() * amountVariation) * weekendFactor * timeFactor);
    
    return {
      date: formatted,
      displayDate: display,
      orderCount,
      orderAmount
    };
  });
};

// 주요 출발지/도착지 데이터 생성 및 가져오기
export const getRegionStats = (): IRegionStats => ({
  departure: [
    { name: '서울특별시', count: 120, percentage: 37, coordinates: { lat: 37.5665, lng: 126.9780 } },
    { name: '인천광역시', count: 58, percentage: 18, coordinates: { lat: 37.4563, lng: 126.7052 } },
    { name: '경기도', count: 48, percentage: 15, coordinates: { lat: 37.2634, lng: 127.0276 } },
    { name: '부산광역시', count: 32, percentage: 10, coordinates: { lat: 35.1796, lng: 129.0756 } },
    { name: '대구광역시', count: 25, percentage: 8, coordinates: { lat: 35.8714, lng: 128.6014 } },
    { name: '기타', count: 42, percentage: 12 }
  ],
  destination: [
    { name: '서울특별시', count: 95, percentage: 29, coordinates: { lat: 37.5665, lng: 126.9780 } },
    { name: '경기도', count: 68, percentage: 21, coordinates: { lat: 37.2634, lng: 127.0276 } },
    { name: '부산광역시', count: 52, percentage: 16, coordinates: { lat: 35.1796, lng: 129.0756 } },
    { name: '대전광역시', count: 38, percentage: 12, coordinates: { lat: 36.3504, lng: 127.3845 } },
    { name: '광주광역시', count: 30, percentage: 9, coordinates: { lat: 35.1595, lng: 126.8526 } },
    { name: '기타', count: 42, percentage: 13 }
  ]
});

// 중량별 운송 통계 데이터 가져오기
export const getWeightStats = (): IWeightStat[] => [
  { weight: '1톤', count: 98, percentage: 30 },
  { weight: '2.5톤', count: 75, percentage: 23 },
  { weight: '3.5톤', count: 65, percentage: 20 },
  { weight: '5톤', count: 52, percentage: 16 },
  { weight: '11톤', count: 22, percentage: 7 },
  { weight: '25톤', count: 13, percentage: 4 }
];

// 최근 등록된 화물 목록 가져오기
export const getRecentOrders = (): IRecentOrder[] => [
  {
    id: '202103150123',
    orderNumber: '202103150123',
    status: '배차대기',
    departure: {
      address: '서울특별시 강남구 삼성동'
    },
    destination: {
      address: '경기도 성남시 분당구'
    },
    amount: '450,000원',
    registeredDate: '2023-03-11T10:30:00',
    vehicleType: '카고',
    weightType: '2.5톤'
  },
  {
    id: '202103150124',
    orderNumber: '202103150124',
    status: '배차완료',
    departure: {
      address: '인천광역시 서구 검암동'
    },
    destination: {
      address: '서울특별시 영등포구'
    },
    amount: '380,000원',
    registeredDate: '2023-03-11T09:15:00',
    vehicleType: '윙바디',
    weightType: '5톤'
  },
  {
    id: '202103150125',
    orderNumber: '202103150125',
    status: '상차완료',
    departure: {
      address: '부산광역시 해운대구'
    },
    destination: {
      address: '대구광역시 달서구'
    },
    amount: '520,000원',
    registeredDate: '2023-03-10T17:45:00',
    vehicleType: '탑차',
    weightType: '3.5톤'
  },
  {
    id: '202103150126',
    orderNumber: '202103150126',
    status: '운송중',
    departure: {
      address: '경기도 화성시 동탄'
    },
    destination: {
      address: '충청북도 청주시'
    },
    amount: '420,000원',
    registeredDate: '2023-03-10T16:20:00',
    vehicleType: '카고',
    weightType: '1톤'
  },
  {
    id: '202103150127',
    orderNumber: '202103150127',
    status: '하차완료',
    departure: {
      address: '대전광역시 유성구'
    },
    destination: {
      address: '서울특별시 강서구'
    },
    amount: '560,000원',
    registeredDate: '2023-03-10T14:10:00',
    vehicleType: '윙바디',
    weightType: '11톤'
  },
  {
    id: '202103150128',
    orderNumber: '202103150128',
    status: '정산완료',
    departure: {
      address: '광주광역시 북구'
    },
    destination: {
      address: '전라남도 여수시'
    },
    amount: '380,000원',
    registeredDate: '2023-03-10T11:50:00',
    vehicleType: '탑차',
    weightType: '2.5톤'
  },
  {
    id: '202103150129',
    orderNumber: '202103150129',
    status: '배차대기',
    departure: {
      address: '서울특별시 송파구'
    },
    destination: {
      address: '경기도 용인시'
    },
    amount: '290,000원',
    registeredDate: '2023-03-10T10:30:00',
    vehicleType: '카고',
    weightType: '1톤'
  },
  {
    id: '202103150130',
    orderNumber: '202103150130',
    status: '배차완료',
    departure: {
      address: '경기도 성남시 판교'
    },
    destination: {
      address: '서울특별시 마포구'
    },
    amount: '320,000원',
    registeredDate: '2023-03-10T09:15:00',
    vehicleType: '탑차',
    weightType: '1톤'
  },
  {
    id: '202103150131',
    orderNumber: '202103150131',
    status: '상차완료',
    departure: {
      address: '인천광역시 남동구'
    },
    destination: {
      address: '경기도 안양시'
    },
    amount: '350,000원',
    registeredDate: '2023-03-09T16:45:00',
    vehicleType: '카고',
    weightType: '2.5톤'
  },
  {
    id: '202103150132',
    orderNumber: '202103150132',
    status: '운송중',
    departure: {
      address: '부산광역시 사상구'
    },
    destination: {
      address: '경상남도 창원시'
    },
    amount: '420,000원',
    registeredDate: '2023-03-09T15:20:00',
    vehicleType: '윙바디',
    weightType: '5톤'
  }
];

// 실시간 로그 생성 함수
export const generateNewLog = (): IStatusLog => {
  const statuses: OrderStatusType[] = ['배차대기', '배차완료', '상차완료', '운송중', '하차완료', '정산완료'];
  const operators = ['김성환', '이재민', '박관리', '정등록'];
  const descriptions = [
    '화물 등록 완료',
    '기사 배정 완료',
    '출발지 상차 완료',
    '목적지로 운송 중',
    '목적지 하차 완료',
    '운송비 정산 완료'
  ];
  
  // 랜덤 인덱스 생성
  const randomStatusIndex = Math.floor(Math.random() * (statuses.length - 1));
  const prevStatus = randomStatusIndex === 0 ? null : statuses[randomStatusIndex - 1];
  const currentStatus = statuses[randomStatusIndex];
  const operatorIndex = Math.floor(Math.random() * operators.length);
  
  // 현재 날짜 + 랜덤 초를 이용한 타임스탬프 생성
  const now = new Date();
  const randomSeconds = Math.floor(Math.random() * 120); // 최근 2분 이내
  const timestamp = new Date(now.getTime() - randomSeconds * 1000).toISOString();
  
  // 주문번호는 현재 시간 기반으로 생성
  const orderNumber = `${format(now, 'yyyyMMdd')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  
  return {
    id: getNextLogId(),
    orderNumber,
    timestamp,
    previousStatus: prevStatus,
    currentStatus,
    description: descriptions[randomStatusIndex],
    operator: operators[operatorIndex]
  };
}; 