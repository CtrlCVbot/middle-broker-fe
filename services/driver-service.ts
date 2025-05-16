import { IBrokerDriver } from "@/types/broker-driver";
import { mapDriverFormToApiRequest, mapApiResponseToDriver } from "@/utils/driver-mapper";
import { getAuthHeaders } from "@/utils/auth-header";

const API_BASE_URL = '/api/drivers';

/**
 * 차주 목록 조회
 * @param params 검색 매개변수
 * @returns 차주 목록 및 페이지네이션 정보
 */
export const getDrivers = async (params: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  vehicleType?: string;
  vehicleWeight?: string;
  isActive?: boolean;
  companyType?: string;
  startDate?: string;
  endDate?: string;
  tonnage?: string;
  status?: string;
  dispatchCount?: string;
}) => {
  console.log('getDrivers 호출됨: params', params);
  
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  
  // vehicleType 처리
  if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
  
  // tonnage → vehicleWeight 변환 처리
  if (params.tonnage) {
    queryParams.append('vehicleWeight', params.tonnage);
  } else if (params.vehicleWeight) {
    queryParams.append('vehicleWeight', params.vehicleWeight);
  }
  
  // isActive 처리 (status → isActive 변환)
  if (params.status) {
    const isActive = params.status === '활성';
    queryParams.append('isActive', isActive.toString());
  } else if (params.isActive !== undefined) {
    queryParams.append('isActive', params.isActive.toString());
  }
  
  if (params.companyType) queryParams.append('companyType', params.companyType);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  console.log('API 요청 URL:', `${API_BASE_URL}?${queryParams.toString()}`);
  
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      headers: getAuthHeaders()
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '차주 목록 조회 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    // 응답 데이터 매핑
    const result = {
      data: Array.isArray(data.data) ? data.data.map((item: any) => mapApiResponseToDriver(item)) : [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 1
    };
    
    console.log('매핑된 응답 데이터:', result);
    return result;
  } catch (error) {
    console.error('차주 목록 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 상세 조회
 * @param id 차주 ID
 * @returns 차주 상세 정보
 */
export const getDriverById = async (id: string): Promise<IBrokerDriver> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 상세 정보 조회 중 오류가 발생했습니다.');
  }
  
  const data = await response.json();
  
  // 응답 데이터 매핑
  return mapApiResponseToDriver(data);
};

/**
 * 차주 등록
 * @param driverData 차주 등록 데이터
 * @returns 등록된 차주 정보
 */
export const registerDriver = async (driverData: any): Promise<IBrokerDriver> => {
  // 프론트엔드 폼 데이터를 API 요청 형식으로 변환
  const requestData = mapDriverFormToApiRequest(driverData);
  console.log("차주 등록 요청 데이터:", requestData);
  
  try {
    console.log("API 요청 URL:", API_BASE_URL);
    console.log("요청 메서드:", "POST");
    
    // 인증 헤더 가져오기
    const headers = getAuthHeaders();
    console.log("요청 헤더:", headers);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });
    
    console.log("응답 상태:", response.status, response.statusText);
    
    const responseText = await response.text();
    console.log("응답 원본:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("응답 데이터:", data);
    } catch (parseError) {
      console.error("응답 파싱 오류:", parseError);
      throw new Error("서버 응답을 파싱할 수 없습니다: " + responseText);
    }
    
    if (!response.ok) {
      console.error("API 오류 응답:", data);
      throw new Error(data?.error || data?.message || '차주 등록 중 오류가 발생했습니다.');
    }
    
    // 응답 데이터 매핑
    const mappedData = mapApiResponseToDriver(data.data);
    console.log("매핑된 응답 데이터:", mappedData);
    return mappedData;
  } catch (error) {
    console.error("차주 등록 API 호출 중 예외 발생:", error);
    throw error;
  }
};

/**
 * 차주 정보 수정
 * @param id 차주 ID
 * @param driverData 수정할 차주 데이터
 * @returns 수정된 차주 정보
 */
export const updateDriver = async (id: string, driverData: any): Promise<IBrokerDriver> => {
  // 프론트엔드 폼 데이터를 API 요청 형식으로 변환
  const requestData = mapDriverFormToApiRequest(driverData);
  
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 정보 수정 중 오류가 발생했습니다.');
  }
  
  const data = await response.json();
  
  // 응답 데이터 매핑
  return mapApiResponseToDriver(data.data);
};

/**
 * 차주 필드 업데이트
 * @param id 차주 ID
 * @param fields 업데이트할 필드
 * @param reason 변경 이유
 * @returns 업데이트된 차주 정보
 */
export const updateDriverFields = async (
  id: string, 
  fields: Record<string, any>, 
  reason?: string
): Promise<IBrokerDriver> => {
  const response = await fetch(`${API_BASE_URL}/${id}/fields`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      fields,
      reason
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 필드 업데이트 중 오류가 발생했습니다.');
  }
  
  const data = await response.json();
  
  // 응답 데이터 매핑
  return mapApiResponseToDriver(data.data);
};

