import { create } from 'zustand';
import { SettlementStatus, ISettlementFilter } from '@/types/settlement';

interface SettlementState {
  // 뷰 모드 (테이블 또는 카드)
  viewMode: 'table' | 'card';
  
  // 현재 페이지와 페이지 크기
  currentPage: number;
  pageSize: number;
  
  // 검색 필터
  filter: ISettlementFilter;
  
  // 선택된 정산 ID
  selectedSettlementId: string | null;
  
  // 상세 정보 시트 열림/닫힘 상태
  isDetailSheetOpen: boolean;
  
  // 검색 패널 열림/닫힘 상태
  isSearchPanelOpen: boolean;
  
  // 액션: 뷰 모드 설정
  setViewMode: (mode: 'table' | 'card') => void;
  
  // 액션: 현재 페이지 설정
  setCurrentPage: (page: number) => void;
  
  // 액션: 페이지 크기 설정
  setPageSize: (size: number) => void;
  
  // 액션: 필터 설정
  setFilter: (filter: Partial<ISettlementFilter>) => void;
  
  // 액션: 필터 초기화
  resetFilter: () => void;
  
  // 액션: 정산 ID 선택
  selectSettlement: (id: string) => void;
  
  // 액션: 상세 정보 시트 열기
  openDetailSheet: () => void;
  
  // 액션: 상세 정보 시트 닫기
  closeDetailSheet: () => void;
  
  // 액션: 검색 패널 열기
  openSearchPanel: () => void;
  
  // 액션: 검색 패널 닫기
  closeSearchPanel: () => void;
}

export const useSettlementStore = create<SettlementState>((set) => ({
  // 초기 상태
  viewMode: 'table',
  currentPage: 1,
  pageSize: 10,
  filter: {
    orderId: undefined,
    departureCity: undefined,
    arrivalCity: undefined,
    driverName: undefined,
    searchTerm: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
  },
  selectedSettlementId: null,
  isDetailSheetOpen: false,
  isSearchPanelOpen: false,
  
  // 액션 구현
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setPageSize: (size) => set({ pageSize: size }),
  
  setFilter: (filter) => 
    set((state) => ({ 
      filter: { ...state.filter, ...filter },
      // 필터 변경 시 첫 페이지로 이동
      currentPage: 1, 
    })),
  
  resetFilter: () => 
    set({ 
      filter: {
        orderId: undefined,
        departureCity: undefined,
        arrivalCity: undefined,
        driverName: undefined,
        searchTerm: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        minAmount: undefined,
        maxAmount: undefined,
      },
      currentPage: 1,
    }),
  
  selectSettlement: (id) => 
    set({ 
      selectedSettlementId: id,
      isDetailSheetOpen: true,
    }),
  
  openDetailSheet: () => set({ isDetailSheetOpen: true }),
  
  closeDetailSheet: () => set({ 
    isDetailSheetOpen: false,
    selectedSettlementId: null,
  }),
  
  openSearchPanel: () => set({ isSearchPanelOpen: true }),
  
  closeSearchPanel: () => set({ isSearchPanelOpen: false }),
})); 