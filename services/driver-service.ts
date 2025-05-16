import { IBrokerDriver } from "@/types/broker-driver";
import { mapDriverFormToApiRequest, mapApiResponseToDriver } from "@/utils/driver-mapper";

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
}) => {
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
  if (params.vehicleWeight) queryParams.append('vehicleWeight', params.vehicleWeight);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.companyType) queryParams.append('companyType', params.companyType);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  // API 호출
  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 목록 조회 중 오류가 발생했습니다.');
  }
  
  const data = await response.json();
  
  // 응답 데이터 매핑
  return {
    data: data.data.map((item: any) => mapApiResponseToDriver(item)),
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages
  };
};

/**
 * 차주 상세 조회
 * @param id 차주 ID
 * @returns 차주 상세 정보
 */
export const getDriverById = async (id: string): Promise<IBrokerDriver> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  
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
    console.log("요청 헤더:", {
      'Content-Type': 'application/json',
    });
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || '차주 삭제 중 오류가 발생했습니다.');
  }
  
  return await response.json();
}; 