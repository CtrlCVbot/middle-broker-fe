import { IBrokerDriver, DriverStatus, VehicleType, TonnageType, PermissionType, ICargoBox, IDriverAccount, IDriverNote } from "@/types/broker-driver";
import { IAddressSnapshot } from "@/types/order-ver01";

/**
 * 프론트엔드 차주 폼 데이터를 API 요청 형식으로 변환
 * @param formData 프론트엔드 폼 데이터
 * @returns API 요청 데이터
 */
export function mapDriverFormToApiRequest(formData: any): any {
  // broker-driver-register-sheet.tsx의 폼 구조 분석
  // 기본 정보, 차량 정보, 계정 정보, 특이사항으로 구분됨
  
  // 주소 스냅샷 생성
  const addressSnapshot: IAddressSnapshot = {
    roadAddress: formData.basicInfo.address || ''
  }as any;
  
  // API 요청 형식으로 변환
  return {
    name: formData.basicInfo.name,
    phoneNumber: formData.basicInfo.phone,
    vehicleNumber: formData.vehicleInfo.vehicleNumber,
    vehicleType: formData.vehicleInfo.vehicleType as VehicleType,
    vehicleWeight: formData.vehicleInfo.tonnage as any, // tonnage → vehicleWeight로 매핑
    address: {
      roadAddress: formData.basicInfo.address || '',
      postalCode: '',
      detailAddress: '',
      sido: '',
      sigungu: '',
      bname: '',
      roadname: ''
    },
    companyType: '개인', // 기본값
    businessNumber: formData.basicInfo.businessNumber || '',
    manufactureYear: formData.vehicleInfo.manufactureYear || '',
    isActive: formData.basicInfo.status === '활성',
    inactiveReason: formData.basicInfo.status === '비활성' ? '사용자에 의한 비활성화' : '',
  };
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