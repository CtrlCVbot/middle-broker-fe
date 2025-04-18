import apiClient from '@/utils/api-client';
import { 
  IAddress, 
  IAddressResponse, 
  IAddressSearchParams, 
  IAddressBatchResponse,
  AddressType
} from '@/types/address';

/**
 * 주소 목록 조회
 * 
 * @param params 검색 파라미터 (페이지, 검색어, 유형 등)
 * @returns 주소 목록 및 페이지네이션 정보
 */
export const getAddresses = async (params: IAddressSearchParams): Promise<IAddressResponse> => {
  const { page = 1, limit = 10, search = '', type = '' } = params;
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (search) queryParams.append('search', search);
  if (type) queryParams.append('type', type);
  
  return await apiClient.get(`/addresses?${queryParams.toString()}`);
};

/**
 * 개별 주소 조회
 * 
 * @param id 주소 ID
 * @returns 주소 정보
 */
export const getAddress = async (id: string): Promise<IAddress> => {
  return await apiClient.get(`/addresses/${id}`);
};

/**
 * 새 주소 생성
 * 
 * @param address 생성할 주소 데이터
 * @returns 생성된 주소 정보
 */
export const createAddress = async (address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent' | 'createdBy' | 'updatedBy'>): Promise<IAddress> => {
  return await apiClient.post('/addresses', address);
};

/**
 * 주소 수정
 * 
 * @param id 수정할 주소 ID
 * @param address 수정할 주소 데이터
 * @returns 수정된 주소 정보
 */
export const updateAddress = async (id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<IAddress> => {
  return await apiClient.put(`/addresses/${id}`, address);
};

/**
 * 주소 삭제
 * 
 * @param id 삭제할 주소 ID
 * @returns 삭제 결과 메시지
 */
export const deleteAddress = async (id: string): Promise<{ message: string }> => {
  return await apiClient.delete(`/addresses/${id}`);
};

/**
 * 주소 일괄 처리
 * 
 * @param addressIds 처리할 주소 ID 배열
 * @param action 수행할 작업 (delete, setFrequent, unsetFrequent)
 * @returns 일괄 처리 결과
 */
export const batchProcessAddresses = async (
  addressIds: string[], 
  action: 'delete' | 'setFrequent' | 'unsetFrequent'
): Promise<IAddressBatchResponse> => {
  return await apiClient.post('/addresses/batch', { addressIds, action });
};

/**
 * 주소 검증
 * 
 * @param address 검증할 주소 데이터
 * @returns 검증 결과
 */
export const validateAddress = async (address: Partial<IAddress>): Promise<{ isValid: boolean; errors?: string[] }> => {
  return await apiClient.post('/addresses/validate', address);
}; 