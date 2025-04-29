import { IAddress } from "@/types/address";
import { ILocationInfo, WeightType } from "@/types/order";
import { v4 as uuidv4 } from 'uuid';
/**
 * 두 주소 간의 예상 거리를 계산합니다.
 * @param departureAddress 출발지 주소
 * @param destinationAddress 도착지 주소
 * @returns 예상 거리(km)
 */
export const calculateDistance = async (
  departureAddress: string,
  destinationAddress: string
): Promise<number> => {
  // 실제로는 지도 API를 호출하여 거리를 계산하겠지만,
  // 목업 데이터를 위해 간단한 랜덤 거리 생성
  
  // 예시로 주소 문자열 길이를 기반으로 약간의 변동성을 추가한 값을 반환
  const baseDistance = Math.min(
    departureAddress.length * 3 + destinationAddress.length * 2, 
    500
  );
  
  // 랜덤 요소 추가 (±20km)
  const randomFactor = Math.floor(Math.random() * 40) - 20;
  
  // 최소 거리는 10km로 설정
  return Math.max(10, baseDistance + randomFactor);
};

/**
 * 예상 금액을 계산합니다.
 * @param distance 예상 거리(km)
 * @param weightType 차량 중량 타입
 * @param selectedOptions 선택된 옵션 ID 배열
 * @returns 예상 금액(원)
 */
export const calculateAmount = async (
  distance: number,
  weightType: WeightType,
  selectedOptions: string[]
): Promise<number> => {
  // 중량별 기본 요금(km당)
  let baseRatePerKm = 0;
  
  // 차량 중량에 따른 기본 요금 설정
  switch (weightType) {
    case '1톤':
      baseRatePerKm = 1000;
      break;
    case '1.4톤':
      baseRatePerKm = 1200;
      break;
    case '2.5톤':
      baseRatePerKm = 1400;
      break;
    case '3.5톤':
      baseRatePerKm = 1600;
      break;
    case '5톤':
      baseRatePerKm = 1800;
      break;
    case '11톤':
      baseRatePerKm = 2200;
      break;
    case '25톤':
      baseRatePerKm = 2500;
      break;
    default:
      baseRatePerKm = 1000;
  }
  
  // 기본 금액 계산
  let amount = distance * baseRatePerKm;
  
  // 옵션에 따른 추가 금액 계산
  if (selectedOptions.includes('direct')) {
    // 이착 옵션: 10% 추가
    amount *= 1.1;
  }
  
  if (selectedOptions.includes('fast')) {
    // 빠른 배차 옵션: 15% 추가
    amount *= 1.15;
  }
  
  if (selectedOptions.includes('special')) {
    // 특수화물 옵션: 20% 추가
    amount *= 1.2;
  }
  
  if (selectedOptions.includes('forklift')) {
    // 지게차 하차 옵션: 5만원 추가
    amount += 50000;
  }
  
  // 최종 금액 반올림 (만원 단위로)
  return Math.round(amount / 10000) * 10000;
};

/**
 * 주소를 검색합니다.
 * @param keyword 검색 키워드
 * @returns 검색된 주소 목록
 */
export const searchAddress = async (
  keyword: string
): Promise<{ address: string; roadAddress: string; jibunAddress: string }[]> => {
  // 실제로는 주소 검색 API를 호출하겠지만,
  // 목업 데이터를 위해 간단한 주소 목록 생성
  
  // 키워드가 비어있는 경우
  if (!keyword || keyword.trim() === '') {
    return [];
  }
  
  // 목업 주소 데이터
  const mockAddresses = [
    {
      address: '서울특별시 강남구 테헤란로 152',
      roadAddress: '서울특별시 강남구 테헤란로 152 (역삼동)',
      jibunAddress: '서울특별시 강남구 역삼동 737'
    },
    {
      address: '서울특별시 강남구 테헤란로 129',
      roadAddress: '서울특별시 강남구 테헤란로 129 (역삼동)',
      jibunAddress: '서울특별시 강남구 역삼동 734-12'
    },
    {
      address: '서울특별시 송파구 올림픽로 300',
      roadAddress: '서울특별시 송파구 올림픽로 300 (신천동)',
      jibunAddress: '서울특별시 송파구 신천동 29'
    },
    {
      address: '경기도 성남시 분당구 판교역로 235',
      roadAddress: '경기도 성남시 분당구 판교역로 235 (삼평동)',
      jibunAddress: '경기도 성남시 분당구 삼평동 682'
    },
    {
      address: '경기도 성남시 분당구 황새울로 360번길 42',
      roadAddress: '경기도 성남시 분당구 황새울로360번길 42 (서현동)',
      jibunAddress: '경기도 성남시 분당구 서현동 251-1'
    },
    {
      address: '인천광역시 연수구 센트럴로 350',
      roadAddress: '인천광역시 연수구 센트럴로 350 (송도동)',
      jibunAddress: '인천광역시 연수구 송도동 168-1'
    },
    {
      address: '부산광역시 해운대구 센텀중앙로 48',
      roadAddress: '부산광역시 해운대구 센텀중앙로 48 (우동)',
      jibunAddress: '부산광역시 해운대구 우동 1496'
    }
  ];
  
  // 키워드로 필터링
  return mockAddresses.filter(item => 
    item.address.includes(keyword) || 
    item.roadAddress.includes(keyword) || 
    item.jibunAddress.includes(keyword)
  );
};

