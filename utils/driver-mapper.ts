import { IBrokerDriver, DriverStatus, VehicleType, TonnageType, PermissionType, ICargoBox, IDriverAccount, IDriverNote } from "@/types/broker-driver";
import { IAddressSnapshot } from "@/types/order";

/**
 * 프론트엔드 차주 폼 데이터를 API 요청 형식으로 변환
 * @param formData 프론트엔드 폼 데이터
 * @returns API 요청 데이터
 */
export function mapDriverFormToApiRequest(formData: any): any {
  console.log('mapDriverFormToApiRequest 호출됨 - 입력 폼 데이터:', formData);
  
  // 주소 정보 추출 및 가공
  const address = formData.address || '';
  console.log('추출된 주소 정보:', address);
  
  // API 요청에 필요한 주소 객체 생성
  const addressObject = {
    roadAddress: address,
    //postalCode: '00000', // 임시값
    detailAddress: '',
    //sido: '서울특별시', // 임시값, 실제로는 주소 파싱 필요
    //sigungu: '강남구', // 임시값, 실제로는 주소 파싱 필요
    //bname: '역삼동', // 임시값, 실제로는 주소 파싱 필요
    //roadname: '테헤란로', // 임시값, 실제로는 주소 파싱 필요
    //jibunAddress: address // 일단 동일한 값 사용
  };
  console.log('생성된 주소 객체:', addressObject);
  
  // API 요청 형식으로 변환
  const requestData = {
    name: formData.name,
    phoneNumber: formData.phoneNumber,
    vehicleNumber: formData.vehicleNumber,
    vehicleType: formData.vehicleType,
    vehicleWeight: formData.tonnage, // tonnage → vehicleWeight로 매핑
    address: addressObject,
    companyType: '개인', // 기본값
    businessNumber: formData.businessNumber || '0000000000',
    manufactureYear: formData.manufactureYear || '',
    isActive: formData.status === '활성',
    inactiveReason: formData.status === '비활성' ? '사용자에 의한 비활성화' : '',
    // 은행 정보 추가
    bankCode: formData.bankCode || null,
    bankAccountNumber: formData.bankAccountNumber || null,
    bankAccountHolder: formData.bankAccountHolder || null,
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
  console.log('mapApiResponseToDriver 변환 전 원본 데이터:', apiResponse);
  
  // 응답 값이 null이거나 undefined인 경우 안전하게 처리
  if (!apiResponse) {
    console.warn('mapApiResponseToDriver에 유효하지 않은 응답 데이터가 전달되었습니다:', apiResponse);
    return {
      id: '',
      name: '',
      phoneNumber: '',
      vehicleNumber: '',
      vehicleType: '기타' as VehicleType,
      tonnage: '기타' as TonnageType,
      address: '',
      businessNumber: '',
      status: '비활성' as DriverStatus,
      bankCode: '',
      bankAccountNumber: '',
      bankAccountHolder: '',
    };
  }
  
  // 백엔드 응답 데이터 구조 분석 및 프론트엔드 데이터 구조로 변환
  const driver: IBrokerDriver = {
    id: apiResponse.id || '',
    code: apiResponse.code || `DR${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`, // 임시 코드 생성
    name: apiResponse.name || '',
    phoneNumber: apiResponse.phoneNumber || '',
    vehicleNumber: apiResponse.vehicleNumber || '',
    vehicleType: (apiResponse.vehicleType || '기타') as VehicleType,
    tonnage: (apiResponse.vehicleWeight || '기타') as TonnageType, // vehicleWeight → tonnage로 매핑
    address: getAddressFromSnapshot(apiResponse.address || apiResponse.addressSnapshot),
    businessNumber: apiResponse.businessNumber || '',
    dispatchCount: apiResponse.dispatchCount || 0, // API에서 제공되지 않는 경우 0으로 설정
    status: apiResponse.isActive ? '활성' : '비활성' as DriverStatus,
    createdAt: apiResponse.createdAt || '',
    lastDispatchedAt: apiResponse.lastDispatchedAt || null,
    lastSettlementStatus: apiResponse.lastSettlementStatus || '-' as '완료' | '미정산' | '-',
    unsettledAmount: apiResponse.unsettledAmount || 0,
    isActive: !!apiResponse.isActive, // boolean으로 명시적 변환
    inactiveReason: apiResponse.inactiveReason || '',
    
    // 은행 정보 추가
    bankCode: apiResponse.bankCode || '',
    bankAccountNumber: apiResponse.bankAccountNumber || '',
    bankAccountHolder: apiResponse.bankAccountHolder || '',
    
    // 추가 속성
    cargoBox: mapCargoBox(apiResponse),
    manufactureYear: apiResponse.manufactureYear || '',
    account: mapDriverAccount(apiResponse),
    notes: apiResponse.notes ? apiResponse.notes.map(mapApiResponseToNote) : undefined,
  };
  
  console.log('mapApiResponseToDriver 변환 후 데이터:', driver);
  return driver;
}

/**
 * 주소 스냅샷에서 주소 문자열 추출
 * @param addressSnapshot 주소 스냅샷 객체
 * @returns 주소 문자열
 */
function getAddressFromSnapshot(addressSnapshot: any): string {
  console.log('getAddressFromSnapshot 입력 값:', addressSnapshot);
  
  // null 또는 undefined인 경우
  if (!addressSnapshot) {
    return '';
  }
  
  // 문자열인 경우 직접 반환
  if (typeof addressSnapshot === 'string') {
    return addressSnapshot;
  }
  
  // JSON 문자열인 경우
  if (typeof addressSnapshot === 'string' && (addressSnapshot.startsWith('{') || addressSnapshot.startsWith('['))) {
    try {
      const parsedAddress = JSON.parse(addressSnapshot);
      if (parsedAddress.roadAddress) {
        return parsedAddress.roadAddress;
      } else if (parsedAddress.jibunAddress) {
        return parsedAddress.jibunAddress;
      }
    } catch (e) {
      console.warn('주소 JSON 파싱 실패:', e);
      return addressSnapshot;
    }
  }
  
  // 객체인 경우
  if (typeof addressSnapshot === 'object') {
    // 도로명 주소가 있는 경우 우선 사용
    if (addressSnapshot.roadAddress) {
      return addressSnapshot.roadAddress;
    }
    
    // 지번 주소가 있는 경우 사용
    if (addressSnapshot.jibunAddress) {
      return addressSnapshot.jibunAddress;
    }
    
    // 시도, 시군구, 상세주소 등이 있는 경우 조합
    const addressParts = [];
    
    if (addressSnapshot.sido) addressParts.push(addressSnapshot.sido);
    if (addressSnapshot.sigungu) addressParts.push(addressSnapshot.sigungu);
    if (addressSnapshot.bname) addressParts.push(addressSnapshot.bname);
    if (addressSnapshot.roadname) addressParts.push(addressSnapshot.roadname);
    if (addressSnapshot.detailAddress) addressParts.push(addressSnapshot.detailAddress);
    
    if (addressParts.length > 0) {
      return addressParts.join(' ');
    }
  }
  
  // 마지막 대안으로 JSON 형태로 변환
  try {
    return JSON.stringify(addressSnapshot);
  } catch (e) {
    console.warn('주소 정보 변환 실패:', e);
    return '주소 정보 없음';
  }
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

// --------------- 차주 특이사항 관련 매핑 함수 ---------------

/**
 * API 응답을 특이사항 객체로 변환
 * @param apiNote API 응답의 특이사항 데이터
 * @returns 프론트엔드 특이사항 객체
 */
export function mapApiResponseToNote(apiNote: any): IDriverNote {
  if (!apiNote) {
    return {
      id: '',
      content: '',
      date: new Date()
    };
  }
  
  return {
    id: apiNote.id || '',
    content: apiNote.content || '',
    date: apiNote.date ? new Date(apiNote.date) : new Date()
  };
}

/**
 * 특이사항 배열 API 응답을 프론트엔드 형식으로 변환
 * @param apiResponse API 응답 데이터
 * @returns 프론트엔드 특이사항 배열
 */
export function mapApiResponseToNotesList(apiResponse: any): IDriverNote[] {
  console.log('mapApiResponseToNotesList 입력 데이터:', JSON.stringify(apiResponse));
  
  // 응답이 없는 경우
  if (!apiResponse) {
    console.warn('mapApiResponseToNotesList: 응답 데이터가 없음');
    return [];
  }
  
  // 응답 구조 분석
  let notesData = apiResponse;
  
  // 데이터가 data 속성 내에 있는 경우 (표준 페이지네이션 응답)
  if (apiResponse.data && Array.isArray(apiResponse.data)) {
    console.log('표준 페이지네이션 응답 구조 감지: data 속성에서 배열 추출');
    notesData = apiResponse.data;
  } 
  // 응답이 이미 배열인 경우
  else if (Array.isArray(apiResponse)) {
    console.log('배열 형태의 응답 구조 감지');
    notesData = apiResponse;
  }
  // 응답이 배열이 아니거나 data 속성이 없는 경우
  else {
    console.warn('mapApiResponseToNotesList: 지원되지 않는 응답 형식', apiResponse);
    return [];
  }
  
  // 배열 항목 매핑
  const mappedNotes = notesData.map((item: any) => {
    const mappedNote = mapApiResponseToNote(item);
    console.log(`특이사항 항목 매핑: ${item.id} -> ${JSON.stringify(mappedNote)}`);
    return mappedNote;
  });
  
  console.log(`매핑 완료: ${mappedNotes.length}개 항목`);
  return mappedNotes;
}

/**
 * 프론트엔드 폼 특이사항 배열을 API 요청 형식으로 변환
 * @param notes 프론트엔드 특이사항 배열
 * @param driverId 차주 ID
 * @returns API 요청 데이터 배열
 */
export function mapNotesToApiRequests(notes: any[], driverId: string): any[] {
  if (!notes || !Array.isArray(notes)) {
    return [];
  }
  
  return notes.map(note => ({
    id: note.id, // 새로운 특이사항이면 백엔드에서 생성
    driverId,
    content: note.content,
    date: note.date instanceof Date ? note.date.toISOString() : new Date().toISOString()
  }));
}

/**
 * 프론트엔드 폼 특이사항을 API 요청 형식으로 변환
 * @param note 프론트엔드 특이사항
 * @param driverId 차주 ID
 * @returns API 요청 데이터
 */
export function mapNoteToApiRequest(note: any, driverId: string): any {
  return {
    driverId,
    content: note.content || '',
    date: note.date instanceof Date ? note.date.toISOString() : new Date().toISOString()
  };
}

/**
 * API 응답 데이터를 배차 정보 입력 폼의 차주 선택 컴포넌트에 적합한 형태로 변환
 * @param driver API 응답의 차주 데이터
 * @returns 배차 정보 입력 폼에 맞는 차주 데이터
 */
export function mapDriverForDispatchForm(driver: any): {
  id: string;
  name: string;
  contact: string;
  vehicle: {
    type: string;
    weight: string;
    licensePlate: string;
  }
} {
  if (!driver) {
    return {
      id: '',
      name: '',
      contact: '',
      vehicle: {
        type: '',
        weight: '',
        licensePlate: ''
      }
    };
  }
  
  return {
    id: driver.id || '',
    name: driver.name || '',
    contact: driver.phoneNumber || '',
    vehicle: {
      type: driver.vehicleType || '',
      weight: driver.vehicleWeight || driver.tonnage || '',
      licensePlate: driver.vehicleNumber || ''
    }
  };
}

/**
 * API 응답 데이터 배열을 배차 정보 입력 폼의 차주 선택 컴포넌트에 적합한 형태로 변환
 * @param drivers API 응답의 차주 데이터 배열
 * @returns 배차 정보 입력 폼에 맞는 차주 데이터 배열
 */
export function mapDriversForDispatchForm(drivers: any[]): Array<{
  id: string;
  name: string;
  contact: string;
  vehicle: {
    type: string;
    weight: string;
    licensePlate: string;
  }
}> {
  if (!Array.isArray(drivers)) {
    return [];
  }
  
  return drivers.map(driver => mapDriverForDispatchForm(driver));
} 