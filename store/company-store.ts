import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CompanyFilter, 
  CompanyType, 
  CompanyStatus,
  ICompany,
  CompanyRequest,
  CompanyStatusChangeRequest,
  ILegacyCompany,
  convertApiToLegacyCompany,
  convertLegacyToApiCompany,
  COMPANY_TYPE_LABEL,
  COMPANY_STATUS_LABEL,
  COMPANY_TYPES,
  COMPANY_STATUSES,
  CompanyListResponse
} from '@/types/company';
import * as companyService from '@/services/company-service';
import React from 'react';

// 필터 요약 문구 생성 함수
export const getFilterSummaryText = (filter: CompanyFilter): string => {
  if (!filter.keyword && !filter.type && !filter.status) {
    return "모든 업체";
  }
  
  const parts = [];
  
  if (filter.keyword) {
    parts.push(`'${filter.keyword}' 검색결과`);
  }
  
  if (filter.type) {
    parts.push(filter.type === 'broker' ? '주선사' : 
               filter.type === 'shipper' ? '화주' : '운송사');
  }
  
  if (filter.status) {
    parts.push(filter.status === 'active' ? '활성 업체' : '비활성 업체');
  }
  
  return parts.join(', ');
};

// 스토어 인터페이스 정의
interface ICompanyState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: CompanyFilter;
  tempFilter: CompanyFilter; // 임시 필터 (적용 전)
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 선택된 업체 ID 목록
  selectedCompanyIds: string[];

  // 데이터 로딩 및 에러 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<CompanyFilter>) => void;
  setTempFilter: (filter: Partial<CompanyFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedCompanyIds: (ids: string[]) => void;
  toggleCompanySelection: (id: string) => void;
  clearSelectedCompanyIds: () => void;
  
  // 업체 데이터 관리 (API 연동)
  fetchCompanies: () => Promise<ILegacyCompany[]>;
  fetchCompanyById: (id: string) => Promise<ILegacyCompany | null>;
  createCompany: (company: ILegacyCompany) => Promise<ILegacyCompany | null>;
  updateCompany: (company: ILegacyCompany) => Promise<ILegacyCompany | null>;
  deleteCompany: (id: string) => Promise<boolean>;
  changeCompanyStatus: (id: string, status: 'active' | 'inactive', reason?: string) => Promise<boolean>;
  batchUpdateCompanies: (ids: string[], action: 'activate' | 'deactivate' | 'delete', reason?: string) => Promise<boolean>;
  
  // 레거시 호환을 위한 변환 함수
  getLegacyFormatCompanies: (companies: ICompany[]) => ILegacyCompany[];
  
  // 필터 옵션
  filterOptions: {
    types: readonly CompanyType[];
    statuses: readonly CompanyStatus[];
  };
}

// 기본 필터 상태
const defaultFilter: CompanyFilter = {
  keyword: '',
  type: '',
  status: ''
};

