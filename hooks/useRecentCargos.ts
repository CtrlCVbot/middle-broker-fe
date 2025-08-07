import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CargoService } from '@/services/cargo-service';
import { ICargo } from '@/types/order';

// 훅 옵션 인터페이스
interface UseRecentCargosOptions {
  companyId: string;
  limit?: number;
  enabled?: boolean;
}

// 쿼리 결과 타입
interface RecentCargosQueryResult {
  data: ICargo[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * 최근 사용 화물 조회 커스텀 훅
 * 
 * @description
 * - 로그인한 사용자의 회사에서 최근 사용한 화물 정보 목록을 조회합니다
 * - 중복 제거된 결과를 반환합니다
 * - React Query를 사용하여 캐싱 및 백그라운드 업데이트를 지원합니다
 * 
 * @param options 훅 옵션
 * @param options.companyId 회사 ID (필수)
 * @param options.limit 조회할 화물 개수 (기본값: 5, 최대: 20)
 * @param options.enabled 쿼리 활성화 여부 (기본값: true)
 * 
 * @returns 쿼리 결과 객체
 * 
 * @example
 * ```tsx
 * // 최근 화물 조회
 * const { data: recentCargos, isLoading, error } = useRecentCargos({
 *   companyId: 'company-123',
 *   limit: 5
 * });
 * 
 * // 조건부 조회
 * const { data: recentCargos, isLoading } = useRecentCargos({
 *   companyId: 'company-123',
 *   limit: 10,
 *   enabled: isFormVisible
 * });
 * ```
 */
export const useRecentCargos = (options: UseRecentCargosOptions): RecentCargosQueryResult => {
  const { companyId, limit = 5, enabled = true } = options;

  // 쿼리 키 생성 - 회사 ID와 limit을 포함
  const queryKey = ['recent-cargos', companyId, limit];
  console.log('queryKey', queryKey);

  // React Query 설정
  const queryResult: UseQueryResult<ICargo[], Error> = useQuery({
    queryKey,
    queryFn: () => CargoService.getRecentCargos(companyId, limit),
    enabled: enabled && !!companyId,
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
 * 최근 화물 캐시 무효화 유틸리티 훅
 * 
 * @description
 * 새로운 주문 등록 후 최근 화물 캐시를 무효화할 때 사용
 */
export const useInvalidateRecentCargos = () => {
  return {
    /**
     * 최근 화물 캐시 무효화
     */
    invalidate: () => {
      // React Query의 queryClient.invalidateQueries를 사용
      // 이 기능은 실제 구현 시 QueryClient 접근이 필요합니다
      console.log('[useInvalidateRecentCargos] 최근 화물 캐시 무효화 요청');
    }
  };
}; 