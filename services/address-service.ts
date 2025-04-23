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
 * - API 클라이언트를 통한 주소 관련 CRUD 및 배치 작업 처리
 * - 최적화된 캐싱 전략 적용
 * - 일관된 에러 핸들링
 */
export class AddressService {
  // 캐시 키 상수
  private static readonly CACHE_KEYS = {
    ALL_ADDRESSES: 'all-addresses',
    FREQUENT_ADDRESSES: 'frequent-addresses',
    ADDRESS_DETAIL: 'address-detail',
  };

  /**
   * 주소 목록 조회 (캐싱 적용)
   * @param params 검색 파라미터
   */
  static async getAddresses(params: IAddressSearchParams): Promise<IAddressResponse> {
    const { page = 1, limit = 10, search = '', type = '' } = params;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    
    // 검색어가 없고 첫 페이지인 경우 더 오래 캐싱
    const useCache = !search;
    const cacheLifetime = !search && page === 1 ? 5 * 60 * 1000 : undefined; // 5분 캐싱
    
    try {
      return await apiClient.get<IAddressResponse>(
        `/addresses?${queryParams.toString()}`, 
        { useCache, cacheLifetime }
      );
    } catch (error) {
      console.error('[AddressService] 주소 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주소 상세 조회 (캐싱 적용)
   * @param id 주소 ID
   */
  static async getAddress(id: string): Promise<IAddress> {
    try {
      // 개별 주소 조회는 변경이 적으므로 더 오래 캐싱
      return await apiClient.get<IAddress>(`/addresses/${id}`, { 
        useCache: true,
        cacheLifetime: 10 * 60 * 1000 // 10분 캐싱
      });
    } catch (error) {
      console.error(`[AddressService] 주소 상세 조회 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 자주 사용하는 주소 목록 조회 (캐싱 적용)
   */
  // static async getFrequentAddresses(): Promise<IAddress[]> {
  //   try {
  //     // 자주 사용 주소는 변경이 적고 중요하므로 더 오래 캐싱
  //     return await apiClient.get<IAddress[]>('/addresses/frequent', {
  //       useCache: true,
  //       cacheLifetime: 15 * 60 * 1000 // 15분 캐싱
  //     });
  //   } catch (error) {
  //     console.error('[AddressService] 자주 사용 주소 목록 조회 실패:', error);
  //     throw error;
  //   }
  // }

  static async getFrequentAddresses(params: IAddressSearchParams): Promise<IAddressResponse> {
    
    try {
      return await apiClient.get<IAddressResponse>(
        `/addresses/frequent`, 
        { useCache: true, cacheLifetime: 15 * 60 * 1000 }
      );
    } catch (error) {
      console.error('[AddressService] 주소 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주소 생성
   * @param address 생성할 주소 데이터
   */
  static async createAddress(address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent' | 'createdBy' | 'updatedBy'>): Promise<IAddress> {
    try {
      const result = await apiClient.post<IAddress>('/addresses', address);
      // 관련 캐시 무효화 (apiClient에서 처리하지만 명시적으로 호출)
      apiClient.clearCache();
      return result;
    } catch (error) {
      console.error('[AddressService] 주소 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 주소 수정
   * @param id 주소 ID
   * @param address 수정할 주소 데이터
   */
  static async updateAddress(id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> {
    try {
      const result = await apiClient.put<IAddress>(`/addresses/${id}`, address);
      // 관련 캐시 무효화
      apiClient.clearCache();
      return result;
    } catch (error) {
      console.error(`[AddressService] 주소 수정 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 주소 삭제
   * @param id 주소 ID
   */
  static async deleteAddress(id: string): Promise<void> {
    try {
      const result = await apiClient.delete<void>(`/addresses/${id}`);
      // 관련 캐시 무효화
      apiClient.clearCache();
      return result;
    } catch (error) {
      console.error(`[AddressService] 주소 삭제 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 배치 처리 (다중 삭제, 자주 사용 설정/해제)
   * @param request 배치 요청 데이터
   */
  static async batchProcess(request: IAddressBatchRequest): Promise<IAddressBatchResponse> {
    try {
      const result = await apiClient.post<IAddressBatchResponse>('/addresses/batch', request);
      // 배치 처리 후 관련 캐시 무효화
      apiClient.clearCache();
      return result;
    } catch (error) {
      console.error('[AddressService] 배치 처리 실패:', error, request);
      throw error;
    }
  }

  /**
   * 다중 주소 삭제
   * @param ids 삭제할 주소 ID 배열
   */
  static async batchDelete(ids: string[]): Promise<IAddressBatchResponse> {
    try {
      return this.batchProcess({
        action: 'delete',
        addressIds: ids
      });
    } catch (error) {
      console.error('[AddressService] 다중 주소 삭제 실패:', error, ids);
      throw error;
    }
  }

  /**
   * 자주 사용 설정
   * @param ids 자주 사용 설정할 주소 ID 배열
   */
  static async setFrequent(ids: string[]): Promise<IAddressBatchResponse> {
    try {
      return this.batchProcess({
        action: 'setFrequent',
        addressIds: ids
      });
    } catch (error) {
      console.error('[AddressService] 자주 사용 설정 실패:', error, ids);
      throw error;
    }
  }

  /**
   * 자주 사용 해제
   * @param ids 자주 사용 해제할 주소 ID 배열
   */
  static async unsetFrequent(ids: string[]): Promise<IAddressBatchResponse> {
    try {
      return this.batchProcess({
        action: 'unsetFrequent',
        addressIds: ids
      });
    } catch (error) {
      console.error('[AddressService] 자주 사용 해제 실패:', error, ids);
      throw error;
    }
  }

  /**
   * API 캐시 무효화
   * - 주소 데이터 변경 이후 호출하여 캐시 초기화
   */
  static clearCache(): void {
    apiClient.clearCache();
  }
}

/**
 * 주소 검증
 * 
 * @param address 검증할 주소 데이터
 * @returns 검증 결과
 */
export const validateAddress = async (address: Partial<IAddress>): Promise<{ isValid: boolean; errors?: string[] }> => {
  try {
    return await apiClient.post('/addresses/validate', address);
  } catch (error) {
    console.error('[AddressService] 주소 검증 실패:', error, address);
    throw error;
  }
}; 