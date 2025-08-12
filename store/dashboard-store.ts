import { create } from 'zustand';
import { 
  IKPI, 
  IStatusStat, 
  IStatusLog, 
  ITrendDataPoint, 
  IRegionStats, 
  IWeightStat, 
  IRecentOrder,
  getKpiData,
  getStatusStats,
  getStatusLogs,
  getTrendData,
  getRegionStats,
  getWeightStats,
  getRecentOrders,
  generateNewLog
} from '@/utils/mockdata/mock-dashboard';
import { fetchOrderChangeLogsByCompanyId } from '@/services/order-service';
import { getCurrentUser } from '@/utils/auth';
import { IOrderChangeLog } from '@/types/broker-order';
import { fetchKpiData } from '@/services/dashboard-service';
// SWR로 대체되어 제거됨
// import { fetchStatusStatsData } from '@/services/dashboard-service';
import { ymd } from '@/lib/date-kst';
import { toast } from '@/components/ui/use-toast';
import { IGroupStat, IStatusCount } from '@/types/order';

// IOrderChangeLog를 IStatusLog로 변환하는 함수
const mapOrderChangeLogToStatusLog = (changeLog: IOrderChangeLog): IStatusLog => {
  // changeType을 기반으로 적절한 상태 매핑
  const getStatusFromChangeType = (changeType: string, newData?: any): string => {
    switch (changeType) {
      case 'create':
        return '요청';
      case 'updateStatus':
        return '상태변경';
      case 'updateDispatch':
        return '배차정보변경';
      case 'updatePrice':
      case 'updatePriceSales':
      case 'updatePricePurchase':
        return '운임변경';
      case 'cancel':
      case 'delete':
        return '취소';
      default:
        return '요청';
    }
  };

  // changeType을 기반으로 설명 생성
  const getDescriptionFromChangeType = (changeType: string, reason?: string): string => {
    if (reason) return reason;
    
    switch (changeType) {
      case 'create':
        return '새 화물이 등록되었습니다';
      case 'updateStatus':
        return '화물 상태가 변경되었습니다';
      case 'updateDispatch':
        return '배차 정보가 업데이트되었습니다';
      case 'updatePrice':
        return '운임 정보가 변경되었습니다';
      case 'updatePriceSales':
        return '청구금이 변경되었습니다';
      case 'updatePricePurchase':
        return '배차금이 변경되었습니다';
      case 'cancel':
        return '화물이 취소되었습니다';
      case 'delete':
        return '화물이 삭제되었습니다';
      default:
        return '화물 정보가 변경되었습니다';
    }
  };

  const currentStatus = getStatusFromChangeType(changeLog.changeType, changeLog.newData);
  const previousStatus = changeLog.oldData?.flowStatus || null;

  return {
    id: changeLog.id,
    orderNumber: changeLog.orderId.slice(0, 8), // UUID를 짧게 표시
    timestamp: changeLog.changedAt,
    previousStatus: previousStatus as any,
    currentStatus: currentStatus as any,
    description: getDescriptionFromChangeType(changeLog.changeType, changeLog.reason),
    operator: changeLog.changedBy.name
  };
};

// 실제 변경 이력 데이터를 가져오는 함수
const fetchRealChangeLogData = async (): Promise<IStatusLog[]> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser?.companyId) {
      console.warn('사용자 정보 또는 회사 ID가 없습니다.');
      return [];
    }

    const response = await fetchOrderChangeLogsByCompanyId(currentUser.companyId);
    
    if (response.data && Array.isArray(response.data)) {
      // 최신 10개 이력만 가져와서 변환
      return response.data
        .slice(0, 10)
        .map((changeLog: IOrderChangeLog) => mapOrderChangeLogToStatusLog(changeLog));
    }
    
    return [];
  } catch (error) {
    console.error('변경 이력 데이터 조회 중 오류 발생:', error);
    // 에러 발생 시 목업 데이터 사용
    return getStatusLogs();
  }
};

// 대시보드 필터 타입 정의
export type TrendPeriod = 7 | 30;
export type RegionType = 'departure' | 'destination';

// 대시보드 필터 상태 인터페이스
interface IDashboardFilters {
  trendPeriod: TrendPeriod;
  regionType: RegionType;
  statusFilter: string | null;
  autoRefresh: boolean;
}

// 대시보드 로딩 상태 인터페이스
interface IDashboardLoading {
  kpi: boolean;
  statusStats: boolean;
  logs: boolean;
  trends: boolean;
  regions: boolean;
  weights: boolean;
  recentOrders: boolean;
}

