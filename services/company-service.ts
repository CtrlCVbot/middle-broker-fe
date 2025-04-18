import axios from 'axios';
import { 
  ICompany, 
  CompanyFilter, 
  CompanyListResponse, 
  ApiResponse, 
  CompanyRequest, 
  CompanyStatusChangeRequest, 
  CompanyBatchRequest,
  CompanyValidationResponse 
} from '@/types/company';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 응답 에러 처리를 위한 유틸리티 함수
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  
  if (error.response) {
    // 서버 응답이 있는 경우
    const errorMessage = error.response.data?.error || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(errorMessage);
  } else if (error.request) {
    // 요청은 전송되었으나 응답이 없는 경우
    throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
  } else {
    // 요청 설정 오류 등
    throw new Error('요청 설정 중 오류가 발생했습니다.');
  }
};

/**
 * 업체 목록 조회
 * @param page 페이지 번호 (1부터 시작)
 * @param pageSize 페이지 당 항목 수
 * @param filter 검색 필터
 * @returns 페이지네이션된 업체 목록
 */
export const getCompanies = async (
  page: number = 1,
  pageSize: number = 10,
  filter?: CompanyFilter
): Promise<CompanyListResponse> => {
  try {
    const params = { page, pageSize, ...filter };
    const response = await apiClient.get<CompanyListResponse>('/companies', { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 특정 업체 조회
 * @param id 업체 ID
 * @returns 업체 정보
 */
export const getCompanyById = async (id: string): Promise<ICompany> => {
  try {
    const response = await apiClient.get<ICompany>(`/companies/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 생성
 * @param data 업체 데이터
 * @returns 생성된 업체 정보
 */
export const createCompany = async (data: CompanyRequest): Promise<ICompany> => {
  try {
    const response = await apiClient.post<ICompany>('/companies', data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 수정
 * @param id 업체 ID
 * @param data 수정할 업체 데이터
 * @returns 수정된 업체 정보
 */
export const updateCompany = async (id: string, data: CompanyRequest): Promise<ICompany> => {
  try {
    const response = await apiClient.put<ICompany>(`/companies/${id}`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 삭제
 * @param id 업체 ID
 * @param requestUserId 요청 사용자 ID
 * @returns 삭제 성공 메시지
 */
export const deleteCompany = async (id: string, requestUserId: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/companies/${id}`, {
      params: { requestUserId }
    });
    return { message: response.data.message || '업체가 성공적으로 삭제되었습니다.' };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 상태 변경
 * @param id 업체 ID
 * @param data 상태 변경 요청 데이터
 * @returns 상태 변경된 업체 정보
 */
export const changeCompanyStatus = async (
  id: string, 
  data: CompanyStatusChangeRequest
): Promise<ICompany> => {
  try {
    const response = await apiClient.patch<ICompany>(`/companies/${id}/status`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 데이터 유효성 검사
 * @param data 검증할 업체 데이터
 * @returns 유효성 검사 결과
 */
export const validateCompany = async (data: Partial<CompanyRequest>): Promise<CompanyValidationResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<CompanyValidationResponse>>('/companies/validate', data);
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 업체 일괄 처리
 * @param data 일괄 처리 요청 데이터
 * @returns 처리 결과 메시지
 */
export const batchUpdateCompanies = async (data: CompanyBatchRequest): Promise<{ message: string, processedCount: number }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string, processedCount: number }>>('/companies/batch', data);
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
}; 