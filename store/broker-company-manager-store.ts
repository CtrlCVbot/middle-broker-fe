import { create } from 'zustand';
import { IBrokerCompanyManager, ManagerRole, ManagerStatus } from '@/types/broker-company';
import { 
  generateRandomManagers, 
  getManagersByCompanyId,
  addManager as addManagerToMock,
  updateManager as updateManagerInMock,
  changeManagerStatus as changeStatusInMock
} from '@/utils/mockdata/mock-broker-company-managers';

// 실제 프로젝트에서는 모든 업체의 담당자 데이터를 저장하는 전역 상태
const mockAllManagersData: Record<string, IBrokerCompanyManager[]> = {};

interface BrokerCompanyManagerState {
  // 현재 선택된 업체 ID
  currentCompanyId: string | null;
  
  // 현재 회사의 담당자 목록
  managers: IBrokerCompanyManager[];
  
  // 로딩, 에러 상태
  isLoading: boolean;
  error: string | null;
  
  // 필터 상태
  filter: {
    searchTerm: string;
    roles: ManagerRole[];
    status: ManagerStatus | '';
    showInactive: boolean;
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
  changeManagerStatus: (managerId: string, newStatus: ManagerStatus) => Promise<IBrokerCompanyManager | null>;
  
  // 액션: 필터링 설정
  setFilter: (filter: Partial<BrokerCompanyManagerState['filter']>) => void;
  
  // 액션: 선택된 담당자 설정
  setSelectedManagerIds: (ids: string[]) => void;
  toggleManagerSelection: (id: string) => void;
  clearSelection: () => void;
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
      // 실제 구현에서는 API 호출로 대체
      // 목업 데이터에 해당 업체의 담당자가 없으면 랜덤으로 생성
      if (!mockAllManagersData[companyId]) {
        mockAllManagersData[companyId] = generateRandomManagers(companyId, Math.floor(Math.random() * 5) + 1);
      }
      
      const managers = getManagersByCompanyId(companyId, mockAllManagersData);
      
      // 비동기 처리를 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ managers, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '담당자 목록을 불러오는 중 오류가 발생했습니다.', 
        isLoading: false 
      });
    }
  },
  
  // 액션: 담당자 추가
  addManager: async (manager) => {
    set({ isLoading: true, error: null });
    
    try {
      // 실제 구현에서는 API 호출로 대체
      // 비동기 처리를 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newManager = addManagerToMock(manager, mockAllManagersData);
      
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
      throw error;
    }
  },
  
  // 액션: 담당자 업데이트
  updateManager: async (manager) => {
    set({ isLoading: true, error: null });
    
    try {
      // 실제 구현에서는 API 호출로 대체
      // 비동기 처리를 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedManager = updateManagerInMock(manager, mockAllManagersData);
      
      if (!updatedManager) {
        throw new Error('담당자를 찾을 수 없습니다.');
      }
      
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
      throw error;
    }
  },
  
  // 액션: 담당자 상태 변경
  changeManagerStatus: async (managerId, newStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const companyId = get().currentCompanyId;
      
      if (!companyId) {
        throw new Error('선택된 업체가 없습니다.');
      }
      
      // 실제 구현에서는 API 호출로 대체
      // 비동기 처리를 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedManager = changeStatusInMock(managerId, companyId, newStatus, mockAllManagersData);
      
      if (!updatedManager) {
        throw new Error('담당자를 찾을 수 없습니다.');
      }
      
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
      throw error;
    }
  },
  
  // 액션: 필터링 설정
  setFilter: (filter) => {
    set(state => ({
      filter: { ...state.filter, ...filter }
    }));
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
  }
})); 