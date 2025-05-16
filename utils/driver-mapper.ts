import { IBrokerDriver, DriverStatus, VehicleType, TonnageType, PermissionType, ICargoBox, IDriverAccount, IDriverNote } from "@/types/broker-driver";
import { IAddressSnapshot } from "@/types/order-ver01";

/**
 * 프론트엔드 차주 폼 데이터를 API 요청 형식으로 변환
 * @param formData 프론트엔드 폼 데이터
 * @returns API 요청 데이터
 */
export function mapDriverFormToApiRequest(formData: any): any {
  console.log('mapDriverFormToApiRequest 호출됨 - 입력 폼 데이터:', formData);
  
  // 주소 정보 추출 및 가공
  const address = formData.basicInfo.address || '';
  console.log('추출된 주소 정보:', address);
  
  // API 요청에 필요한 주소 객체 생성
  const addressObject = {
    roadAddress: address,
    postalCode: '00000', // 임시값
    detailAddress: '',
    sido: '서울특별시', // 임시값, 실제로는 주소 파싱 필요
    sigungu: '강남구', // 임시값, 실제로는 주소 파싱 필요
    bname: '역삼동', // 임시값, 실제로는 주소 파싱 필요
    roadname: '테헤란로', // 임시값, 실제로는 주소 파싱 필요
    jibunAddress: address // 일단 동일한 값 사용
  };
  console.log('생성된 주소 객체:', addressObject);
  
  // API 요청 형식으로 변환
  const requestData = {
    name: formData.basicInfo.name,
    phoneNumber: formData.basicInfo.phone,
    vehicleNumber: formData.vehicleInfo.vehicleNumber,
    vehicleType: formData.vehicleInfo.vehicleType,
    vehicleWeight: formData.vehicleInfo.tonnage, // tonnage → vehicleWeight로 매핑
    address: addressObject,
    companyType: '개인', // 기본값
    businessNumber: formData.basicInfo.businessNumber || '0000000000',
    manufactureYear: formData.vehicleInfo.manufactureYear || '',
    isActive: formData.basicInfo.status === '활성',
    inactiveReason: formData.basicInfo.status === '비활성' ? '사용자에 의한 비활성화' : '',
  };
  
  console.log('생성된 API 요청 데이터:', requestData);
  return requestData;
}

/**
 * API 응답 데이터를 프론트엔드 차주 객체로 변환
 * @param apiResponse API 응답 데이터
 * @returns 프론트엔드 차주 객체
 */
export function mapApiResponseToDriver(apiResponse: any): IBrokerDriver {
  // 백엔드 응답 데이터 구조 분석 및 프론트엔드 데이터 구조로 변환
  const driver: IBrokerDriver = {
    id: apiResponse.id,
    name: apiResponse.name,
    phoneNumber: apiResponse.phoneNumber,
    vehicleNumber: apiResponse.vehicleNumber,
    vehicleType: apiResponse.vehicleType as VehicleType,
    tonnage: apiResponse.vehicleWeight as TonnageType, // vehicleWeight → tonnage로 매핑
    address: getAddressFromSnapshot(apiResponse.address),
    businessNumber: apiResponse.businessNumber,
    status: apiResponse.isActive ? '활성' : '비활성' as DriverStatus,
    createdAt: apiResponse.createdAt,
    lastDispatchedAt: apiResponse.lastDispatchedAt,
    isActive: apiResponse.isActive,
    inactiveReason: apiResponse.inactiveReason,
    
    // 추가 속성
    cargoBox: mapCargoBox(apiResponse),
    manufactureYear: apiResponse.manufactureYear,
    account: mapDriverAccount(apiResponse),
  };
  
  return driver;
}

/**
 * 주소 스냅샷에서 주소 문자열 추출
 * @param addressSnapshot 주소 스냅샷 객체
 * @returns 주소 문자열
 */
function getAddressFromSnapshot(addressSnapshot: IAddressSnapshot | any): string {
  if (!addressSnapshot) return '';
  
  if (typeof addressSnapshot === 'string') {
    return addressSnapshot;
  }
  
  // 주소 스냅샷에서 도로명 주소 추출
  return addressSnapshot.roadAddress || '';
}

/**
 * 화물함 정보 매핑
 * @param apiResponse API 응답 데이터
 * @returns 화물함 정보
 */
function mapCargoBox(apiResponse: any): ICargoBox | undefined {
  // 현재 API 응답에는 화물함 정보가 별도로 없으므로 차량 정보에서 추출
  // 실제 API에 따라 수정 필요
  return {
    type: '',
    length: ''
  };
}

/**
 * 차주 계정 정보 매핑
 * @param apiResponse API 응답 데이터
 * @returns 차주 계정 정보
 */
function mapDriverAccount(apiResponse: any): IDriverAccount | undefined {
  // 현재 API 응답에는 계정 정보가 별도로 없을 수 있음
  // 실제 API에 따라 수정 필요
  return {
    id: apiResponse.id,
    email: '',
    permission: '일반' as PermissionType
  };
}

/**
 * 차주 목록 응답을 프론트엔드 형식으로 변환
 * @param apiResponse API 응답 데이터
 * @returns 프론트엔드 차주 목록 데이터
 */
export function mapApiResponseToDriverList(apiResponse: any): {
  data: IBrokerDriver[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
} {
  // 페이지네이션 정보 추출
  const pagination = {
    total: apiResponse.total || 0,
    page: apiResponse.page || 1,
    pageSize: apiResponse.pageSize || 10,
    totalPages: apiResponse.totalPages || 1
  };
  
  // 차주 데이터 매핑
  const data = Array.isArray(apiResponse.data)
    ? apiResponse.data.map(mapApiResponseToDriver)
    : [];
  
  return {
    data,
    pagination
  };
} 