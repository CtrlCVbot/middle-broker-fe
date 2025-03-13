import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IBrokerCompanyFilter, CompanyType, StatementType, CompanyStatus } from '@/types/broker-company';
import { COMPANY_TYPES, STATEMENT_TYPES, COMPANY_STATUS } from '@/utils/mockdata/mock-broker-companies';

// 필터 요약 문구 생성 함수
export const getFilterSummaryText = (filter: IBrokerCompanyFilter): string => {
  if (!filter.searchTerm && !filter.type && !filter.statementType && 
      !filter.status && !filter.startDate && !filter.endDate) {
    return "모든 업체";
  }
  
  const parts = [];
  
  if (filter.searchTerm) {
    parts.push(`'${filter.searchTerm}' 검색결과`);
  }
  
  if (filter.type) {
    parts.push(filter.type);
  }
  
  if (filter.statementType) {
    parts.push(filter.statementType);
  }
  
  if (filter.status) {
    parts.push(filter.status === '활성' ? '활성 업체' : '비활성 업체');
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
interface IBrokerCompanyState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: IBrokerCompanyFilter;
  tempFilter: IBrokerCompanyFilter; // 임시 필터 (적용 전)
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 선택된 업체 ID 목록
  selectedCompanyIds: string[];
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<IBrokerCompanyFilter>) => void;
  setTempFilter: (filter: Partial<IBrokerCompanyFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedCompanyIds: (ids: string[]) => void;
  toggleCompanySelection: (id: string) => void;
  clearSelectedCompanyIds: () => void;
  
  // 필터 옵션
  filterOptions: {
    types: CompanyType[];
    statementTypes: StatementType[];
    statuses: CompanyStatus[];
  };
}

// Zustand 스토어 생성
export const useBrokerCompanyStore = create<IBrokerCompanyState>()(
  persist(
    (set) => ({
      // 기본 상태
      viewMode: 'table',
      filter: {
        searchTerm: '',
        type: '',
        statementType: '',
        status: '',
        startDate: null,
        endDate: null,
      },
      tempFilter: {
        searchTerm: '',
        type: '',
        statementType: '',
        status: '',
        startDate: null,
        endDate: null,
      },
      currentPage: 1,
      pageSize: 10,
      selectedCompanyIds: [],
      
      // 필터 옵션
      filterOptions: {
        types: COMPANY_TYPES,
        statementTypes: STATEMENT_TYPES,
        statuses: COMPANY_STATUS,
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
          type: '',
          statementType: '',
          status: '',
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
      
      setSelectedCompanyIds: (ids) => set({ selectedCompanyIds: ids }),
      
      toggleCompanySelection: (id) => set((state) => {
        const isSelected = state.selectedCompanyIds.includes(id);
        
        return {
          selectedCompanyIds: isSelected
            ? state.selectedCompanyIds.filter(companyId => companyId !== id)
            : [...state.selectedCompanyIds, id],
        };
      }),
      
      clearSelectedCompanyIds: () => set({ selectedCompanyIds: [] }),
    }),
    {
      name: 'broker-company-storage',
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        filter: state.filter,
        pageSize: state.pageSize
      }),
    }
  )
); 