// 최근 등록된 주소 목록
export const RECENT_LOCATIONS: ILocationInfo[] = [
  {
    id: "LOC1",
    address: "서울특별시 강남구 테헤란로 152",
    roadAddress: "서울특별시 강남구 테헤란로 152 (역삼동)",
    jibunAddress: "서울특별시 강남구 역삼동 737",
    latitude: 37.5012,
    longitude: 127.0396,
    detailedAddress: "강남파이낸스센터 12층",
    name: "강남 물류센터",
    company: "화물맨 로지스틱스",
    contact: "02-1234-5678",
    date: "2024-02-15",
    time: "14:00",
    createdAt: "2024-02-15T05:00:00.000Z"
  },
  {
    id: "LOC2",
    address: "경기도 성남시 분당구 판교로 242",
    roadAddress: "경기도 성남시 분당구 판교로 242 (삼평동)",
    jibunAddress: "경기도 성남시 분당구 삼평동 625",
    latitude: 37.4021,
    longitude: 127.1087,
    detailedAddress: "판교제2테크노밸리 3층",
    name: "판교 물류센터",
    company: "더유",
    contact: "031-789-1234",
    date: "2024-02-15",
    time: "15:30",
    createdAt: "2024-02-15T06:30:00.000Z"
  },
  {
    id: "LOC3",
    address: "인천광역시 연수구 송도과학로 32",
    roadAddress: "인천광역시 연수구 송도과학로 32 (송도동)",
    jibunAddress: "인천광역시 연수구 송도동 11-1",
    latitude: 37.3812,
    longitude: 126.6562,
    detailedAddress: "송도지식산업센터 5층",
    name: "송도 물류센터",
    company: "코로코",
    contact: "032-456-7890",
    date: "2024-02-15",
    time: "16:45",
    createdAt: "2024-02-15T07:45:00.000Z"
  },
  {
    id: "LOC4",
    address: "경기도 성남시 분당구 판교로 24",
    roadAddress: "경기도 성남시 분당구 판교로 241 (삼평동)",
    jibunAddress: "경기도 성남시 분당구 삼평동 624",
    latitude: 37.4021,
    longitude: 127.1087,
    detailedAddress: "판교제2테크노밸리 1층",
    name: "삼평 물류센터",
    company: "바요",
    contact: "031-789-1234",
    date: "2024-02-15",
    time: "16:45",
    createdAt: "2024-02-15T07:45:00.000Z"
  }
];

export const MOCK_RECENT_LOCATIONS_ADDRESS: IAddress[] = [
  {
    id: uuidv4(),
    name: "강남 물류센터",
    type: "load",
    roadAddress: "서울특별시 강남구 테헤란로 152 (역삼동)",
    jibunAddress: "서울특별시 강남구 역삼동 737",
    detailAddress: "강남파이낸스센터 12층",
    postalCode: "12345",
    metadata: {
      lat: 37.5012,
      lng: 127.0396
    },
    contactName: "화물맨 로지스틱스",
    contactPhone: "02-1234-5678",
    memo: "최근 사용 주소",
    isFrequent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: uuidv4(),
    name: "판교 물류센터",
    type: "load",
    roadAddress: "경기도 성남시 분당구 판교로 242 (삼평동)",
    jibunAddress: "경기도 성남시 분당구 삼평동 625",
    detailAddress: "판교제2테크노밸리 3층",
    postalCode: "12345",
    metadata: {
      lat: 37.4021,
      lng: 127.1087
    },  
    contactName: "더유",
    contactPhone: "031-789-1234",
    memo: "최근 사용 주소",
    isFrequent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: uuidv4(),
    name: "송도 물류센터",
    type: "load",
    roadAddress: "인천광역시 연수구 송도과학로 32 (송도동)",
    jibunAddress: "인천광역시 연수구 송도동 11-1",
    detailAddress: "송도지식산업센터 5층",
    postalCode: "12345",
    metadata: {
      lat: 37.3812,
      lng: 126.6562
    },  
    contactName: "코로코",
    contactPhone: "032-456-7890",
    memo: "최근 사용 주소",
    isFrequent: false,
    createdAt: new Date(),
    updatedAt: new Date(),  
    createdBy: "admin",
    updatedBy: "admin"
  }

];

// 화물 등록 함수
export const registerOrder = async (orderData: any) => {
  // 실제로는 API를 호출하여 화물을 등록하겠지만,
  // 목업 데이터를 위해 간단한 응답 생성
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    orderId: `ORD${Date.now()}`,
    message: "화물이 성공적으로 등록되었습니다.",
  };
}; 