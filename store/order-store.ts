import { create } from 'zustand';
import { IOrderFilter } from '@/types/order';
import { 
  CITIES, 
  VEHICLE_TYPES, 
  WEIGHT_TYPES 
} from '@/utils/mockdata/mock-orders';

interface IOrderState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: IOrderFilter;
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<IOrderFilter>) => void;
  resetFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // 필터 옵션
  filterOptions: {
    cities: string[];
    vehicleTypes: string[];
    weightTypes: string[];
  };
}

// 초기 필터 상태
const initialFilter: IOrderFilter = {
  city: undefined,
  vehicleType: undefined,
  weight: undefined,
  searchTerm: ''
};

// 화물 관리 스토어 생성
export const useOrderStore = create<IOrderState>((set) => ({
  // 초기 상태
  viewMode: 'table',
  filter: { ...initialFilter },
  currentPage: 1,
  pageSize: 10,
  
  // 필터 옵션 목록
  filterOptions: {
    cities: CITIES,
    vehicleTypes: VEHICLE_TYPES,
    weightTypes: WEIGHT_TYPES,
  },
  
  // 액션 정의
  setViewMode: (mode: 'table' | 'card') => set({ viewMode: mode }),
  
  setFilter: (filter: Partial<IOrderFilter>) => set((state: IOrderState) => ({
    filter: { ...state.filter, ...filter },
    currentPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
  })),
  
  resetFilter: () => set({ 
    filter: { ...initialFilter },
    currentPage: 1,
  }),
  
  setCurrentPage: (page: number) => set({ currentPage: page }),
  
  setPageSize: (size: number) => set({ 
    pageSize: size,
    currentPage: 1, // 페이지 크기가 변경되면 첫 페이지로 돌아감
  }),
})); 