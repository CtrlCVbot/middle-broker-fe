import { IAddress, AddressType, ILegacyAddress } from "@/types/address";
import { IUser } from "@/types/user";

// 주소록 모킹 데이터
export const mockAddresses: IAddress[] = [
  {
    id: "1",
    name: "남산롯데캐슬",
    roadAddress: "서울 중구 회현동1가 208",
    jibunAddress: "서울 중구 회현동1가 208",
    detailAddress: "102-701",
    postalCode: "04637",
    contactName: "유일",
    contactPhone: "010-7491-2425",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "서울 중구 회현동1가 208 남산롯데캐슬 102-701",
      source: "KAKAO",
      lat: 37.557527,
      lng: 126.977089,
      buildingName: "남산롯데캐슬",
      floor: "7",
      tags: ["아파트", "주거지역"]
    }
  },
  {
    id: "2",
    name: "강남스테이션",
    roadAddress: "서울 강남구 역삼동 858",
    jibunAddress: "서울 강남구 역삼동 858",
    detailAddress: "201호",
    postalCode: "06236",
    contactName: "김강남",
    contactPhone: "010-3456-7890",
    type: "drop" as AddressType,
    isFrequent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "서울 강남구 역삼동 858 강남스테이션 201호",
      source: "KAKAO",
      lat: 37.500627,
      lng: 127.036377,
      buildingName: "강남스테이션",
      floor: "2",
      tags: ["오피스", "상업지역"]
    }
  },
  {
    id: "3",
    name: "부산항만창고",
    roadAddress: "부산 영도구 해양로 45",
    jibunAddress: "부산 영도구 해양로 45",
    detailAddress: "창고동 A-12",
    postalCode: "04505",
    contactName: "박부산",
    contactPhone: "010-2345-6789",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "부산 영도구 해양로 45 부산항만창고 창고동 A-12",
      source: "KAKAO",
      lat: 35.100627,
      lng: 129.036377,
      buildingName: "부산항만창고",
      floor: "12",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "4",
    name: "인천물류센터",
    roadAddress: "인천 서구 경서동 680-1",
    jibunAddress: "인천 서구 경서동 680-1",
    detailAddress: "제2터미널",
    postalCode: "22005",
    contactName: "이인천",
    contactPhone: "010-9876-5432",
    type: "drop" as AddressType,
    isFrequent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "인천 서구 경서동 680-1 인천물류센터 제2터미널",
      source: "KAKAO",
      lat: 37.450627,
      lng: 126.700377,
      buildingName: "인천물류센터",
      floor: "2",
      tags: ["물류", "창고"]
    }
  },
  {
    id: "5",
    name: "대전 중앙창고",
    roadAddress: "대전 유성구 대학로 99",
    jibunAddress: "대전 유성구 대학로 99",
    detailAddress: "과학단지 C동",
    contactName: "최대전",
    contactPhone: "010-4567-8901",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "대전 유성구 대학로 99 대전 중앙창고 과학단지 C동",
      source: "KAKAO",
      lat: 36.350627,
      lng: 127.360377,
      buildingName: "대전 중앙창고",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "6",
    name: "광주 운송센터",
    roadAddress: "광주 광산구 무진대로 251",
    jibunAddress: "광주 광산구 무진대로 251",
    detailAddress: "물류파크 2층",
    postalCode: "54005",
    contactName: "정광주",
    contactPhone: "010-5678-9012",
    type: "drop" as AddressType,
    isFrequent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "광주 광산구 무진대로 251 광주 운송센터 물류파크 2층",
      source: "KAKAO",
      lat: 35.150627,
      lng: 126.860377,
      buildingName: "광주 운송센터",
      floor: "2",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "7",
    name: "울산항 물류시설",
    roadAddress: "울산 남구 산업로 304",
    jibunAddress: "울산 남구 산업로 304",
    detailAddress: "항만단지 B블록",
    postalCode: "67005",
    contactName: "강울산",
    contactPhone: "010-6789-0123",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "울산 남구 산업로 304 울산항 물류시설 항만단지 B블록",
      source: "KAKAO",
      lat: 35.550627,
      lng: 129.360377,
      buildingName: "울산항 물류시설",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "8",
    name: "제주 도심물류",
    roadAddress: "제주 제주시 연동 263-15",
    jibunAddress: "제주 제주시 연동 263-15",
    detailAddress: "제주빌딩 1층",
    postalCode: "63005",
    contactName: "한제주",
    contactPhone: "010-7890-1234",
    type: "drop" as AddressType,
    isFrequent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "제주 제주시 연동 263-15 제주 도심물류 제주빌딩 1층",
      source: "KAKAO",
      lat: 33.450627,
      lng: 126.560377,
      buildingName: "제주 도심물류",
      floor: "1",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "9",
    name: "수원 신갈창고",
    roadAddress: "경기 수원시 영통구 신원로 88",
    jibunAddress: "경기 수원시 영통구 신원로 88",
    detailAddress: "지하 1층",
    postalCode: "16405",
    contactName: "서수원",
    contactPhone: "010-8901-2345",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "경기 수원시 영통구 신원로 88 수원 신갈창고 지하 1층",
      source: "KAKAO",
      lat: 37.250627,
      lng: 126.960377,
      buildingName: "수원 신갈창고",
      floor: "1",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "10",
    name: "평택항 국제물류",
    roadAddress: "경기 평택시 포승읍 평택항로 98",
    jibunAddress: "경기 평택시 포승읍 평택항로 98",
    detailAddress: "국제터미널",
    postalCode: "18105",
    contactName: "임평택",
    contactPhone: "010-9012-3456",
    type: "drop" as AddressType,
    isFrequent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "경기 평택시 포승읍 평택항로 98 평택항 국제물류 국제터미널",
      source: "KAKAO",
      lat: 37.050627,
      lng: 126.860377,
      buildingName: "평택항 국제물류",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "11",
    name: "대전 중앙창고",
    roadAddress: "대전 유성구 대학로 99",
    jibunAddress: "대전 유성구 대학로 99",
    detailAddress: "과학단지 C동",
    postalCode: "34141",
    contactName: "최대전",
    contactPhone: "010-4567-8901",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "대전 유성구 대학로 99 대전 중앙창고 과학단지 C동",
      source: "KAKAO",
      lat: 36.350627,
      lng: 127.360377,
      buildingName: "대전 중앙창고",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "12",
    name: "대전 중앙창고",
    roadAddress: "대전 유성구 대학로 99",
    jibunAddress: "대전 유성구 대학로 99",
    detailAddress: "과학단지 C동",
    postalCode: "34141",
    contactName: "최대전",
    contactPhone: "010-4567-8901",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "대전 유성구 대학로 99 대전 중앙창고 과학단지 C동",
      source: "KAKAO",
      lat: 36.350627,
      lng: 127.360377,
      buildingName: "대전 중앙창고",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "13",
    name: "대전 중앙창고",
    roadAddress: "대전 유성구 대학로 99",
    jibunAddress: "대전 유성구 대학로 99",
    detailAddress: "과학단지 C동",
    postalCode: "34141",
    contactName: "최대전",
    contactPhone: "010-4567-8901",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "대전 유성구 대학로 99 대전 중앙창고 과학단지 C동",
      source: "KAKAO",
      lat: 36.350627,
      lng: 127.360377,
      buildingName: "대전 중앙창고",
      floor: "10",
      tags: ["창고", "물류"]
    }
  },
  {
    id: "14",
    name: "대전 중앙창고",      
    roadAddress: "대전 유성구 대학로 99",
    jibunAddress: "대전 유성구 대학로 99",
    detailAddress: "과학단지 C동",
    postalCode: "34141",
    contactName: "최대전",
    contactPhone: "010-4567-8901",
    type: "load" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: "대전 유성구 대학로 99 대전 중앙창고 과학단지 C동",
      source: "KAKAO",
      lat: 36.350627,
      lng: 127.360377,
      buildingName: "대전 중앙창고",
      floor: "10",
      tags: ["창고", "물류"]
    }
  }
];