// Zustand 스토어 생성
export const useCompanyStore = create<ICompanyState>()(
  persist(
    (set, get) => ({
      // 기본 상태
      viewMode: 'table',
      filter: { ...defaultFilter },
      tempFilter: { ...defaultFilter },
      currentPage: 1,
      pageSize: 10,
      selectedCompanyIds: [],
      isLoading: false,
      error: null,
      
      // 필터 옵션
      filterOptions: {
        types: COMPANY_TYPES,
        statuses: COMPANY_STATUSES,
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
        filter: { ...defaultFilter },
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
      
      // API 연동 메서드
      fetchCompanies: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { filter, currentPage, pageSize } = get();
          const response = await companyService.getCompanies(currentPage, pageSize, filter);
          
          // API 응답을 레거시 형식으로 변환
          const legacyCompanies = get().getLegacyFormatCompanies(response.data);
          
          set({ isLoading: false });
          
          return legacyCompanies;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체 목록을 불러오는 중 오류가 발생했습니다.' 
          });
          return [];
        }
      },
      
      fetchCompanyById: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const company = await companyService.getCompanyById(id);
          set({ isLoading: false });
          
          // API 응답을 레거시 형식으로 변환
          return convertApiToLegacyCompany(company);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체 정보를 불러오는 중 오류가 발생했습니다.' 
          });
          return null;
        }
      },
      
      createCompany: async (company) => {
        set({ isLoading: true, error: null });
        
        try {
          // 레거시 형식을 API 요청 형식으로 변환
          const requestData = convertLegacyToApiCompany(company, 'system-user-id'); // TODO: 실제 인증된 사용자 ID로 대체
          
          const createdCompany = await companyService.createCompany(requestData);
          set({ isLoading: false });
          
          // API 응답을 레거시 형식으로 변환하여 반환
          return convertApiToLegacyCompany(createdCompany);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체를 등록하는 중 오류가 발생했습니다.' 
          });
          return null;
        }
      },
      
      updateCompany: async (company) => {
        set({ isLoading: true, error: null });
        
        try {
          // 레거시 형식을 API 요청 형식으로 변환
          const requestData = convertLegacyToApiCompany(company, 'system-user-id'); // TODO: 실제 인증된 사용자 ID로 대체
          
          const updatedCompany = await companyService.updateCompany(company.id, requestData);
          set({ isLoading: false });
          
          // API 응답을 레거시 형식으로 변환하여 반환
          return convertApiToLegacyCompany(updatedCompany);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체 정보를 수정하는 중 오류가 발생했습니다.' 
          });
          return null;
        }
      },
      
      deleteCompany: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          await companyService.deleteCompany(id, 'system-user-id'); // TODO: 실제 인증된 사용자 ID로 대체
          set({ isLoading: false });
          
          // 선택된 업체 목록에서 제거
          set((state) => ({
            selectedCompanyIds: state.selectedCompanyIds.filter(companyId => companyId !== id)
          }));
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체를 삭제하는 중 오류가 발생했습니다.' 
          });
          return false;
        }
      },
      
      changeCompanyStatus: async (id, status, reason) => {
        set({ isLoading: true, error: null });
        
        try {
          const requestData: CompanyStatusChangeRequest = {
            status,
            reason,
            requestUserId: 'system-user-id' // TODO: 실제 인증된 사용자 ID로 대체
          };
          
          await companyService.changeCompanyStatus(id, requestData);
          set({ isLoading: false });
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체 상태를 변경하는 중 오류가 발생했습니다.' 
          });
          return false;
        }
      },
      
      batchUpdateCompanies: async (ids, action, reason) => {
        set({ isLoading: true, error: null });
        
        try {
          await companyService.batchUpdateCompanies({
            companyIds: ids,
            action,
            reason
          });
          
          set({ isLoading: false });
          
          // 삭제 작업인 경우 선택된 업체 목록에서 제거
          if (action === 'delete') {
            set((state) => ({
              selectedCompanyIds: state.selectedCompanyIds.filter(id => !ids.includes(id))
            }));
          }
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '업체 일괄 처리 중 오류가 발생했습니다.' 
          });
          return false;
        }
      },
      
      // 레거시 포맷 변환 유틸리티
      getLegacyFormatCompanies: (companies) => {
        return companies.map(company => convertApiToLegacyCompany(company));
      }
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        filter: state.filter,
        pageSize: state.pageSize
      }),
    }
  )
);

// React Query Hooks

// 업체 목록 조회
export const useCompanies = () => {
  const { filter, currentPage, pageSize } = useCompanyStore();
  
  const result = useQuery<CompanyListResponse, Error, CompanyListResponse, [string, CompanyFilter, number, number]>({
    queryKey: ['companies', filter, currentPage, pageSize],
    queryFn: async () => {
      console.log('🔍 업체 목록 조회 요청', {
        page: currentPage,
        pageSize,
        filter: filter ? { ...filter } : 'none',
        timestamp: new Date().toISOString()
      });
      
      const data = await companyService.getCompanies(currentPage, pageSize, filter);
      
      console.log(`✅ 업체 목록 조회 성공: ${data.data.length}개 항목`);
      return data;
    },
    staleTime: 10 * 1000, // 10초만 캐시 유효 (원래는 30초)
    gcTime: 60 * 1000,    // 1분 동안 가비지 컬렉션에서 제외
    refetchOnWindowFocus: true, // 창 포커스 시 새로고침
    refetchOnMount: true,     // 컴포넌트 마운트 시 항상 새로고침
    placeholderData: (oldData) => {
      if (oldData) {
        console.log('🔄 이전 데이터 사용 중', {
          count: oldData.data.length,
          timestamp: new Date().toISOString()
        });
      }
      return oldData;
    }
  });
  
  // 데이터가 변경될 때마다 로그 출력
  React.useEffect(() => {
    if (result.data) {
      console.log(`📊 업체 목록 데이터 갱신됨: ${result.data.data.length}개`);
    }
  }, [result.data]);
  
  return result;
};

