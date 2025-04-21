import { 
  IBrokerCompanyManager, 
  IBrokerManagerFilter,
  convertUserToBrokerManager,
  convertBrokerManagerToUser,
  convertFilterToQueryParams,
  ManagerStatus
} from '@/types/broker-company';

import { IUser } from '@/types/user';
import { getCurrentUserId } from '@/utils/auth-utils';

/**
 * 백엔드 API 응답 형식
 */
interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 주선사 담당자 목록 조회
 */
export const fetchBrokerManagers = async (
  companyId: string,
  filter: IBrokerManagerFilter
): Promise<ApiResponse<IBrokerCompanyManager>> => {
  try {
    // 필터를 쿼리 파라미터로 변환
    const params = convertFilterToQueryParams(companyId, filter);
    
    // API 호출
    const response = await fetch(`/api/users?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '사용자 목록을 불러오는 중 오류가 발생했습니다.');
    }
    
    const result = await response.json();
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const managers: IBrokerCompanyManager[] = result.data.map((user: IUser) => 
      convertUserToBrokerManager(user)
    );
    
    return {
      data: managers,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages
    };
  } catch (error) {
    console.error('주선사 담당자 목록 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 주선사 담당자 상세 조회
 */
export const fetchBrokerManager = async (userId: string): Promise<IBrokerCompanyManager> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '담당자 정보를 불러오는 중 오류가 발생했습니다.');
    }
    
    const user = await response.json();
    return convertUserToBrokerManager(user);
  } catch (error) {
    console.error('주선사 담당자 상세 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 주선사 담당자 생성
 */
export const createBrokerManager = async (
  manager: Omit<IBrokerCompanyManager, 'id' | 'registeredDate'>,
  requestUserId?: string
): Promise<IBrokerCompanyManager> => {
  try {
    // 현재 사용자 ID 가져오기
    const currentUserId = requestUserId || getCurrentUserId();
    
    // 프론트엔드 데이터를 백엔드 형식으로 변환
    const userData = convertBrokerManagerToUser(manager, currentUserId);
    
    // API 호출
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details?.[0]?.message || '담당자 등록 중 오류가 발생했습니다.');
    }
    
    const result = await response.json();
    return convertUserToBrokerManager(result);
  } catch (error) {
    console.error('주선사 담당자 생성 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 주선사 담당자 수정
 */
export const updateBrokerManager = async (
  manager: IBrokerCompanyManager, 
  requestUserId?: string
): Promise<IBrokerCompanyManager> => {
  try {
    // 현재 사용자 ID 가져오기
    const currentUserId = requestUserId || getCurrentUserId();
    
    // 프론트엔드 데이터를 백엔드 형식으로 변환
    const userData = convertBrokerManagerToUser(manager, currentUserId);
    
    // ID 분리 (URL에 사용)
    const { id, ...updateData } = userData;
    
    // API 호출
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '담당자 수정 중 오류가 발생했습니다.');
    }
    
    const result = await response.json();
    return convertUserToBrokerManager(result);
  } catch (error) {
    console.error('주선사 담당자 수정 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 주선사 담당자 상태 변경
 */
export const changeBrokerManagerStatus = async (
  userId: string,
  status: ManagerStatus,
  reason?: string,
  requestUserId?: string
): Promise<IBrokerCompanyManager> => {
  try {
    // 현재 사용자 ID 가져오기
    const currentUserId = requestUserId || getCurrentUserId();
    
    // 백엔드 API에 맞게 상태 변환
    const apiStatus = status === '활성' ? 'active' : 'inactive';
    
    // API 호출
    const response = await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: apiStatus,
        reason: reason || `사용자 상태가 ${status}(으)로 변경되었습니다.`,
        requestUserId: currentUserId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '담당자 상태 변경 중 오류가 발생했습니다.');
    }
    
    const result = await response.json();
    return convertUserToBrokerManager(result);
  } catch (error) {
    console.error('주선사 담당자 상태 변경 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 주선사 담당자 삭제
 */
export const deleteBrokerManager = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '담당자 삭제 중 오류가 발생했습니다.');
    }
    
    return true;
  } catch (error) {
    console.error('주선사 담당자 삭제 중 오류 발생:', error);
    throw error;
  }
}; 