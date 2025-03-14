import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DriverStatus, IBrokerDriver, IBrokerDriverFilter, TonnageType, VehicleType } from '@/types/broker-driver';
import { DRIVER_STATUS, DISPATCH_COUNT_OPTIONS, TONNAGE_TYPES, VEHICLE_TYPES, getBrokerDriverById, updateBrokerDriver } from '@/utils/mockdata/mock-broker-drivers';

// 필터 요약 문구 생성 함수
export const getFilterSummaryText = (filter: IBrokerDriverFilter): string => {
  if (!filter.searchTerm && !filter.vehicleType && !filter.tonnage && 
      !filter.status && !filter.dispatchCount && !filter.startDate && !filter.endDate) {
    return "모든 차주";
  }
  
  const parts = [];
  
  if (filter.searchTerm) {
    parts.push(`'${filter.searchTerm}' 검색결과`);
  }
  
  if (filter.vehicleType) {
    parts.push(`${filter.vehicleType} 차량`);
  }
  
  if (filter.tonnage) {
    parts.push(`${filter.tonnage} 차량`);
  }
  
  if (filter.status) {
    parts.push(filter.status === '활성' ? '활성 차주' : '비활성 차주');
  }
  
  if (filter.dispatchCount) {
    parts.push(filter.dispatchCount);
  }
  
  if (filter.startDate && filter.endDate) {
    parts.push(`${filter.startDate} ~ ${filter.endDate}`);
  } else if (filter.startDate) {
    parts.push(`${filter.startDate} 이후`);
  } else if (filter.endDate) {
    parts.push(`${filter.endDate} 이전`);
  }
  
  return parts.join(', ');
};

// 스토어 인터페이스 정의
interface IBrokerDriverState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: IBrokerDriverFilter;
  tempFilter: IBrokerDriverFilter; // 임시 필터 (적용 전)
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 선택된 차주 ID 목록
  selectedDriverIds: string[];
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<IBrokerDriverFilter>) => void;
  setTempFilter: (filter: Partial<IBrokerDriverFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedDriverIds: (ids: string[]) => void;
  toggleDriverSelection: (id: string) => void;
  clearSelectedDriverIds: () => void;
  
  // 차주 데이터 관리
  updateDriver: (driver: IBrokerDriver) => void;
  
  // 필터 옵션
  filterOptions: {
    vehicleTypes: VehicleType[];
    tonnageTypes: TonnageType[];
    statuses: DriverStatus[];
    dispatchCountOptions: typeof DISPATCH_COUNT_OPTIONS;
  };
}

// 목업 데이터 저장소 (실제 구현에서는 API 호출로 대체)
let mockDriversData: IBrokerDriver[] = [];

// Zustand 스토어 생성
export const useBrokerDriverStore = create<IBrokerDriverState>()(
  persist(
    (set, get) => ({
      // 기본 상태
      viewMode: 'table',
      filter: {
        searchTerm: '',
        vehicleType: '',
        tonnage: '',
        status: '',
        dispatchCount: '',
        startDate: null,
        endDate: null,
      },
      tempFilter: {
        searchTerm: '',
        vehicleType: '',
        tonnage: '',
        status: '',
        dispatchCount: '',
        startDate: null,
        endDate: null,
      },
      currentPage: 1,
      pageSize: 10,
      selectedDriverIds: [],
      
      // 필터 옵션
      filterOptions: {
        vehicleTypes: VEHICLE_TYPES,
        tonnageTypes: TONNAGE_TYPES,
        statuses: DRIVER_STATUS,
        dispatchCountOptions: DISPATCH_COUNT_OPTIONS,
      },
      
      // 액션 메서드
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setFilter: (newFilter) => set((state) => ({
        filter: { ...state.filter, ...newFilter },
        currentPage: 1, // 필터 변경 시 1페이지로 이동
      })),
      
      setTempFilter: (newFilter) => set((state) => ({
        tempFilter: { ...state.tempFilter, ...newFilter },
      })),
      
      applyTempFilter: () => set((state) => ({
        filter: { ...state.tempFilter },
        currentPage: 1, // 필터 적용 시 1페이지로 이동
      })),
      
      resetFilter: () => set({
        filter: {
          searchTerm: '',
          vehicleType: '',
          tonnage: '',
          status: '',
          dispatchCount: '',
          startDate: null,
          endDate: null,
        },
        currentPage: 1,
      }),
      
      resetTempFilter: () => set((state) => ({
        tempFilter: { ...state.filter },
      })),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setPageSize: (size) => set({ 
        pageSize: size,
        currentPage: 1, // 페이지 크기 변경 시 1페이지로 이동
      }),
      
      setSelectedDriverIds: (ids) => set({ selectedDriverIds: ids }),
      
      toggleDriverSelection: (id) => set((state) => {
        const isSelected = state.selectedDriverIds.includes(id);
        
        return {
          selectedDriverIds: isSelected
            ? state.selectedDriverIds.filter(driverId => driverId !== id)
            : [...state.selectedDriverIds, id],
        };
      }),
      
      clearSelectedDriverIds: () => set({ selectedDriverIds: [] }),
      
      // 차주 데이터 업데이트
      updateDriver: (updatedDriver) => {
        try {
          // 목업 데이터 업데이트
          updateBrokerDriver(updatedDriver);
          
          // 선택된 차주 ID 목록에서 해당 차주가 있으면 유지
          set((state) => ({
            selectedDriverIds: state.selectedDriverIds.includes(updatedDriver.id)
              ? state.selectedDriverIds
              : state.selectedDriverIds
          }));
        } catch (error) {
          console.error('차주 정보 업데이트 실패:', error);
        }
      },
    }),
    {
      name: 'broker-driver-storage',
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        filter: state.filter,
        pageSize: state.pageSize
      }),
    }
  )
); 