import { IAddress } from "@/types/address";
import { IUser } from "@/types/user";

// 주소록 모킹 데이터
export const mockAddresses: IAddress[] = [
  {
    id: 1,
    name: "남산롯데캐슬",
    address: "서울 중구 회현동1가 208",
    detailedAddress: "102-701",
    contact: "010-7491-2425",
    manager: "유일",
    type: "상차지"
  },
  {
    id: 2,
    name: "강남스테이션",
    address: "서울 강남구 역삼동 858",
    detailedAddress: "201호",
    contact: "010-3456-7890",
    manager: "김강남",
    type: "하차지"
  },
  {
    id: 3,
    name: "부산항만창고",
    address: "부산 영도구 해양로 45",
    detailedAddress: "창고동 A-12",
    contact: "010-2345-6789",
    manager: "박부산",
    type: "상차지"
  },
  {
    id: 4,
    name: "인천물류센터",
    address: "인천 서구 경서동 680-1",
    detailedAddress: "제2터미널",
    contact: "010-9876-5432",
    manager: "이인천",
    type: "하차지"
  },
  {
    id: 5,
    name: "대전 중앙창고",
    address: "대전 유성구 대학로 99",
    detailedAddress: "과학단지 C동",
    contact: "010-4567-8901",
    manager: "최대전",
    type: "상차지"
  },
  {
    id: 6,
    name: "광주 운송센터",
    address: "광주 광산구 무진대로 251",
    detailedAddress: "물류파크 2층",
    contact: "010-5678-9012",
    manager: "정광주",
    type: "하차지"
  },
  {
    id: 7,
    name: "울산항 물류시설",
    address: "울산 남구 산업로 304",
    detailedAddress: "항만단지 B블록",
    contact: "010-6789-0123",
    manager: "강울산",
    type: "상차지"
  },
  {
    id: 8,
    name: "제주 도심물류",
    address: "제주 제주시 연동 263-15",
    detailedAddress: "제주빌딩 1층",
    contact: "010-7890-1234",
    manager: "한제주",
    type: "하차지"
  },
  {
    id: 9,
    name: "수원 신갈창고",
    address: "경기 수원시 영통구 신원로 88",
    detailedAddress: "지하 1층",
    contact: "010-8901-2345",
    manager: "서수원",
    type: "상차지"
  },
  {
    id: 10,
    name: "평택항 국제물류",
    address: "경기 평택시 포승읍 평택항로 98",
    detailedAddress: "국제터미널",
    contact: "010-9012-3456",
    manager: "임평택",
    type: "하차지"
  },
  {
    id: 11,
    name: "대전 중앙창고",
    address: "대전 유성구 대학로 99",
    detailedAddress: "과학단지 C동",
    contact: "010-4567-8901",
    manager: "최대전",
    type: "상차지"
  },
  {
    id: 12,
    name: "대전 중앙창고",
    address: "대전 유성구 대학로 99",
    detailedAddress: "과학단지 C동",
    contact: "010-4567-8901",
    manager: "최대전",
    type: "상차지"
  },
  {
    id: 13,
    name: "대전 중앙창고",
    address: "대전 유성구 대학로 99",
    detailedAddress: "과학단지 C동",
    contact: "010-4567-8901",
    manager: "최대전",
    type: "상차지"
  },
  {
    id: 14,
    name: "대전 중앙창고",      
    address: "대전 유성구 대학로 99",
    detailedAddress: "과학단지 C동",
    contact: "010-4567-8901",
    manager: "최대전",
    type: "상차지"
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
        address.address.toLowerCase().includes(searchTerm) ||
        address.manager.toLowerCase().includes(searchTerm) ||
        address.contact.includes(searchTerm)
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

// 주소 추가 함수
export const addAddress = (address: Omit<IAddress, "id">) => {
  // 새 ID 생성 (기존 ID 중 가장 큰 값 + 1)
  const newId = mockAddresses.length > 0 
    ? Math.max(...mockAddresses.map(addr => addr.id)) + 1 
    : 1;
    
  // 새 주소 객체 생성
  const newAddress: IAddress = {
    id: newId,
    ...address
  };
  
  // 목록에 추가
  mockAddresses.push(newAddress);
  
  return newAddress;
};

// 주소 수정 함수
export const updateAddress = (id: number, addressData: Omit<IAddress, "id">) => {
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
export const deleteAddress = (id: number) => {
  const index = mockAddresses.findIndex(address => address.id === id);
  
  if (index === -1) {
    throw new Error(`ID ${id}에 해당하는 주소를 찾을 수 없습니다.`);
  }
  
  // 해당 ID의 주소 삭제
  mockAddresses.splice(index, 1);
  
  return id;
};