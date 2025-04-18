import apiClient from '@/utils/api-client';
import { 
  IAddress, 
  IAddressResponse, 
  IAddressSearchParams, 
  IAddressBatchResponse,
  AddressType,
  IAddressBatchRequest
} from '@/types/address';

/**
 * 주소 관련 API 서비스
 */
export class AddressService {
  /**
   * 주소 목록 조회
   * @param params 검색 파라미터
   */
  static async getAddresses(params: IAddressSearchParams): Promise<IAddressResponse> {
    const { page = 1, limit = 10, search = '', type = '' } = params;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    
    return await apiClient.get<IAddressResponse>(`/addresses?${queryParams.toString()}`);
  }

  /**
   * 주소 상세 조회
   * @param id 주소 ID
   */
  static async getAddress(id: string): Promise<IAddress> {
    return await apiClient.get<IAddress>(`/addresses/${id}`);
  }

  /**
   * 자주 사용하는 주소 목록 조회
   */
  static async getFrequentAddresses(): Promise<IAddress[]> {
    return await apiClient.get<IAddress[]>('/addresses/frequent');
  }

  /**
   * 주소 생성
   * @param address 생성할 주소 데이터
   */
  static async createAddress(address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> {
    return await apiClient.post<IAddress>('/addresses', address);
  }

  /**
   * 주소 수정
   * @param id 주소 ID
   * @param address 수정할 주소 데이터
   */
  static async updateAddress(id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> {
    return await apiClient.put<IAddress>(`/addresses/${id}`, address);
  }

  /**
   * 주소 삭제
   * @param id 주소 ID
   */
  static async deleteAddress(id: string): Promise<void> {
    return await apiClient.delete<void>(`/addresses/${id}`);
  }

  /**
   * 배치 처리 (다중 삭제, 자주 사용 설정/해제)
   * @param request 배치 요청 데이터
   */
  static async batchProcess(request: IAddressBatchRequest): Promise<IAddressBatchResponse> {
    return await apiClient.post<IAddressBatchResponse>('/addresses/batch', request);
  }

  /**
   * 다중 주소 삭제
   * @param ids 삭제할 주소 ID 배열
   */
  static async batchDelete(ids: string[]): Promise<IAddressBatchResponse> {
    return this.batchProcess({
      action: 'delete',
      addressIds: ids
    });
  }

  /**
   * 자주 사용 설정
   * @param ids 자주 사용 설정할 주소 ID 배열
   */
  static async setFrequent(ids: string[]): Promise<IAddressBatchResponse> {
    return this.batchProcess({
      action: 'setFrequent',
      addressIds: ids
    });
  }

  /**
   * 자주 사용 해제
   * @param ids 자주 사용 해제할 주소 ID 배열
   */
  static async unsetFrequent(ids: string[]): Promise<IAddressBatchResponse> {
    return this.batchProcess({
      action: 'unsetFrequent',
      addressIds: ids
    });
  }
}

/**
 * 주소 검증
 * 
 * @param address 검증할 주소 데이터
 * @returns 검증 결과
 */
export const validateAddress = async (address: Partial<IAddress>): Promise<{ isValid: boolean; errors?: string[] }> => {
  return await apiClient.post('/addresses/validate', address);
}; 