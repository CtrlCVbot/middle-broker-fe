import apiClient from '@/utils/api-client';
import { 
  IBrokerCompanyManager, 
  IBrokerManagerFilter,
  convertUserToBrokerManager,
  convertBrokerManagerToUser,
  convertFilterToQueryParams,
  ManagerStatus,
  IBrokerManagerRequest
} from '@/types/broker-company';
import { IUser } from '@/types/user';
import { getCurrentUser } from '@/utils/auth';

/**
 * 응답 데이터 인터페이스
 */
export interface BrokerManagerListResponse {
  data: IBrokerCompanyManager[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 주선사 담당자 관리 서비스
 * - 주선사 담당자 조회, 생성, 수정, 삭제, 상태 변경 기능 제공
 * - 효율적인 캐싱 적용 (목록 조회, 상세 조회에 적용)
 * - 에러 처리 및 로깅
 */
export class BrokerManagerService {
  // 캐시 키 상수
  private static readonly CACHE_KEYS = {
    MANAGER_LIST: 'broker-manager-list',
    MANAGER_DETAIL: 'broker-manager-detail',
  };

  /**
   * 주선사 담당자 목록 조회 (캐싱 적용)
   * @param companyId 주선사 업체 ID
   * @param filter 필터 및 페이지네이션 정보
   */
  static async getManagers(
    companyId: string, 
    filter: IBrokerManagerFilter
  ): Promise<BrokerManagerListResponse> {
    try {
      // 필터를 쿼리 파라미터로 변환
      const params = convertFilterToQueryParams(companyId, filter);
      
      // API 호출 (캐싱 적용)
      const response = await apiClient.get<any>(`/users?${params.toString()}`, {
        useCache: true,
        cacheLifetime: 10 * 1000 // 10초 캐싱
      });
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const managers: IBrokerCompanyManager[] = response.data.map((user: IUser) => 
        convertUserToBrokerManager(user)
      );
      
      return {
        data: managers,
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error('[BrokerManagerService] 담당자 목록 조회 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 주선사 담당자 상세 조회 (캐싱 적용)
   * @param userId 담당자 ID
   */
  static async getManager(userId: string): Promise<IBrokerCompanyManager> {
    try {
      const response = await apiClient.get<IUser>(`/users/${userId}`, {
        useCache: true,
        cacheLifetime: 60 * 1000 // 1분 캐싱
      });
      
      return convertUserToBrokerManager(response);
    } catch (error) {
      console.error(`[BrokerManagerService] 담당자 상세 조회 중 오류 발생 (ID: ${userId}):`, error);
      throw error;
    }
  }

  /**
   * 주선사 담당자 생성
   * @param manager 생성할 담당자 정보
   */
  static async createManager(
    manager: Omit<IBrokerCompanyManager, 'id' | 'registeredDate'>
  ): Promise<IBrokerCompanyManager> {
    try {
      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      
      // 프론트엔드 데이터를 백엔드 형식으로 변환
      const userData = convertBrokerManagerToUser(manager, currentUser?.id);
      
      // API 호출
      const response = await apiClient.post<IUser>('/users', userData);
      
      // 캐시 무효화
      apiClient.clearCache();
      
      return convertUserToBrokerManager(response);
    } catch (error) {
      console.error('[BrokerManagerService] 담당자 생성 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 주선사 담당자 수정
   * @param manager 수정할 담당자 정보
   */
  static async updateManager(manager: IBrokerCompanyManager): Promise<IBrokerCompanyManager> {
    try {
      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      
      // 프론트엔드 데이터를 백엔드 형식으로 변환
      const userData = convertBrokerManagerToUser(manager, currentUser?.id);
      
      // ID 분리 (URL에 사용)
      const { id, ...updateData } = userData;
      
      // API 호출
      const response = await apiClient.put<IUser>(`/users/${id}`, updateData);
      
      // 캐시 무효화
      apiClient.clearCache();
      
      return convertUserToBrokerManager(response);
    } catch (error) {
      console.error(`[BrokerManagerService] 담당자 수정 중 오류 발생 (ID: ${manager.id}):`, error);
      throw error;
    }
  }

  /**
   * 주선사 담당자 상태 변경
   * @param userId 담당자 ID
   * @param status 변경할 상태 ('활성' 또는 '비활성')
   * @param reason 상태 변경 사유 (선택 사항)
   */
  static async changeManagerStatus(
    userId: string,
    status: ManagerStatus,
    reason?: string
  ): Promise<IBrokerCompanyManager> {
    try {
      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      
      // 백엔드 API에 맞게 상태 변환
      const apiStatus = status === '활성' ? 'active' : 'inactive';
      
      // API 호출
      const response = await apiClient.patch<IUser>(`/users/${userId}/status`, {
        status: apiStatus,
        reason: reason || `사용자 상태가 ${status}(으)로 변경되었습니다.`,
        requestUserId: currentUser?.id
      });
      
      // 캐시 무효화
      apiClient.clearCache();
      
      return convertUserToBrokerManager(response);
    } catch (error) {
      console.error(`[BrokerManagerService] 담당자 상태 변경 중 오류 발생 (ID: ${userId}):`, error);
      throw error;
    }
  }

  /**
   * 주선사 담당자 삭제
   * @param userId 삭제할 담당자 ID
   */
  static async deleteManager(userId: string): Promise<boolean> {
    try {
      await apiClient.delete<void>(`/users/${userId}`);
      
      // 캐시 무효화
      apiClient.clearCache();
      
      return true;
    } catch (error) {
      console.error(`[BrokerManagerService] 담당자 삭제 중 오류 발생 (ID: ${userId}):`, error);
      throw error;
    }
  }

  /**
   * 모든 캐시 무효화
   */
  static clearCache(): void {
    apiClient.clearCache();
  }
} 