/**
 * 차주 삭제
 * @param id 차주 ID
 * @param reason 삭제 이유
 * @returns 삭제 성공 메시지
 */
export const deleteDriver = async (id: string, reason?: string): Promise<{ message: string }> => {
  const url = new URL(`${API_BASE_URL}/${id}`, window.location.origin);
  if (reason) {
    url.searchParams.append('reason', reason);
  }
  
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 삭제 중 오류가 발생했습니다.');
  }
  
  return await response.json();
};

// --------------- 차주 특이사항 관련 API 함수 ---------------

/**
 * 차주 특이사항 목록 조회
 * @param driverId 차주 ID
 * @returns 특이사항 목록
 */
export const getDriverNotes = async (driverId: string): Promise<any[]> => {
  try {
    console.log('getDriverNotes 호출됨: driverId', driverId);
    
    const response = await fetch(`/api/drivers/notes?driverId=${driverId}`, {
      headers: getAuthHeaders()
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '차주 특이사항 조회 중 오류가 발생했습니다.');
    }
    
    // 전체 응답 로깅 
    const responseText = await response.text();
    console.log('API 응답 원본:', responseText);
    
    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('API 응답 데이터 구조:', {
        isArray: Array.isArray(data),
        hasData: !!data.data,
        dataIsArray: data.data ? Array.isArray(data.data) : false,
        dataLength: data.data && Array.isArray(data.data) ? data.data.length : 'N/A'
      });
    } catch (parseError) {
      console.error('API 응답 JSON 파싱 오류:', parseError);
      throw new Error('서버 응답을 파싱할 수 없습니다: ' + responseText);
    }
    
    // data 속성이 있는 경우 반환
    if (data.data) {
      console.log('데이터 속성 반환:', data.data);
      return data.data;
    }
    
    // 응답 자체가 배열인 경우
    if (Array.isArray(data)) {
      console.log('배열 형태 응답 반환:', data);
      return data;
    }
    
    // 기본적으로 빈 배열 반환
    console.log('응답 형식 인식 실패. 빈 배열 반환');
    return [];
  } catch (error) {
    console.error('차주 특이사항 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 특이사항 상세 조회
 * @param noteId 특이사항 ID
 * @returns 특이사항 상세 정보
 */
export const getDriverNoteById = async (noteId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/drivers/notes/${noteId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || '특이사항 상세 정보 조회 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('특이사항 상세 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 특이사항 추가
 * @param driverId 차주 ID
 * @param content 특이사항 내용
 * @returns 추가된 특이사항 정보
 */
export const addDriverNote = async (driverId: string, content: string): Promise<any> => {
  try {
    console.log('addDriverNote 호출됨:', { driverId, content });
    
    const response = await fetch('/api/drivers/notes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ driverId, content }),
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '특이사항 추가 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    return data.data;
  } catch (error) {
    console.error('특이사항 추가 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 특이사항 수정
 * @param noteId 특이사항 ID
 * @param content 수정할 특이사항 내용
 * @returns 수정된 특이사항 정보
 */
export const updateDriverNote = async (noteId: string, content: string): Promise<any> => {
  try {
    console.log('updateDriverNote 호출됨:', { noteId, content });
    
    const response = await fetch(`/api/drivers/notes/${noteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '특이사항 수정 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    return data.data;
  } catch (error) {
    console.error('특이사항 수정 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 특이사항 삭제
 * @param noteId 특이사항 ID
 * @returns 삭제 성공 메시지
 */
export const deleteDriverNote = async (noteId: string): Promise<{ message: string }> => {
  try {
    console.log('deleteDriverNote 호출됨:', { noteId });
    
    const response = await fetch(`/api/drivers/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '특이사항 삭제 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('특이사항 삭제 API 오류:', error);
    throw error;
  }
};

/**
 * 차주 검색 (배차 입력 폼에서 사용)
 * @param searchTerm 검색어 (차주명, 연락처, 차량번호 등)
 * @returns 검색된 차주 목록
 */
export const searchDrivers = async (searchTerm: string): Promise<IBrokerDriver[]> => {
  try {
    console.log('searchDrivers 호출됨: searchTerm', searchTerm);
    
    // 검색어가 없는 경우 빈 배열 반환
    if (!searchTerm.trim()) {
      return [];
    }
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    queryParams.append('searchTerm', searchTerm);
    queryParams.append('pageSize', '10'); // 최대 10개 결과만 가져옴
    
    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      headers: getAuthHeaders()
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 오류 응답:', errorData);
      throw new Error(errorData?.error || '차주 검색 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    // 응답 데이터 매핑
    const drivers = Array.isArray(data.data) 
      ? data.data.map((item: any) => mapApiResponseToDriver(item)) 
      : [];
    
    console.log('매핑된 차주 데이터:', drivers);
    return drivers;
  } catch (error) {
    console.error('차주 검색 API 오류:', error);
    throw error;
  }
}; 