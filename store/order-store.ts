import { create } from 'zustand';
import { IOrderFilter } from '@/types/order';
import { 
  CITIES, 
  VEHICLE_TYPES, 
  WEIGHT_TYPES 
} from '@/utils/mockdata/mock-orders';

// 필터 옵션의 기본값 정의 (import가 실패하는 경우를 대비)
const DEFAULT_CITIES = CITIES || ["서울", "부산", "인천", "대구", "대전", "광주", "울산", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const DEFAULT_VEHICLE_TYPES = VEHICLE_TYPES || ["카고", "윙바디", "탑차", "냉장", "냉동", "트레일러"];
const DEFAULT_WEIGHT_TYPES = WEIGHT_TYPES || ["1톤", "2.5톤", "3.5톤", "5톤", "11톤", "25톤"];

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
  departureCity: undefined,
  arrivalCity: undefined,
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
    cities: DEFAULT_CITIES,
    vehicleTypes: DEFAULT_VEHICLE_TYPES,
    weightTypes: DEFAULT_WEIGHT_TYPES,
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