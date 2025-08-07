import apiClient from '@/utils/api-client';
import { ICargo } from '@/types/order';

/**
 * 화물 관련 API 서비스
 * - API 클라이언트를 통한 화물 관련 CRUD 작업 처리
 * - 최적화된 캐싱 전략 적용
 * - 일관된 에러 핸들링
 */
export class CargoService {
  // 캐시 키 상수
  private static readonly CACHE_KEYS = {
    RECENT_CARGOS: 'recent-cargos',
  };

  /**
   * 최근 화물 조회 (캐싱 적용)
   * @param companyId 회사 ID
   * @param limit 조회할 화물 개수 (기본값: 5, 최대: 20)
   */
  static async getRecentCargos(companyId: string, limit: number = 5): Promise<ICargo[]> {
    try {
      const queryParams = new URLSearchParams({
        companyId,
        limit: Math.min(Math.max(limit, 1), 20).toString()
      });

      const response = await apiClient.get<{
        success: boolean;
        data: ICargo[];
        total: number;
      }>(`/orders/recent?${queryParams.toString()}`, {
        useCache: true,
        cacheLifetime: 5 * 60 * 1000 // 5분 캐싱
      });

      return response.data || [];
    } catch (error) {
      console.error('[CargoService] 최근 화물 조회 실패:', error);
      throw error;
    }
  }

  /**
   * API 캐시 무효화
   * - 화물 데이터 변경 이후 호출하여 캐시 초기화
   */
  static clearCache(): void {
    apiClient.clearCache();
  }
}

/**
 * 화물 검증
 * 
 * @param cargo 검증할 화물 데이터
 * @returns 검증 결과
 */
export const validateCargo = async (cargo: Partial<ICargo>): Promise<{ isValid: boolean; errors?: string[] }> => {
  try {
    return await apiClient.post('/orders/validate', cargo);
  } catch (error) {
    console.error('[CargoService] 화물 검증 실패:', error, cargo);
    throw error;
  }
}; 