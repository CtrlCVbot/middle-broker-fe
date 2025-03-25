import { create } from 'zustand';
import { 
  IIncome, 
  IncomeStatusType, 
  IIncomeResponse, 
  IAdditionalFee,
  IIncomeFilter,
  IIncomeCreateRequest as IIncomeCreateRequestOriginal
} from '@/types/income';
import { 
  getIncomesByPage, 
  getIncomeById,
  createIncome as createIncomeMock
} from '@/utils/mockdata/mock-income';

// 정산 생성 요청 인터페이스
export interface IIncomeCreateRequest {
  orderIds: string[];
  dueDate: Date;
  memo?: string;
  taxFree: boolean;
  hasTax: boolean;
  invoiceNumber?: string;
  paymentMethod: string;
}

// 매출 정산 목록 상태 관리 인터페이스
interface IncomeStoreState {
  // 데이터 상태
  incomes: IIncome[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // 필터 상태
  filter: IIncomeFilter;
  
  // 로딩 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setFilter: (filter: Partial<IIncomeFilter>) => void;
  resetFilter: () => void;
  fetchIncomes: (page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => void;
  
  // 정산 생성 및 관리
  addIncome: (data: IIncomeCreateRequest) => Promise<string>;
  updateIncomeStatus: (incomeId: string, newStatus: IncomeStatusType) => Promise<void>;
  
  // 추가금 관리
  addAdditionalFee: (incomeId: string, fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  removeAdditionalFee: (incomeId: string, feeId: string) => Promise<void>;
  
  // 세금 관리
  setTaxFree: (incomeId: string, isTaxFree: boolean) => Promise<void>;
  
  // 정산 생성
  createIncome: (data: IIncomeCreateRequest) => Promise<void>;
}

// 초기 필터 상태
const initialFilter: IIncomeFilter = {
  status: undefined,
  shipperName: undefined,
  startDate: undefined,
  endDate: undefined,
  searchTerm: undefined,
  invoiceStatus: undefined,
  manager: undefined
};

// 매출 정산 목록 상태 스토어
export const useIncomeStore = create<IncomeStoreState>((set, get) => ({
  // 초기 상태
  incomes: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  filter: initialFilter,
  
  isLoading: false,
  error: null,
  
  // 필터 설정
  setFilter: (newFilter) => {
    // 빈 문자열 필터를 undefined로 변환
    const processedFilter = { ...newFilter } as Partial<IIncomeFilter>;
    
    // 문자열 필드에서 빈 문자열을 undefined로 변환
    Object.keys(processedFilter).forEach(key => {
      const k = key as keyof Partial<IIncomeFilter>;
      if (processedFilter[k] === '') {
        processedFilter[k] = undefined;
      }
    });
    
    set({
      filter: {
        ...get().filter,
        ...processedFilter
      },
      currentPage: 1 // 필터 변경 시 첫 페이지로 이동
    });
  },
  
  // 필터 초기화
  resetFilter: () => {
    set({
      filter: initialFilter,
      currentPage: 1
    });
  },
  
  // 정산 목록 조회
  fetchIncomes: async (page = 1, limit = 10) => {
    console.log('fetchIncomes 호출됨:', page, limit);
    const { filter } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      console.log('목업 데이터 요청 시작...');
      const response = getIncomesByPage(
        page,
        limit,
        { ...filter }  // 모든 필터 옵션을 하나의 객체로 전달
      );
      console.log('목업 데이터 응답 받음:', response.data.length);
      
      set({
        incomes: response.data,
        currentPage: page,
        totalItems: response.pagination.total,
        totalPages: Math.ceil(response.pagination.total / limit),
        isLoading: false
      });
    } catch (error) {
      console.error('정산 목록 조회 오류:', error);
      set({
        error: '정산 목록을 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 페이지 변경
  setPage: (page) => {
    console.log('setPage 호출됨:', page);
    set({ currentPage: page });
  },
  
  // 정산 상태 변경
  updateIncomeStatus: async (incomeId, newStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const incomeIndex = get().incomes.findIndex(income => income.id === incomeId);
      
      if (incomeIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 상태 업데이트
      const updatedIncomes = [...get().incomes];
      updatedIncomes[incomeIndex] = {
        ...updatedIncomes[incomeIndex],
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomes: updatedIncomes,
        isLoading: false
      });
    } catch (error) {
      console.error('정산 상태 변경 오류:', error);
      set({
        error: '정산 상태를 변경하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 추가금 추가
  addAdditionalFee: async (incomeId, fee) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const incomeIndex = get().incomes.findIndex(income => income.id === incomeId);
      
      if (incomeIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 추가금 생성
      const newFee: IAdditionalFee = {
        id: Math.random().toString(36).substring(2, 11), // 간단한 임의 ID
        ...fee,
        createdAt: new Date().toISOString(),
        createdBy: '관리자'
      };
      
      // 정산 정보 업데이트
      const updatedIncomes = [...get().incomes];
      const targetIncome = updatedIncomes[incomeIndex];
      
      // 추가금 추가
      const updatedFees = [...targetIncome.additionalFees, newFee];
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = targetIncome.totalBaseAmount + totalAdditionalAmount;
      const tax = targetIncome.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      updatedIncomes[incomeIndex] = {
        ...targetIncome,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomes: updatedIncomes,
        isLoading: false
      });
    } catch (error) {
      console.error('추가금 추가 오류:', error);
      set({
        error: '추가금을 추가하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 추가금 삭제
  removeAdditionalFee: async (incomeId, feeId) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const incomeIndex = get().incomes.findIndex(income => income.id === incomeId);
      
      if (incomeIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 정산 정보 업데이트
      const updatedIncomes = [...get().incomes];
      const targetIncome = updatedIncomes[incomeIndex];
      
      // 추가금 삭제
      const updatedFees = targetIncome.additionalFees.filter(f => f.id !== feeId);
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = targetIncome.totalBaseAmount + totalAdditionalAmount;
      const tax = targetIncome.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      updatedIncomes[incomeIndex] = {
        ...targetIncome,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomes: updatedIncomes,
        isLoading: false
      });
    } catch (error) {
      console.error('추가금 삭제 오류:', error);
      set({
        error: '추가금을 삭제하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 세금 면제 설정
  setTaxFree: async (incomeId, isTaxFree) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const incomeIndex = get().incomes.findIndex(income => income.id === incomeId);
      
      if (incomeIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 정산 정보 업데이트
      const updatedIncomes = [...get().incomes];
      const targetIncome = updatedIncomes[incomeIndex];
      
      // 세금 계산
      const tax = isTaxFree ? 0 : Math.round(targetIncome.totalAmount * 0.1);
      
      updatedIncomes[incomeIndex] = {
        ...targetIncome,
        isTaxFree,
        tax,
        finalAmount: targetIncome.totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomes: updatedIncomes,
        isLoading: false
      });
    } catch (error) {
      console.error('세금 면제 설정 오류:', error);
      set({
        error: '세금 면제 설정 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 정산 생성
  createIncome: async (data: IIncomeCreateRequest) => {
    console.log('정산 생성 요청:', data);
    
    try {
      // 목업 정산 생성 함수 호출
      await createIncomeMock(data);
      
      // 성공 후 정산 목록 다시 불러오기
      const page = get().currentPage;
      await get().fetchIncomes(page);
      
      console.log('정산이 성공적으로 생성되었습니다.');
      return Promise.resolve();
    } catch (error) {
      console.error('정산 생성 중 오류 발생:', error);
      return Promise.reject(error);
    }
  },
  
  // 정산 생성 함수 추가
  addIncome: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 createIncome 함수 사용
      const newIncome = await createIncomeMock(data);
      
      // 현재 목록이 정산대기 상태를 보여주고 있다면, 목록에 추가
      if (get().filter.status === 'MATCHING') {
        set(state => ({
          incomes: [newIncome, ...state.incomes],
          totalItems: state.totalItems + 1,
          totalPages: Math.ceil((state.totalItems + 1) / state.itemsPerPage),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      // 생성된 정산 ID 반환
      return newIncome.id;
    } catch (error) {
      console.error('정산 생성 오류:', error);
      set({
        error: '정산을 생성하는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return '';
    }
  }
}));

// 정산 상세 정보 관리 인터페이스
interface IncomeDetailStoreState {
  // 데이터 상태
  selectedIncomeId: string | null;
  incomeDetail: IIncome | null;
  isSheetOpen: boolean;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  openSheet: (incomeId: string) => void;
  closeSheet: () => void;
  fetchIncomeDetail: (incomeId: string) => Promise<void>;
  
  // 추가금 관리
  addAdditionalFee: (fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  removeAdditionalFee: (feeId: string) => Promise<void>;
  
  // 세금 관리
  setTaxFree: (isTaxFree: boolean) => Promise<void>;
  
  // 정산 상태 변경
  updateStatus: (newStatus: IncomeStatusType) => Promise<void>;
}

// 정산 상세 정보 스토어
export const useIncomeDetailStore = create<IncomeDetailStoreState>((set, get) => ({
  // 초기 상태
  selectedIncomeId: null,
  incomeDetail: null,
  isSheetOpen: false,
  
  isLoading: false,
  error: null,
  
  // 정산 상세 시트 열기
  openSheet: (incomeId) => {
    set({
      selectedIncomeId: incomeId,
      isSheetOpen: true
    });
    get().fetchIncomeDetail(incomeId);
  },
  
  // 정산 상세 시트 닫기
  closeSheet: () => {
    set({
      isSheetOpen: false,
      selectedIncomeId: null,
      incomeDetail: null
    });
  },
  
  // 정산 상세 정보 조회
  fetchIncomeDetail: async (incomeId) => {
    set({ isLoading: true, error: null });
    
    try {
      // 목업 데이터에서 상세 정보 조회
      const incomeDetail = getIncomeById(incomeId);
      
      if (!incomeDetail) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      set({
        incomeDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('정산 상세 정보 조회 오류:', error);
      set({
        error: '정산 상세 정보를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 추가금 추가
  addAdditionalFee: async (fee) => {
    const { selectedIncomeId, incomeDetail } = get();
    
    if (!selectedIncomeId || !incomeDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 추가금 생성
      const newFee: IAdditionalFee = {
        id: Math.random().toString(36).substring(2, 11), // 간단한 임의 ID
        ...fee,
        createdAt: new Date().toISOString(),
        createdBy: '관리자'
      };
      
      // 추가금 추가
      const updatedFees = [...incomeDetail.additionalFees, newFee];
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = incomeDetail.totalBaseAmount + totalAdditionalAmount;
      const tax = incomeDetail.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      const updatedIncomeDetail = {
        ...incomeDetail,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomeDetail: updatedIncomeDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('추가금 추가 오류:', error);
      set({
        error: '추가금을 추가하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 추가금 삭제
  removeAdditionalFee: async (feeId) => {
    const { selectedIncomeId, incomeDetail } = get();
    
    if (!selectedIncomeId || !incomeDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 추가금 삭제
      const updatedFees = incomeDetail.additionalFees.filter(f => f.id !== feeId);
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = incomeDetail.totalBaseAmount + totalAdditionalAmount;
      const tax = incomeDetail.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      const updatedIncomeDetail = {
        ...incomeDetail,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomeDetail: updatedIncomeDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('추가금 삭제 오류:', error);
      set({
        error: '추가금을 삭제하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 세금 면제 설정
  setTaxFree: async (isTaxFree) => {
    const { selectedIncomeId, incomeDetail } = get();
    
    if (!selectedIncomeId || !incomeDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 세금 계산
      const tax = isTaxFree ? 0 : Math.round(incomeDetail.totalAmount * 0.1);
      
      const updatedIncomeDetail = {
        ...incomeDetail,
        isTaxFree,
        tax,
        finalAmount: incomeDetail.totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        incomeDetail: updatedIncomeDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('세금 면제 설정 오류:', error);
      set({
        error: '세금 면제 설정 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 정산 상태 변경
  updateStatus: async (newStatus) => {
    const { selectedIncomeId, incomeDetail } = get();
    
    if (!selectedIncomeId || !incomeDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 상태 업데이트
      const updatedIncomeDetail = {
        ...incomeDetail,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // 상태가 정산완료인 경우 세금계산서 상태도 변경
      if (newStatus === 'COMPLETED' && incomeDetail.invoiceStatus === '미발행') {
        updatedIncomeDetail.invoiceStatus = '발행대기';
      }
      
      // 상태 반영
      set({
        incomeDetail: updatedIncomeDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('정산 상태 변경 오류:', error);
      set({
        error: '정산 상태를 변경하는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  }
})); 