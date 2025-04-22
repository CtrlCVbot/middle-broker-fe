import apiClient, { IApiError } from '@/utils/api-client';
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
import { getCurrentUser } from '@/utils/auth';

/**
 * 업체 목록 조회 - 캐시 관리 강화 버전
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
  const params = { page, pageSize, ...filter };
  const cacheKey = `companies-${page}-${pageSize}-${JSON.stringify(filter || {})}`;
  
  console.log(`📞 업체 목록 조회 요청`, {
    page, 
    pageSize,
    filterKeys: filter ? Object.keys(filter) : 'none',
    cacheKey
  });
  
  try {
    // ApiClient는 response.data를 자동으로 반환하므로 추가 처리 필요 없음
    const data = await apiClient.get<CompanyListResponse>('/companies', { 
      params,
      // 데이터 갱신 문제 해결을 위해 캐싱 비활성화
      useCache: false, // 타임스탬프가 다른 경우 캐시 히트가 다를 수 있음
    });
    
    // 일관성을 위해 항상 원본 데이터 반환
    console.log(`✅ 업체 목록 조회 성공`, {
      total: data.total,
      page: data.page,
      count: data.data.length,
      requestTime: new Date().toISOString()
    });
    
    return data;
  } catch (error) {
    console.error('❌ 업체 목록 조회 오류:', error);
    // error 객체를 일관된 구조로 변환하여 전달
    if (error instanceof Error) {
      throw new Error(`업체 목록 조회 실패: ${error.message}`);
    }
    throw error;
  }
};

/**
 * 특정 업체 조회
 * @param id 업체 ID
 * @returns 업체 정보
 */
export const getCompanyById = async (id: string): Promise<ICompany> => {
  return apiClient.get<ICompany>(`/companies/${id}`, {
    // 상세 조회는 캐싱 활성화, 1분 캐시 유지
    useCache: true,
    cacheLifetime: 60 * 1000
  });
};

/**
 * 업체 생성
 * @param data 업체 데이터
 * @returns 생성된 업체 정보
 */
export const createCompany = async (data: CompanyRequest): Promise<ICompany> => {
  return apiClient.post<ICompany>('/companies', data);
};

/**
 * 업체 수정
 * @param id 업체 ID
 * @param data 수정할 업체 데이터
 * @returns 수정된 업체 정보
 */
export const updateCompany = async (id: string, data: CompanyRequest): Promise<ICompany> => {
  // 현재 로그인된 사용자 정보 가져오기
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || data.requestUserId || ''; // 로그인된 사용자 ID 우선 사용, 없으면 전달받은 ID 사용
  
  // PATCH 방식으로 변경: /companies/:id/fields 엔드포인트 사용
  // 먼저 데이터 형식을 fields API에 맞게 변환
  const fieldsData = {
    fields: {
      name: data.name,
      businessNumber: data.businessNumber,
      ceoName: data.ceoName,
      type: data.type,
      status: data.status,
      // 중첩된 객체 필드 풀어서 전달
      addressPostal: data.address?.postal || '',
      addressRoad: data.address?.road || '',
      addressDetail: data.address?.detail || '',
      contactTel: data.contact?.tel || '',
      contactMobile: data.contact?.mobile || '',
      contactEmail: data.contact?.email || '',
    },
    reason: `관리자에 의해 수정됨 (사용자 ID: ${userId})`,
  };
  
  return apiClient.patch<ICompany>(`/companies/${id}/fields`, fieldsData);
};

/**
 * 업체 삭제
 * @param id 업체 ID
 * @param requestUserId 요청 사용자 ID
 * @returns 삭제 성공 메시지
 */
export const deleteCompany = async (id: string, requestUserId: string): Promise<{ message: string }> => {
  const result = await apiClient.delete<ApiResponse<{ message: string }>>(`/companies/${id}`, {
    params: { requestUserId }
  });
  return { message: result.message || result.data?.message || '업체가 성공적으로 삭제되었습니다.' };
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
  return apiClient.patch<ICompany>(`/companies/${id}/status`, data);
};

/**
 * 업체 데이터 유효성 검사
 * @param data 검증할 업체 데이터
 * @returns 유효성 검사 결과
 */
export const validateCompany = async (data: Partial<CompanyRequest>): Promise<CompanyValidationResponse> => {
  const result = await apiClient.post<ApiResponse<CompanyValidationResponse>>('/companies/validate', data);
  // ApiClient가 이미 result.data를 반환했으므로, 여기서는 result.data 또는 result 자체를 사용해야 함
  return result.data || { valid: false };
};

/**
 * 업체 일괄 처리
 * @param data 일괄 처리 요청 데이터
 * @returns 처리 결과 메시지
 */
export const batchUpdateCompanies = async (data: CompanyBatchRequest): Promise<{ message: string, processedCount: number }> => {
  const result = await apiClient.post<ApiResponse<{ message: string, processedCount: number }>>('/companies/batch', data);
  // ApiClient가 이미 result.data를 반환했으므로, 여기서는 result.data 또는 result 자체를 사용해야 함
  return result.data || { message: '처리 완료', processedCount: 0 };
};

/**
 * 모든 업체 관련 캐시 무효화
 */
export const invalidateCompanyCache = (): void => {
  console.log('모든 업체 관련 캐시 무효화 실행');
  apiClient.clearCache('GET', '/companies'); // 특정 URL만 명시적으로 삭제
};

/**
 * 특정 업체 캐시 무효화
 * @param id 업체 ID
 */
export const invalidateCompanyById = (id: string): void => {
  console.log(`특정 업체(${id}) 캐시 무효화 실행`);
  apiClient.clearCache('GET', `/companies/${id}`); // 특정 업체 URL만 명시적으로 삭제
};

/**
 * 업체 수정 및 캐시 무효화 (보강된 버전)
 * @param id 업체 ID
 * @param data 수정할 업체 데이터
 * @returns 수정된 업체 정보와 캐시 무효화 결과
 */
export const updateCompanyAndInvalidateCache = async (id: string, data: CompanyRequest): Promise<{
  company: ICompany;
  cacheInvalidated: boolean;
}> => {
  console.log('🔄 업체 수정 및 캐시 무효화 시작:', id);
  
  try {
    // 업체 데이터 업데이트
    const updatedCompany = await updateCompany(id, data);
    
    // 캐시 무효화 (여러 방법으로 시도)
    try {
      // 1. 해당 업체 데이터 캐시 삭제
      apiClient.clearCache('GET', `/companies/${id}`);
      
      // 2. 업체 목록 캐시 삭제
      apiClient.clearCache('GET', '/companies');
      
      // 3. 모든 관련 캐시 삭제 시도
      setTimeout(() => {
        apiClient.clearCache('GET', `/companies/${id}`);
        apiClient.clearCache('GET', '/companies');
        console.log('🧹 지연된 캐시 무효화 완료:', id);
      }, 300);
      
      console.log('✅ 캐시 무효화 성공:', id);
      return { company: updatedCompany, cacheInvalidated: true };
    } catch (cacheError) {
      console.error('❌ 캐시 무효화 실패:', cacheError);
      return { company: updatedCompany, cacheInvalidated: false };
    }
  } catch (error) {
    console.error('❌ 업체 수정 실패:', error);
    throw error;
  }
}; 