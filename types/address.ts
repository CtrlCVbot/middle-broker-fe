export type AddressType = 'load' | 'drop' | 'any';

export interface IAddress {
  id: string;
  name: string;           // 장소명
  type: AddressType;      // 상/하차지 구분
  
  roadAddress: string;     // 도로명 주소
  jibunAddress: string;    // 지번 주소
  detailAddress: string | null;  // 상세 주소
  postalCode: string | null;     // 우편번호
  
  metadata?: {
    originalInput?: string;     // 사용자가 직접 입력한 전체 주소
    source?: string;           // 주소가 어디서 왔는지 출처 보존 (카카오, 공공API 등)
    lat?: number;
    lng?: number;
    buildingName?: string;
    floor?: string;
    tags?: string[];          // 자유 태그, 건물명 등 비정형 데이터 저장 가능
  };

  contactName: string | null;    // 담당자명
  contactPhone: string | null;   // 전화번호

  memo: string | null;          // 메모
  isFrequent: boolean;    // 자주 쓰는 주소
  createdAt: Date;      // 등록일
  updatedAt: Date;      // 수정일
  
  createdBy: string | null;     // 등록자
  updatedBy: string | null;     // 수정자
}

// 배치 처리 요청 인터페이스
export interface IAddressBatchRequest {
  addressIds: string[];
  action: 'delete' | 'setFrequent' | 'unsetFrequent';
}

// 배치 처리 응답 인터페이스
export interface IAddressBatchResponse {
  success: boolean;
  processed: string[];
  failed: string[];
  errors?: { id: string; error: string }[];
}

// 주소 변경 이력 인터페이스
export interface IAddressChangeLog {
  id: string;
  addressId: string;
  userId?: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel?: string;
  changeType: 'create' | 'update' | 'delete';
  changes: string;
  reason?: string;
  createdAt: Date;
}

export interface IAddressResponse {
  data: IAddress[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface IAddressSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AddressType;
}

// 레거시 주소를 새로운 형식으로 변환하는 유틸리티 타입
export type LegacyToNewAddress = (legacy: ILegacyAddress) => Omit<IAddress, 'createdAt' | 'updatedAt' | 'isFrequent'>;

// 기존 코드와의 호환성을 위한 타입
export interface ILegacyAddress {
  id: number;
  name: string;
  address: string;
  detailedAddress: string;
  contact: string;
  manager: string;
  type: string;
}

// 카카오 주소 검색 결과 인터페이스
export interface IKakaoAddressResult {
  place_name: string;
  distance: string;
  place_url: string;
  category_name: string;
  address_name: string;
  road_address_name?: string;
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
  };
  address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    zip_code: string;
  };
  id: string;
  phone: string;
  category_group_code: string;
  category_group_name: string;
  x: string;
  y: string;
}