// 대시보드 상태 인터페이스
interface IDashboardState {
  // 데이터 상태
  kpi: IKPI | null;
  statusStats: IGroupStat[];  // 그룹별 통계로 변경
  rawByStatus: IStatusCount[]; // 원본 상태별 통계
  logs: IStatusLog[];
  trendData: ITrendDataPoint[];
  regionStats: IRegionStats | null;
  weightStats: IWeightStat[];
  recentOrders: IRecentOrder[];
  
  // 필터 상태
  filters: IDashboardFilters;
  
  // 로딩 상태
  loading: IDashboardLoading;
  error: string | null;
  
  // 액션
  initDashboard: () => void;
  refreshDashboard: () => void;
  refreshLogs: () => void;
  fetchKpi: (params: {
    companyId: string;
    date?: string;
    period?: 'month' | 'custom';
    basisField?: 'pickupDate' | 'deliveryDate';
    from?: string;
    to?: string;
    signal?: AbortSignal;
  }) => Promise<void>;
  // SWR로 대체되어 제거됨
  // fetchStatusStats: (params: {
  //   companyId: string;
  //   dateFrom?: string;
  //   dateTo?: string;
  //   signal?: AbortSignal;
  // }) => Promise<void>;
  setTrendPeriod: (period: TrendPeriod) => void;
  setRegionType: (type: RegionType) => void;
  setStatusFilter: (status: string | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
}

// 초기 필터 상태
const initialFilters: IDashboardFilters = {
  trendPeriod: 7,
  regionType: 'departure',
  statusFilter: null,
  autoRefresh: true
};

// 초기 로딩 상태
const initialLoading: IDashboardLoading = {
  kpi: false,
  statusStats: false,
  logs: false,
  trends: false,
  regions: false,
  weights: false,
  recentOrders: false
};

// 대시보드 상태 스토어 생성
export const useDashboardStore = create<IDashboardState>((set, get) => ({
  // 초기 데이터 상태
  kpi: null,
  statusStats: [],
  rawByStatus: [],
  logs: [],
  trendData: [],
  regionStats: null,
  weightStats: [],
  recentOrders: [],
  
  // 초기 필터 상태
  filters: { ...initialFilters },
  
  // 초기 로딩 상태
  loading: { ...initialLoading },
  error: null,
  
  // 액션: 대시보드 초기화
  initDashboard: async () => {
    // 로딩 상태 설정
    set({ 
      loading: {
        kpi: true,
        statusStats: true,
        logs: true,
        trends: true,
        regions: true,
        weights: true,
        recentOrders: true
      },
      error: null
    });
    
    try {
      // 데이터 로드
      const { trendPeriod, regionType } = get().filters;
      
      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      
      // KPI 실데이터 조회 (사용자가 로그인되어 있고 회사 ID가 있는 경우)
      let kpi: IKPI;
      if (currentUser?.companyId) {
        try {
          const result = await fetchKpiData({
            companyId: currentUser.companyId,
            period: 'month',
            date: ymd(new Date()),
            basisField: 'pickupDate'
          });
          
          if (result.success && result.data) {
            kpi = result.data;
          } else {
            console.warn('KPI 실데이터 조회 실패, 목업 데이터 사용:', result.error);
            kpi = getKpiData();
          }
        } catch (error) {
          console.error('KPI 실데이터 조회 중 오류:', error);
          kpi = getKpiData(); // 에러 시 목업 데이터 사용
        }
      } else {
        toast({
          title: "KPI 데이터 조회 실패",
          description: "사용자 정보 또는 회사 ID가 없어 데이터가져오지 못함",
          variant: "destructive",
        });
        console.warn('사용자 정보 또는 회사 ID가 없어 데이터가져오지 못함');
        kpi = getKpiData();
      }
      
      // 현재 사용자 정보 가져오기 (상태 통계용)
      const currentUserForStats = getCurrentUser();
      
      // SWR로 대체되어 제거됨 - 컴포넌트에서 직접 SWR 훅 사용
      // 상태 통계 실데이터 조회 (목업 데이터 완전 제거)
      let statusStats: IGroupStat[] = [];
      let rawByStatus: IStatusCount[] = [];
      
      // SWR로 대체되어 더 이상 스토어에서 관리하지 않음
      // 컴포넌트에서 useStatusStats 훅을 직접 사용
      
      // 기타 목업 데이터
      const trendData = getTrendData(trendPeriod);
      const regionStats = getRegionStats();
      const weightStats = getWeightStats();
      const recentOrders = getRecentOrders();
      
      // 실제 변경 이력 데이터 조회
      const logs = await fetchRealChangeLogData();

      console.log("statusStats!!", statusStats);
      
      // 데이터 설정
      set({ 
        kpi, 
        statusStats, 
        rawByStatus,
        logs, 
        trendData,
        regionStats,
        weightStats,
        recentOrders,
        loading: { ...initialLoading },
        error: null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '대시보드 초기화 중 오류가 발생했습니다.',
        loading: { ...initialLoading }
      });
    }
  },
  
  // 액션: 대시보드 새로고침
  refreshDashboard: () => {
    const { initDashboard } = get();
    initDashboard();
  },
  
  // 액션: 로그 새로고침 (실제 API 데이터 조회)
  refreshLogs: async () => {
    try {
      // 로그 로딩 상태 설정
      set(state => ({
        loading: { ...state.loading, logs: true }
      }));
      
      // 실제 변경 이력 데이터 조회
      const logs = await fetchRealChangeLogData();
      
      // 업데이트된 로그 설정
      set(state => ({ 
        logs,
        loading: { ...state.loading, logs: false }
      }));
    } catch (error) {
      console.error('로그 업데이트 중 오류 발생:', error);
      // 에러 발생 시 로딩 상태만 해제
      set(state => ({
        loading: { ...state.loading, logs: false }
      }));
    }
  },

  // 액션: KPI 데이터 조회 (실데이터)
  fetchKpi: async ({ companyId, date, period = 'month', basisField = 'pickupDate', from, to, signal }) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, kpi: true }, 
      error: null 
    }));

    try {
      const result = await fetchKpiData({
        companyId,
        date,
        period,
        basisField,
        from,
        to,
        signal
      });

      if (result.success && result.data) {
        set(state => ({ 
          ...state, 
          kpi: result.data, 
          loading: { ...state.loading, kpi: false } 
        }));
      } else {
        throw new Error(result.error || 'KPI 데이터 조회 실패');
      }
    } catch (error) {
      console.error('KPI 데이터 조회 중 오류 발생:', error);
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, kpi: false }, 
        error: error instanceof Error ? error.message : 'KPI 데이터 조회 중 오류가 발생했습니다.' 
      }));
    }
    },

  // SWR로 대체되어 제거됨
  // 액션: 배차 상태 통계 데이터 조회 (실데이터)
  // fetchStatusStats: async ({ companyId, dateFrom, dateTo, signal }) => {
  //   set(state => ({ 
  //     ...state, 
  //     loading: { ...state.loading, statusStats: true }, 
  //     error: null 
  //   }));

  //   try {
  //     const result = await fetchStatusStatsData({
  //       companyId,
  //       dateFrom,
  //       dateTo,
  //       signal
  //     });

  //     if (result.success && result.data) {
  //       set(state => ({ 
  //         ...state, 
  //         statusStats: result.data?.byGroup || [],
  //         rawByStatus: result.data?.byStatus || [],
  //         loading: { ...state.loading, statusStats: false } 
  //       }));
  //     } else {
  //       throw new Error(result.error || '배차 상태 통계 데이터 조회 실패');
  //     }
  //   } catch (error) {
  //     console.error('배차 상태 통계 데이터 조회 중 오류 발생:', error);
  //     set(state => ({ 
  //         ...state, 
  //         loading: { ...state.loading, statusStats: false }, 
  //         error: error instanceof Error ? error.message : '배차 상태 통계 데이터 조회 중 오류가 발생했습니다.' 
  //       }));
  //   }
  // },
   
  // 액션: 트렌드 기간 설정
  setTrendPeriod: (period: TrendPeriod) => {
    set(state => ({
      filters: { ...state.filters, trendPeriod: period },
      trendData: getTrendData(period)
    }));
  },
  
  // 액션: 지역 타입 설정 (출발지/도착지)
  setRegionType: (type: RegionType) => {
    set(state => ({
      filters: { ...state.filters, regionType: type }
    }));
  },
  
  // 액션: 상태 필터 설정
  setStatusFilter: (status: string | null) => {
    set(state => ({
      filters: { ...state.filters, statusFilter: status }
    }));
  },
  
  // 액션: 자동 새로고침 설정
  setAutoRefresh: (enabled: boolean) => {
    set(state => ({
      filters: { ...state.filters, autoRefresh: enabled }
    }));
  }
})); 