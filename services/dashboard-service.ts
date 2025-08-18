import { IKPI } from '@/types/dashboard';
import { IRecentOrder } from '@/utils/mockdata/mock-dashboard';
// SWR로 대체되어 제거됨
// import { IStatusCount, IGroupStat, GROUPED_ORDER_FLOW, GroupLabel } from '@/types/order';

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

// SWR로 대체되어 utils/status-group.ts로 이동됨
// /**
//  * 상태별 통계를 그룹별로 변환하는 함수
//  * @param byStatus 상태별 통계 데이터
//  * @returns 그룹별 통계 데이터
//  */
// function toGroups(byStatus: IStatusCount[]): IGroupStat[] {
//   const groupMap = new Map<GroupLabel, Set<string>>(
//     GROUPED_ORDER_FLOW.map(g => [g.label, new Set(g.statuses)])
//   );

//   const sums = new Map<GroupLabel, number>();
//   GROUPED_ORDER_FLOW.forEach(g => sums.set(g.label, 0));

//   byStatus.forEach(({ status, count }) => {
//     for (const [label, set] of groupMap) {
//       if (set.has(status)) {
//         sums.set(label, (sums.get(label) || 0) + count);
//         break;
//       }
//     }
//   });

//   const total = Array.from(sums.values()).reduce((a, b) => a + b, 0) || 1;

//   return GROUPED_ORDER_FLOW.map(g => ({
//     label: g.label,
//     count: sums.get(g.label) || 0,
//     percentage: Math.round(((sums.get(g.label) || 0) / total) * 1000) / 10, // 소수1자리
//   }));
// }

// SWR로 대체되어 hooks/use-status-stats.ts로 이동됨
// export interface IFetchStatusStatsParams {
//   companyId: string;
//   dateFrom?: string;        // YYYY-MM-DD
//   dateTo?: string;          // YYYY-MM-DD
//   signal?: AbortSignal;
// }

// export interface IFetchStatusStatsResponse {
//   success: boolean;
//   data?: {
//     totalCount: number;
//     byStatus: IStatusCount[];
//     byGroup: IGroupStat[];
//   };
//   error?: string;
// }

// /**
//  * 배차 상태 통계 데이터 조회
//  * @param params 조회 파라미터
//  * @returns 상태 통계 데이터 또는 에러
//  */
// export async function fetchStatusStatsData(params: IFetchStatusStatsParams): Promise<IFetchStatusStatsResponse> {
//   try {
//     const { companyId, dateFrom, dateTo, signal } = params;
    
//     // 쿼리 파라미터 구성
//     const queryParams = new URLSearchParams({ companyId });
    
//     if (dateFrom) queryParams.set('dateFrom', dateFrom);
//     if (dateTo) queryParams.set('dateTo', dateTo);
    
//     // API 호출
//     const response = await fetch(`/api/dashboard/status-stats?${queryParams.toString()}`, {
//       method: 'GET',
//       headers: { 'Accept': 'application/json' },
//       signal,
//       cache: 'no-store' // 항상 최신 데이터
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || `HTTP ${response.status}`);
//     }
    
//     const result = await response.json();
    
//     if (!result.success) {
//       throw new Error(result.error || 'Failed to fetch status stats data');
//     }
    
//     // 그룹별 통계 계산
//     const byGroup = toGroups(result.data.byStatus);
    
//     return {
//       success: true,
//       data: {
//         totalCount: result.data.totalCount,
//         byStatus: result.data.byStatus,
//         byGroup
//       }
//     };
    
//   } catch (error) {
//     console.error('배차 상태 통계 조회 실패:', error);
    
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }

/**
 * 대시보드용 최근 화물 목록 조회
 * @param companyId 회사 ID
 * @param limit 조회할 화물 수 (기본값: 3)
 * @returns 최근 화물 목록
 */
export async function fetchRecentOrders(
  companyId: string,
  limit: number = 3
): Promise<{
  success: boolean;
  data?: IRecentOrder[];
  error?: string;
}> {
  try {
    const params = new URLSearchParams({
      page: '1',
      pageSize: limit.toString(),
      companyId: companyId,
      // 최신순으로 정렬하기 위해 추가 파라미터
    });

    const response = await fetch(`/api/orders?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.data && Array.isArray(result.data)) {
      // API 응답을 IRecentOrder 형식으로 변환
      const recentOrders: IRecentOrder[] = result.data.map((order: any) => ({
        id: order.order?.id || order.id,
        orderNumber: order.order?.id?.slice(0, 8) || order.id?.slice(0, 8) || 'N/A',
        status: order.order?.flowStatus || '배차대기',
        departure: {
          address: order.order?.pickupAddressSnapshot?.roadAddress || 
                  order.order?.pickupAddressSnapshot?.address || 
                  '주소 정보 없음'
        },
        destination: {
          address: order.order?.deliveryAddressSnapshot?.roadAddress || 
                  order.order?.deliveryAddressSnapshot?.address || 
                  '주소 정보 없음'
        },
        amount: order.charge?.summary?.totalAmount 
          ? `${new Intl.NumberFormat('ko-KR').format(order.charge.summary.totalAmount)}원`
          : '0원',
        registeredDate: order.order?.createdAt || new Date().toISOString(),
        vehicleType: order.order?.requestedVehicleType || '카고',
        weightType: order.order?.requestedVehicleWeight || '1톤'
      }));

      return {
        success: true,
        data: recentOrders
      };
    }

    return {
      success: false,
      error: '데이터 형식이 올바르지 않습니다.'
    };

  } catch (error) {
    console.error('최근 화물 목록 조회 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '최근 화물 목록 조회 중 오류가 발생했습니다.'
    };
  }
}