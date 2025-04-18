/**
 * @deprecated 이 파일은 레거시 호환성을 위해 유지되고 있습니다.
 * 새로운 코드는 store/company-store.ts를 사용하세요.
 * 
 * 마이그레이션 방법:
 * - useBrokerCompanyStore 대신 useCompanyStore 사용
 * - 데이터 조회는 useCompanies(), useCompany(id) 사용
 * - 업체 수정은 useUpdateCompany() 사용
 * - 업체 생성은 useCreateCompany() 사용
 * - 업체 삭제는 useDeleteCompany() 사용
 * - 업체 상태 변경은 useChangeCompanyStatus() 사용
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IBrokerCompany, IBrokerCompanyFilter, CompanyType, StatementType, CompanyStatus } from '@/types/broker-company';
import { COMPANY_TYPES, STATEMENT_TYPES, COMPANY_STATUS, getBrokerCompanyById, updateBrokerCompany } from '@/utils/mockdata/mock-broker-companies';
import { useCompanyStore, useCompanies, useCompany, useUpdateCompany } from '@/store/company-store';
import { convertApiToLegacyCompany } from '@/types/company';

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
  
  // 업체 데이터 관리
  updateCompany: (company: IBrokerCompany) => void;
  
  // 필터 옵션
  filterOptions: {
    types: CompanyType[];
    statementTypes: StatementType[];
    statuses: CompanyStatus[];
  };
  
  // API 연동 훅 (호환성 추가)
  useCompanyData: () => { 
    data: IBrokerCompany[] | undefined; 
    total: number; 
    isLoading: boolean; 
    isError: boolean; 
    error: any; 
  };
}

// 목업 데이터 저장소 (실제 구현에서는 API 호출로 대체)
let mockCompaniesData: IBrokerCompany[] = [];

// Zustand 스토어 생성
export const useBrokerCompanyStore = create<IBrokerCompanyState>()(
  persist(
    (set, get) => ({
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
      
      // 업체 데이터 업데이트
      updateCompany: (updatedCompany) => {
        try {
          // 목업 데이터 업데이트 (이제 API 호출로 대체됨)
          updateBrokerCompany(updatedCompany);
          
          // 선택된 업체 ID 목록에서 해당 업체가 있으면 유지
          set((state) => ({
            selectedCompanyIds: state.selectedCompanyIds.includes(updatedCompany.id)
              ? state.selectedCompanyIds
              : state.selectedCompanyIds
          }));
        } catch (error) {
          console.error('업체 정보 업데이트 실패:', error);
        }
      },
      
      // API 연동을 위한 호환성 메서드 (React Query 사용)
      useCompanyData: () => {
        // 새 스토어의 데이터 훅 사용
        const result = useCompanies();
        
        // 데이터를 레거시 형식으로 변환
        const legacyData = result.data ? result.data.data.map(convertApiToLegacyCompany) : undefined;
        
        return {
          data: legacyData,
          total: result.data?.total || 0,
          isLoading: result.isLoading,
          isError: result.isError,
          error: result.error,
        };
      },
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

// 데이터 조회를 위한 호환성 레이어
export const useBrokerCompanyData = () => {
  const { currentPage, pageSize, filter } = useBrokerCompanyStore();
  
  // 새 스토어의 데이터 조회 훅 사용
  const companiesQuery = useCompanies();
  
  // API 응답 데이터를 레거시 형식으로 변환
  const legacyData = companiesQuery.data ? companiesQuery.data.data.map(convertApiToLegacyCompany) : [];
  
  return {
    data: legacyData,
    total: companiesQuery.data?.total || 0,
    page: companiesQuery.data?.page || currentPage,
    pageSize: companiesQuery.data?.pageSize || pageSize,
    totalPages: companiesQuery.data?.totalPages || 1,
    isLoading: companiesQuery.isLoading,
    isError: companiesQuery.isError,
    error: companiesQuery.error,
    refetch: companiesQuery.refetch,
  };
};

// 단일 업체 조회를 위한 호환성 레이어
export const useBrokerCompanyById = (id: string) => {
  // 새 스토어의 단일 조회 훅 사용
  const companyQuery = useCompany(id);
  
  // API 응답 데이터를 레거시 형식으로 변환
  const legacyData = companyQuery.data ? convertApiToLegacyCompany(companyQuery.data) : undefined;
  
  return {
    data: legacyData,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
  };
}; 