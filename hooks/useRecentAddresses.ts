import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AddressService } from '@/services/address-service';
import { IAddress } from '@/types/address';
import { useAuthStore } from '@/store/auth-store';

// 훅 옵션 인터페이스
interface UseRecentAddressesOptions {
  type: 'pickup' | 'delivery'; // 필수 파라미터로 변경
  limit?: number;
  enabled?: boolean;
  selectedCompanyId?: string;
}

// 쿼리 결과 타입
interface RecentAddressesQueryResult {
  data: IAddress[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * 최근 사용 주소 조회 커스텀 훅
 * 
 * @description
 * - 로그인한 사용자의 회사에서 최근 사용한 상차지/하차지 목록을 조회합니다
 * - 타입별로 구분하여 조회하며, 중복 제거된 결과를 반환합니다
 * - React Query를 사용하여 캐싱 및 백그라운드 업데이트를 지원합니다
 * 
 * @param options 훅 옵션
 * @param options.type 주소 타입 ('pickup' | 'delivery')
 * @param options.limit 조회할 주소 개수 (기본값: 10, 최대: 20)
 * @param options.enabled 쿼리 활성화 여부 (기본값: true)
 * 
 * @returns 쿼리 결과 객체
 * 
 * @example
 * ```tsx
 * // 상차지 최근 주소 조회
 * const { data: pickupAddresses, isLoading, error } = useRecentAddresses({
 *   type: 'pickup',
 *   limit: 4
 * });
 * 
 * // 하차지 최근 주소 조회
 * const { data: deliveryAddresses, isLoading } = useRecentAddresses({
 *   type: 'delivery',
 *   limit: 6,
 *   enabled: isFormVisible
 * });
 * ```
 */
export const useRecentAddresses = (options: UseRecentAddressesOptions): RecentAddressesQueryResult => {
  const { user } = useAuthStore();
  const { type, limit = 10, enabled = true, selectedCompanyId } = options;

  // 쿼리 키 생성 - 사용자의 회사 ID와 타입, limit을 포함
  const queryKey = ['recent-addresses', selectedCompanyId, type, limit];
  console.log('queryKey', queryKey);

  // React Query 설정
  const queryResult: UseQueryResult<IAddress[], Error> = useQuery({
    queryKey,
    queryFn: () => AddressService.getRecentAddresses(type, limit, selectedCompanyId),
    enabled: enabled && !!selectedCompanyId && !!type,
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지 (구 cacheTime)
    retry: 2, // 실패 시 2번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
    refetchOnMount: 'always', // 마운트 시 항상 재요청
  });

  // 결과 객체 반환
  return {
    data: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * 상차지 최근 주소 조회 전용 훅
 * 
 * @param limit 조회할 주소 개수 (기본값: 10)
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 */
export const useRecentPickupAddresses = (
  limit: number = 10, 
  enabled: boolean = true
): RecentAddressesQueryResult => {
  return useRecentAddresses({
    type: 'pickup',
    limit,
    enabled
  });
};

/**
 * 하차지 최근 주소 조회 전용 훅
 * 
 * @param limit 조회할 주소 개수 (기본값: 10)
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 */
export const useRecentDeliveryAddresses = (
  limit: number = 10, 
  enabled: boolean = true
): RecentAddressesQueryResult => {
  return useRecentAddresses({
    type: 'delivery',
    limit,
    enabled
  });
};

/**
 * 최근 주소 캐시 무효화 유틸리티 훅
 * 
 * @description
 * 새로운 주문 등록 후 최근 주소 캐시를 무효화할 때 사용
 */
export const useInvalidateRecentAddresses = () => {
  const { user } = useAuthStore();
  
  return {
    /**
     * 특정 타입의 최근 주소 캐시 무효화
     */
    invalidateByType: (type: 'pickup' | 'delivery') => {
      // React Query의 queryClient.invalidateQueries를 사용
      // 이 기능은 실제 구현 시 QueryClient 접근이 필요합니다
      console.log(`[useInvalidateRecentAddresses] ${type} 캐시 무효화 요청`);
    },
    
    /**
     * 모든 최근 주소 캐시 무효화
     */
    invalidateAll: () => {
      console.log('[useInvalidateRecentAddresses] 전체 최근 주소 캐시 무효화 요청');
    }
  };
}; 