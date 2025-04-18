import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  COMPANY_STATUSES
} from '@/types/company';
import * as companyService from '@/services/company-service';

// 필터 요약 문구 생성 함수
export const getFilterSummaryText = (filter: CompanyFilter): string => {
  if (!filter.keyword && !filter.type && !filter.status && 
      !filter.startDate && !filter.endDate) {
    return "모든 업체";
  }
  
  const parts = [];
  
  if (filter.keyword) {
    parts.push(`'${filter.keyword}' 검색결과`);
  }
  
  if (filter.type) {
    parts.push(COMPANY_TYPE_LABEL[filter.type as CompanyType]);
  }
  
  if (filter.status) {
    parts.push(filter.status === 'active' ? '활성 업체' : '비활성 업체');
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

// Zustand 스토어 생성
export const useCompanyStore = create<ICompanyState>()(
  persist(
    (set, get) => ({
      // 기본 상태
      viewMode: 'table',
      filter: {
        keyword: '',
        type: '',
        status: '',
        region: '',
        startDate: null,
        endDate: null,
      },
      tempFilter: {
        keyword: '',
        type: '',
        status: '',
        region: '',
        startDate: null,
        endDate: null,
      },
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
        filter: {
          keyword: '',
          type: '',
          status: '',
          region: '',
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