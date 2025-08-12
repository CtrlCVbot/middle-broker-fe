import { IKPI } from '@/types/dashboard';

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