// 목업 사용자 데이터
export const mockUsers: IUser[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "user@example.com",
    password: "password123",
    name: "일반 사용자",
    phone_number: "010-1234-5678",
    company_id: "c550e840-e29b-41d4-a716-446655440000",
    system_access_level: "shipper_member",
    domains: ["logistics"],
    status: "active",
    department: "일반부서",
    position: "사원",
    rank: "사원",
    created_by: "system",
    updated_by: "system",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@example.com",
    password: "admin123",
    name: "관리자",
    phone_number: "010-9876-5432",
    company_id: "c550e840-e29b-41d4-a716-446655440000",
    system_access_level: "platform_admin",
    domains: ["logistics", "settlement"],
    status: "active",
    department: "관리부서",
    position: "관리자",
    rank: "관리자",
    created_by: "system",
    updated_by: "system",
    created_at: new Date(),
    updated_at: new Date()
  }
];

// 페이지별 데이터 조회 함수
export const getAddressesByPage = (page: number, limit: number, search?: string, type?: string) => {
  let filteredData = [...mockAddresses];
  
  // 검색어가 있는 경우 필터링
  if (search) {
    const searchTerm = search.toLowerCase();
    console.log("검색어", searchTerm);
    filteredData = filteredData.filter(
      (address) =>
        address.name.toLowerCase().includes(searchTerm) ||
        address.roadAddress.toLowerCase().includes(searchTerm) ||
        address.jibunAddress.toLowerCase().includes(searchTerm) ||
        address.detailAddress?.toLowerCase().includes(searchTerm) ||
        address.postalCode?.includes(searchTerm) ||
        address.contactName?.toLowerCase().includes(searchTerm) ||
        address.contactPhone?.includes(searchTerm)
    );
  }
  
  // 유형 필터링
  if (type) {
    filteredData = filteredData.filter((address) => address.type === type);
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

// 레거시 주소를 새로운 형식으로 변환하는 함수
const convertLegacyToNewAddress = (legacy: ILegacyAddress): IAddress => {
  return {
    id: legacy.id.toString(),
    name: legacy.name,
    roadAddress: legacy.address,
    jibunAddress: legacy.address,
    detailAddress: legacy.detailedAddress,
    contactName: legacy.manager,
    contactPhone: legacy.contact,
    type: legacy.type === "상차지" ? "load" : "drop" as AddressType,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      originalInput: `${legacy.address} ${legacy.detailedAddress}`,
      source: "LEGACY"
    }
  };
};

// 주소 추가 함수
export const addAddress = (address: Omit<IAddress, "id" | "createdAt" | "updatedAt" | "isFrequent">) => {
  // 새 ID 생성 (기존 ID 중 가장 큰 값 + 1)
  const newId = (mockAddresses.length > 0 
    ? Math.max(...mockAddresses.map(addr => parseInt(addr.id))) + 1 
    : 1).toString();
    
  // 새 주소 객체 생성
  const newAddress: IAddress = {
    id: newId,
    ...address,
    isFrequent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 목록에 추가
  mockAddresses.push(newAddress);
  
  return newAddress;
};

// 주소 수정 함수
export const updateAddress = (id: string, addressData: Omit<IAddress, "id">) => {
  const index = mockAddresses.findIndex(address => address.id === id);
  
  if (index === -1) {
    throw new Error(`ID ${id}에 해당하는 주소를 찾을 수 없습니다.`);
  }
  
  // 해당 ID의 주소 업데이트
  mockAddresses[index] = {
    id,
    ...addressData
  };
  
  return mockAddresses[index];
};

// 주소 삭제 함수
export const deleteAddress = (id: string) => {
  const index = mockAddresses.findIndex(address => address.id === id);
  
  if (index === -1) {
    throw new Error(`ID ${id}에 해당하는 주소를 찾을 수 없습니다.`);
  }
  
  // 해당 ID의 주소 삭제
  mockAddresses.splice(index, 1);
  
  return id;
};