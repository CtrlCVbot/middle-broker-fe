import { IKPI } from '@/types/dashboard';
import { IStatusCount, IGroupStat, GROUPED_ORDER_FLOW, GroupLabel } from '@/types/order';

/**
 * Dashboard KPI 서비스
 * 실데이터 기반 KPI 조회 기능
 */

export interface IFetchKpiParams {
  companyId: string;
  date?: string;           // YYYY-MM-DD (KST 기준일)
  period?: 'month' | 'custom';
  basisField?: 'pickupDate' | 'deliveryDate';
  from?: string;           // ISO when custom
  to?: string;             // ISO when custom
  signal?: AbortSignal;
}

export interface IFetchKpiResponse {
  success: boolean;
  data?: IKPI;
  error?: string;
}

/**
 * KPI 데이터 조회
 * @param params 조회 파라미터
 * @returns KPI 데이터 또는 에러
 */
export async function fetchKpiData(params: IFetchKpiParams): Promise<IFetchKpiResponse> {
  try {
    const { companyId, date, period = 'month', basisField = 'pickupDate', from, to, signal } = params;
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      companyId,
      period,
      basisField
    });
    
    if (period === 'month') {
      queryParams.set('date', date || new Date().toISOString().slice(0, 10));
    } else if (period === 'custom' && from && to) {
      queryParams.set('from', from);
      queryParams.set('to', to);
    }
    
    // API 호출
    const response = await fetch(`/api/dashboard/kpi?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
      cache: 'no-store' // 항상 최신 데이터
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch KPI data');
    }
    
    return {
      success: true,
      data: result.data
    };
    
  } catch (error) {
    console.error('KPI 데이터 조회 실패:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 상태별 통계를 그룹별로 변환하는 함수
 * @param byStatus 상태별 통계 데이터
 * @returns 그룹별 통계 데이터
 */
function toGroups(byStatus: IStatusCount[]): IGroupStat[] {
  const groupMap = new Map<GroupLabel, Set<string>>(
    GROUPED_ORDER_FLOW.map(g => [g.label, new Set(g.statuses)])
  );
  
  const sums = new Map<GroupLabel, number>();
  GROUPED_ORDER_FLOW.forEach(g => sums.set(g.label, 0));

  byStatus.forEach(({ status, count }) => {
    for (const [label, set] of groupMap) {
      if (set.has(status)) {
        sums.set(label, (sums.get(label) || 0) + count);
        break;
      }
    }
  });
  
  const total = Array.from(sums.values()).reduce((a, b) => a + b, 0) || 1;
  
  return GROUPED_ORDER_FLOW.map(g => ({
    label: g.label,
    count: sums.get(g.label) || 0,
    percentage: Math.round(((sums.get(g.label) || 0) / total) * 1000) / 10, // 소수1자리
  }));
}

export interface IFetchStatusStatsParams {
  companyId: string;
  dateFrom?: string;        // YYYY-MM-DD
  dateTo?: string;          // YYYY-MM-DD
  signal?: AbortSignal;
}

export interface IFetchStatusStatsResponse {
  success: boolean;
  data?: {
    totalCount: number;
    byStatus: IStatusCount[];
    byGroup: IGroupStat[];
  };
  error?: string;
}

/**
 * 배차 상태 통계 데이터 조회
 * @param params 조회 파라미터
 * @returns 상태 통계 데이터 또는 에러
 */
export async function fetchStatusStatsData(params: IFetchStatusStatsParams): Promise<IFetchStatusStatsResponse> {
  try {
    const { companyId, dateFrom, dateTo, signal } = params;
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({ companyId });
    
    if (dateFrom) queryParams.set('dateFrom', dateFrom);
    if (dateTo) queryParams.set('dateTo', dateTo);
    
    // API 호출
    const response = await fetch(`/api/dashboard/status-stats?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
      cache: 'no-store' // 항상 최신 데이터
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch status stats data');
    }
    
    // 그룹별 통계 계산
    const byGroup = toGroups(result.data.byStatus);
    
    return {
      success: true,
      data: {
        totalCount: result.data.totalCount,
        byStatus: result.data.byStatus,
        byGroup
      }
    };
    
  } catch (error) {
    console.error('배차 상태 통계 조회 실패:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}