// 특정 업체 조회
export const useCompany = (id: string) => {
  return useQuery<ICompany, Error, ICompany, [string, string]>({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyById(id),
    staleTime: 60 * 1000, // 1분 동안 데이터 캐싱
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
};

// 업체 생성 뮤테이션
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CompanyRequest) => companyService.createCompany(data),
    onSuccess: () => {
      // 성공 시 업체 목록 쿼리 무효화하여 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// 업체 수정 뮤테이션
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyRequest }) => 
      companyService.updateCompany(id, data),
    onMutate: async (variables) => {
      // 낙관적 업데이트를 위한 이전 쿼리 데이터 백업
      const prevCompanyData = queryClient.getQueryData(['company', variables.id]);
      const prevCompaniesData = queryClient.getQueryData(['companies']);
      
      console.log('🔄 업체 수정 뮤테이션 시작', {
        id: variables.id,
        timestamp: new Date().toISOString()
      });
      
      return { prevCompanyData, prevCompaniesData };
    },
    onSuccess: (result, variables) => {
      console.log('✅ 업체 수정 성공, 캐시 무효화 시작', { 
        id: variables.id,
        name: result.name
      });
      
      // 강력한 캐시 무효화
      queryClient.removeQueries({ queryKey: ['company', variables.id] });
      queryClient.removeQueries({ queryKey: ['companies'] });
      
      // 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['companies'],
        refetchType: 'all' 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['company', variables.id],
        refetchType: 'all'
      });
      
      // 변경된 데이터 즉시 반영
      queryClient.setQueryData(['company', variables.id], result);
      
      // 추가로 지연된 캐시 재무효화 (때로는 첫 무효화가 충분히 반영되지 않음)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['companies'] });
        queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
        console.log('🔄 지연된 캐시 무효화 완료');
      }, 300);
    },
    onError: (error, variables, context) => {
      console.error('❌ 업체 수정 실패:', error);
      
      // 오류 발생 시 백업 데이터로 복원
      if (context) {
        queryClient.setQueryData(['company', variables.id], context.prevCompanyData);
        queryClient.setQueryData(['companies'], context.prevCompaniesData);
      }
    }
  });
};

// 업체 삭제 뮤테이션
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const { clearSelectedCompanyIds } = useCompanyStore();
  
  return useMutation({
    mutationFn: ({ id, requestUserId }: { id: string; requestUserId: string }) => 
      companyService.deleteCompany(id, requestUserId),
    onSuccess: () => {
      // 성공 시 업체 목록 쿼리 무효화하여 자동 갱신 및 선택 항목 초기화
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      clearSelectedCompanyIds();
    },
  });
};

// 업체 상태 변경 뮤테이션
export const useChangeCompanyStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: CompanyStatus; reason?: string; requestUserId: string } }) => 
      companyService.changeCompanyStatus(id, data),
    onSuccess: (_, variables) => {
      // 성공 시 업체 목록 및 상세 정보 쿼리 무효화하여 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
    },
  });
};

// 업체 배치 처리 뮤테이션
export const useBatchUpdateCompanies = () => {
  const queryClient = useQueryClient();
  const { clearSelectedCompanyIds } = useCompanyStore();
  
  return useMutation({
    mutationFn: (data: { companyIds: string[]; action: 'activate' | 'deactivate' | 'delete'; reason?: string }) => 
      companyService.batchUpdateCompanies(data),
    onSuccess: () => {
      // 성공 시 업체 목록 쿼리 무효화하여 자동 갱신 및 선택 항목 초기화
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      clearSelectedCompanyIds();
    },
  });
};

// 레거시 코드와 호환성을 위한 유틸리티 함수들

// API 응답을 레거시 포맷으로 변환하여 사용할 수 있는 훅
export const useCompaniesLegacyFormat = () => {
  const companiesQuery = useCompanies();
  
  // API 데이터를 레거시 포맷으로 변환
  const legacyData = {
    data: companiesQuery.data ? companiesQuery.data.data.map(convertApiToLegacyCompany) : [],
    total: companiesQuery.data?.total || 0,
    page: companiesQuery.data?.page || 1,
    pageSize: companiesQuery.data?.pageSize || 10,
    totalPages: companiesQuery.data?.totalPages || 1,
  };
  
  return {
    ...companiesQuery,
    legacyData,
  };
}; 