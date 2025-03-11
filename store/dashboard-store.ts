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
  statusStats: IStatusStat[];
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
  initDashboard: () => {
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
      
      // 백엔드 API 대신 목업 데이터 사용
      const kpi = getKpiData();
      const statusStats = getStatusStats();
      const logs = getStatusLogs();
      const trendData = getTrendData(trendPeriod);
      const regionStats = getRegionStats();
      const weightStats = getWeightStats();
      const recentOrders = getRecentOrders();
      
      // 데이터 설정
      set({ 
        kpi, 
        statusStats, 
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
  
  // 액션: 로그 새로고침 (실시간 로그 업데이트 시뮬레이션)
  refreshLogs: () => {
    try {
      // 현재 로그 가져오기
      const currentLogs = [...get().logs];
      
      // 새 로그 생성
      const newLog = generateNewLog();
      
      // 로그 목록 앞에 새 로그 추가 (최대 10개 유지)
      const updatedLogs = [newLog, ...currentLogs.slice(0, 9)];
      
      // 업데이트된 로그 설정
      set({ logs: updatedLogs });
    } catch (error) {
      console.error('로그 업데이트 중 오류 발생:', error);
    }
  },
  
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