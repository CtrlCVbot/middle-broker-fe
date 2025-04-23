import { create } from 'zustand';
import { IBrokerCompanyManager, ManagerRole, ManagerStatus, IBrokerManagerFilter } from '@/types/broker-company';
// API 서비스 임포트 추가
import { BrokerManagerService } from '@/services/broker-company-manager-service';
// 목업 데이터 관련 임포트 주석 처리
/*
import { 
  generateRandomManagers, 
  getManagersByCompanyId,
  addManager as addManagerToMock,
  updateManager as updateManagerInMock,
  changeManagerStatus as changeStatusInMock
} from '@/utils/mockdata/mock-broker-company-managers';
*/

// 목업 데이터 관련 코드 주석 처리
// 실제 프로젝트에서는 모든 업체의 담당자 데이터를 저장하는 전역 상태
// const mockAllManagersData: Record<string, IBrokerCompanyManager[]> = {};

interface BrokerCompanyManagerState {
  // 현재 선택된 업체 ID
  currentCompanyId: string | null;
  
  // 현재 회사의 담당자 목록
  managers: IBrokerCompanyManager[];
  
  // 로딩, 에러 상태
  isLoading: boolean;
  error: string | null;
  
  // 필터 상태
  filter: IBrokerManagerFilter;
  
  // 페이지네이션 상태 추가
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  // 선택된 담당자 ID 목록
  selectedManagerIds: string[];
  
  // 액션: 현재 업체 설정
  setCurrentCompanyId: (companyId: string) => void;
  
  // 액션: 담당자 목록 로드
  loadManagers: (companyId: string) => Promise<void>;
  
  // 액션: 담당자 추가
  addManager: (manager: Omit<IBrokerCompanyManager, 'id' | 'registeredDate'>) => Promise<IBrokerCompanyManager>;
  
  // 액션: 담당자 업데이트
  updateManager: (manager: IBrokerCompanyManager) => Promise<IBrokerCompanyManager | null>;
  
  // 액션: 담당자 상태 변경
  changeManagerStatus: (managerId: string, newStatus: ManagerStatus, reason?: string) => Promise<IBrokerCompanyManager | null>;
  
  // 액션: 필터링 설정
  setFilter: (filter: Partial<BrokerCompanyManagerState['filter']>) => void;
  
  // 액션: 선택된 담당자 설정
  setSelectedManagerIds: (ids: string[]) => void;
  toggleManagerSelection: (id: string) => void;
  clearSelection: () => void;
  
  // 액션: 페이지 변경
  setPage: (page: number) => void;
  
  // 액션: 페이지 크기 변경
  setPageSize: (pageSize: number) => void;
}

