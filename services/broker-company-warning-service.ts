import apiClient from '@/utils/api-client';
import { 
  ICompanyWarning, 
  ICompanyWarningCreate, 
  ICompanyWarningUpdate, 
  ICompanyWarningResponse,
  ICompanyWarningSortRequest
} from '@/types/company-warning';

/**
 * 업체 주의사항 목록 조회
 * @param companyId 업체 ID
 */
export async function fetchWarnings(companyId: string): Promise<ICompanyWarning[]> {
  try {
    const response = await apiClient.get<ICompanyWarning[]>(`/companies/${companyId}/warnings`);
    return response;
  } catch (error) {
    console.error('주의사항 목록 조회 중 오류 발생1:', error);
    throw error;
  }
}

/**
 * 개별 주의사항 조회
 * @param companyId 업체 ID
 * @param warningId 주의사항 ID
 */
export async function fetchWarning(companyId: string, warningId: string): Promise<ICompanyWarning> {
  try {
    const response = await apiClient.get<ICompanyWarning>(`/companies/${companyId}/warnings/${warningId}`);
    return response;
  } catch (error) {
    console.error('주의사항 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주의사항 추가
 * @param companyId 업체 ID
 * @param data 주의사항 데이터
 */
export async function addWarning(companyId: string, data: ICompanyWarningCreate): Promise<ICompanyWarningResponse> {
  try {
    const response = await apiClient.post<ICompanyWarningResponse>(`/companies/${companyId}/warnings`, data);
    return response;
  } catch (error) {
    console.error('주의사항 추가 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주의사항 수정
 * @param companyId 업체 ID
 * @param warningId 주의사항 ID
 * @param data 수정할 데이터
 */
export async function updateWarning(
  companyId: string, 
  warningId: string, 
  data: ICompanyWarningUpdate
): Promise<ICompanyWarningResponse> {
  try {
    const response = await apiClient.patch<ICompanyWarningResponse>(
      `/companies/${companyId}/warnings/${warningId}`, 
      data
    );
    return response;
  } catch (error) {
    console.error('주의사항 수정 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주의사항 삭제
 * @param companyId 업체 ID
 * @param warningId 주의사항 ID
 * @param reason 삭제 이유 (선택)
 */
export async function deleteWarning(
  companyId: string, 
  warningId: string,
  reason?: string
): Promise<ICompanyWarningResponse> {
  try {
    const url = reason 
      ? `/companies/${companyId}/warnings/${warningId}?reason=${encodeURIComponent(reason)}`
      : `/companies/${companyId}/warnings/${warningId}`;
    
    const response = await apiClient.delete<ICompanyWarningResponse>(url);
    return response;
  } catch (error) {
    console.error('주의사항 삭제 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주의사항 정렬 순서 변경
 * @param companyId 업체 ID
 * @param sortData 정렬 데이터
 */
export async function updateWarningSort(
  companyId: string,
  sortData: ICompanyWarningSortRequest
): Promise<ICompanyWarningResponse> {
  try {
    const response = await apiClient.post<ICompanyWarningResponse>(
      `/companies/${companyId}/warnings/sort`,
      sortData
    );
    return response;
  } catch (error) {
    console.error('주의사항 정렬 순서 변경 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주의사항 변경 로그 조회
 * @param companyId 업체 ID
 * @param warningId 주의사항 ID (선택) - 특정 주의사항에 대한 로그만 조회할 경우
 */
export async function fetchWarningLogs(companyId: string, warningId?: string): Promise<any[]> {
  try {
    const url = warningId
      ? `/companies/${companyId}/warnings/logs?warningId=${warningId}`
      : `/companies/${companyId}/warnings/logs`;
    
    const response = await apiClient.get<any[]>(url);
    return response;
  } catch (error) {
    console.error('주의사항 변경 로그 조회 중 오류 발생:', error);
    throw error;
  }
} 