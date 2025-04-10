export type AddressType = 'load' | 'drop' | 'any';

export interface IAddress {
  id: string;
  name: string;           // 장소명
  type: AddressType;      // 상/하차지 구분
  
  roadAddress: string;     // 도로명 주소
  jibunAddress: string;    // 지번 주소
  detailAddress?: string;  // 상세 주소
  postalCode?: string;     // 우편번호
  
  metadata?: {
    originalInput?: string;     // 사용자가 직접 입력한 전체 주소
    source?: string;           // 주소가 어디서 왔는지 출처 보존 (카카오, 공공API 등)
    lat?: number;
    lng?: number;
    buildingName?: string;
    floor?: string;
    tags?: string[];          // 자유 태그, 건물명 등 비정형 데이터 저장 가능
  };

  contactName?: string;    // 담당자명
  contactPhone?: string;   // 전화번호

  memo?: string;          // 메모
  isFrequent: boolean;    // 자주 쓰는 주소
  createdAt: string;      // 등록일
  updatedAt: string;      // 수정일
  
  createdBy?: string;     // 등록자
  updatedBy?: string;     // 수정자
}

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

// 주소 변경 이력 인터페이스
export interface IAddressChangeLog {
  id: string;
  user_id: string;
  changed_by: string;
  changed_by_name: string;
  changed_by_email: string;
  changed_by_access_level?: string;
  change_type: string;
  diff: Record<string, [string, string]>;
  reason?: string;
  created_at: Date;
}

export interface IAddressResponse {
  data: IAddress[];
  pagination: IPagination;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
}

export interface IAddressSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AddressType;
}

// 레거시 주소를 새로운 형식으로 변환하는 유틸리티 타입
export type LegacyToNewAddress = (legacy: ILegacyAddress) => Omit<IAddress, 'createdAt' | 'updatedAt' | 'isFrequent'>;