export const useBrokerCompanyManagerStore = create<BrokerCompanyManagerState>((set, get) => ({
  // 초기 상태
  currentCompanyId: null,
  managers: [],
  isLoading: false,
  error: null,
  filter: {
    searchTerm: '',
    roles: [],
    status: '',
    showInactive: false,
    page: 1,
    pageSize: 10,
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  selectedManagerIds: [],
  
  // 액션: 현재 업체 설정
  setCurrentCompanyId: (companyId) => {
    set({ currentCompanyId: companyId });
    get().loadManagers(companyId);
  },
  
  // 액션: 담당자 목록 로드
  loadManagers: async (companyId) => {
    set({ isLoading: true, error: null });
    
    try {
      // 필터 정보 가져오기
      const filter = get().filter;
      
      // API 호출로 대체
      const response = await BrokerManagerService.getManagers(companyId, filter);
      
      // 상태 업데이트
      set({ 
        managers: response.data,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '담당자 목록을 불러오는 중 오류가 발생했습니다.', 
        isLoading: false 
      });
      console.error('[담당자 목록 로드 오류]', error);
    }
  },
  
  // 액션: 담당자 추가
  addManager: async (manager) => {
    set({ isLoading: true, error: null });
    
    try {
      // API 호출로 대체
      const newManager = await BrokerManagerService.createManager(manager);
      
      // 현재 업체의 담당자 목록 업데이트
      if (get().currentCompanyId === manager.companyId) {
        set(state => ({ 
          managers: [...state.managers, newManager],
          isLoading: false 
        }));
      } else {
        set({ isLoading: false });
      }
      
      return newManager;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '담당자를 추가하는 중 오류가 발생했습니다.', 
        isLoading: false 
      });
      console.error('[담당자 추가 오류]', error);
      throw error;
    }
  },
  
  // 액션: 담당자 업데이트
  updateManager: async (manager) => {
    set({ isLoading: true, error: null });
    
    try {
      // API 호출로 대체
      const updatedManager = await BrokerManagerService.updateManager(manager);
      
      // 현재 업체의 담당자 목록 업데이트
      if (get().currentCompanyId === manager.companyId) {
        set(state => ({ 
          managers: state.managers.map(m => m.id === manager.id ? updatedManager : m),
          isLoading: false 
        }));
      } else {
        set({ isLoading: false });
      }
      
      return updatedManager;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '담당자 정보를 업데이트하는 중 오류가 발생했습니다.', 
        isLoading: false 
      });
      console.error('[담당자 업데이트 오류]', error);
      throw error;
    }
  },
  
  // 액션: 담당자 상태 변경
  changeManagerStatus: async (managerId, newStatus, reason) => {
    set({ isLoading: true, error: null });
    
    try {
      const companyId = get().currentCompanyId;
      
      if (!companyId) {
        throw new Error('선택된 업체가 없습니다.');
      }
      
      // API 호출로 대체
      const updatedManager = await BrokerManagerService.changeManagerStatus(managerId, newStatus, reason);
      
      // 현재 업체의 담당자 목록 업데이트
      set(state => ({
        managers: state.managers.map(m => m.id === managerId ? updatedManager : m),
        isLoading: false
      }));
      
      return updatedManager;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '담당자 상태를 변경하는 중 오류가 발생했습니다.', 
        isLoading: false 
      });
      console.error('[담당자 상태 변경 오류]', error);
      throw error;
    }
  },
  
  // 액션: 필터링 설정
  setFilter: (filter) => {
    set((state) => {
      // roles가 undefined로 들어오면 빈 배열로 대체
      const nextRoles = filter.roles === undefined ? state.filter.roles : filter.roles ?? [];
      return {
        filter: {
          ...state.filter,
          ...filter,
          roles: nextRoles,
        },
        pagination: {
          ...state.pagination,
          page: 1, // 필터 변경 시 1페이지로 이동
        },
      };
    });
  },
  
  // 액션: 선택된 담당자 설정
  setSelectedManagerIds: (ids) => {
    set({ selectedManagerIds: ids });
  },
  
  toggleManagerSelection: (id) => {
    set(state => {
      const isSelected = state.selectedManagerIds.includes(id);
      return {
        selectedManagerIds: isSelected
          ? state.selectedManagerIds.filter(selectedId => selectedId !== id)
          : [...state.selectedManagerIds, id]
      };
    });
  },
  
  clearSelection: () => {
    set({ selectedManagerIds: [] });
  },
  
  // 액션: 페이지 변경
  setPage: (page) => {
    set(state => ({
      filter: { ...state.filter, page },
      pagination: { ...state.pagination, page }
    }));
    
    // 페이지 변경 시 데이터 다시 로드
    const companyId = get().currentCompanyId;
    if (companyId) {
      get().loadManagers(companyId);
    }
  },
  
  // 액션: 페이지 크기 변경
  setPageSize: (pageSize) => {
    set(state => ({
      filter: { ...state.filter, pageSize, page: 1 },
      pagination: { ...state.pagination, pageSize, page: 1 }
    }));
    
    // 페이지 크기 변경 시 첫 페이지로 초기화하고 데이터 다시 로드
    const companyId = get().currentCompanyId;
    if (companyId) {
      get().loadManagers(companyId);
    }
  }
})); 