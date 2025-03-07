import { ILocationInfo, IOrderRegisterData, IOrder } from '@/types/order';

// 도시 목록
export const CITIES = [
  '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종', 
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

// 최근 사용 주소 목업 데이터
export const RECENT_LOCATIONS: ILocationInfo[] = [
  {
    address: '서울특별시 강남구 역삼동',
    detailedAddress: '강남빌딩 지하 2층',
    name: '이준호',
    company: '강남물류(주)',
    contact: '010-2345-6789',
    date: '2023-03-16',
    time: '09:00'
  },
  {
    address: '부산광역시 해운대구 우동',
    detailedAddress: '해운대센터 1층',
    name: '박정훈',
    company: '해운대물류(주)',
    contact: '010-8765-4321',
    date: '2023-03-16',
    time: '17:00'
  },
  {
    address: '인천광역시 서구 청라동',
    detailedAddress: '청라물류센터',
    name: '박민수',
    company: '청라물류(주)',
    contact: '010-9876-5432',
    date: '2023-03-15',
    time: '13:30'
  },
  {
    address: '대구광역시 동구 신천동',
    detailedAddress: '대구센터 3층',
    name: '이대구',
    company: '대구물류(주)',
    contact: '010-1234-5678',
    date: '2023-03-16',
    time: '10:00'
  }
];

// 주소 검색 함수 (목업)
export const searchAddress = async (query: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 검색어가 비어있으면 빈 배열 반환
      if (!query.trim()) {
        resolve([]);
        return;
      }
      
      // 간단한 검색 로직 (실제 API에서는 더 복잡한 검색 로직 사용)
      const results = [
        `${query} 1번지`,
        `${query} 중앙로 123`,
        `${query} 산업단지 A블록`,
        `${query} 주택단지 101동`,
        `${query} 상가 지하 1층`
      ];
      
      resolve(results);
    }, 500); // 0.5초 지연 (실제 API 호출 시뮬레이션)
  });
};

// 거리 계산 (목업)
export const calculateDistance = (
  departure: string, 
  destination: string
): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 실제로는 API를 통해 두 주소 간 거리를 계산하지만,
      // 여기서는 간단하게 랜덤 거리를 반환
      const distance = Math.floor(Math.random() * 500) + 50; // 50~550km 범위의 랜덤 거리
      resolve(distance);
    }, 800);
  });
};

// 금액 계산 (목업)
export const calculateAmount = (
  distance: number,
  weightType: string,
  options: string[]
): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 기본 금액 (거리 × 기본 단가)
      let baseAmount = distance * 1000; // 1km당 1,000원 가정
      
      // 무게에 따른 추가 금액
      const weightMultiplier = getWeightMultiplier(weightType);
      baseAmount *= weightMultiplier;
      
      // 옵션에 따른 추가 금액
      let optionAmount = 0;
      if (options.includes('fast')) optionAmount += 30000; // 빠른 배차 +30,000원
      if (options.includes('forklift')) optionAmount += 20000; // 지게차 하차 +20,000원
      if (options.includes('special')) optionAmount += 50000; // 특수화물 +50,000원
      
      // 최종 금액
      const totalAmount = Math.round(baseAmount + optionAmount);
      
      resolve(totalAmount);
    }, 500);
  });
};

// 무게별 배율 계산 (목업)
const getWeightMultiplier = (weightType: string): number => {
  switch(weightType) {
    case '1톤': return 0.8;
    case '1.4톤': return 0.9;
    case '2.5톤': return 1.0;
    case '3.5톤': return 1.3;
    case '5톤': return 1.8;
    case '11톤': return 2.5;
    case '25톤': return 3.5;
    default: return 1.0;
  }
};

// 화물 등록 함수 (목업)
export const registerOrder = async (data: IOrderRegisterData): Promise<IOrder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 현재 시각을 기반으로 ID 생성
      const now = new Date();
      const id = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      // 새 주문 생성
      const newOrder: IOrder = {
        id,
        status: '배차대기',
        departureDateTime: `${data.departure.date} ${data.departure.time}`,
        departureCity: data.departure.address.split(' ')[0] || '',
        departureLocation: data.departure.address,
        arrivalDateTime: `${data.destination.date} ${data.destination.time}`,
        arrivalCity: data.destination.address.split(' ')[0] || '',
        arrivalLocation: data.destination.address,
        amount: data.estimatedAmount || 0,
        fee: Math.round((data.estimatedAmount || 0) * 0.1), // 수수료는 예상 금액의 10%로 가정
        vehicle: {
          type: data.vehicleType,
          weight: data.weightType
        },
        driver: {
          name: '',
          contact: ''
        },
        createdAt: now.toISOString()
      };
      
      resolve(newOrder);
    }, 1000); // 1초 지연 (API 호출 시뮬레이션)
  });
}; 