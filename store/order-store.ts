import { create } from 'zustand';
import { IOrderFilter } from '@/types/order';
import { 
  CITIES, 
  VEHICLE_TYPES, 
  WEIGHT_TYPES 
} from '@/utils/mockdata/mock-orders';
import { persist } from 'zustand/middleware';

// 필터 옵션의 기본값 정의 (import가 실패하는 경우를 대비)
const DEFAULT_CITIES = CITIES || ["서울", "부산", "인천", "대구", "대전", "광주", "울산", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const DEFAULT_VEHICLE_TYPES = VEHICLE_TYPES || ["카고", "윙바디", "탑차", "냉장", "냉동", "트레일러"];
const DEFAULT_WEIGHT_TYPES = WEIGHT_TYPES || ["1톤", "2.5톤", "3.5톤", "5톤", "11톤", "25톤"];

// 필터 버튼에 표시할 요약 텍스트 생성 함수
export const getFilterSummaryText = (filter: IOrderFilter): string => {
  if (!filter.departureCity && !filter.arrivalCity && !filter.vehicleType && !filter.weight) {
    return "모든 화물";
  }
  
  const parts = [];
  
  if (filter.departureCity && filter.arrivalCity) {
    parts.push(`${filter.departureCity} → ${filter.arrivalCity}`);
  } else if (filter.departureCity) {
    parts.push(`${filter.departureCity}에서`);
  } else if (filter.arrivalCity) {
    parts.push(`${filter.arrivalCity}으로`);
  }
  
  if (filter.vehicleType) parts.push(filter.vehicleType);
  if (filter.weight) parts.push(filter.weight);
  
  return parts.join(", ") || "모든 화물";
};

interface IOrderState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: IOrderFilter;
  tempFilter: IOrderFilter; // Popover에서 임시로 사용할 필터
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<IOrderFilter>) => void;
  setTempFilter: (filter: Partial<IOrderFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
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

// 화물 관리 스토어 생성 - 로컬 스토리지 지속성 추가
export const useOrderStore = create<IOrderState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      viewMode: 'table',
      filter: { ...initialFilter },
      tempFilter: { ...initialFilter },
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
      
      setFilter: (filter: Partial<IOrderFilter>) => set((state) => ({
        filter: { ...state.filter, ...filter },
        tempFilter: { ...state.tempFilter, ...filter },
        currentPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
      })),
      
      setTempFilter: (filter: Partial<IOrderFilter>) => set((state) => ({
        tempFilter: { ...state.tempFilter, ...filter },
      })),
      
      applyTempFilter: () => set((state) => ({
        filter: { ...state.tempFilter },
        currentPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
      })),
      
      resetFilter: () => set({ 
        filter: { ...initialFilter },
        tempFilter: { ...initialFilter },
        currentPage: 1,
      }),
      
      resetTempFilter: () => set((state) => ({
        tempFilter: { ...state.filter },
      })),
      
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      setPageSize: (size: number) => set({ 
        pageSize: size,
        currentPage: 1, // 페이지 크기가 변경되면 첫 페이지로 돌아감
      }),
    }),
    {
      name: 'order-storage', // 로컬 스토리지 키 이름
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        filter: state.filter,
      }), // 지속할 상태만 선택
    }
  )
); 