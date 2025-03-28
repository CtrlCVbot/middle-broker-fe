import { create } from 'zustand';
import { 
  IExpenditure, 
  ExpenditureStatusType, 
  IExpenditureResponse, 
  IAdditionalFee,
  IExpenditureFilter,
  IExpenditureCreateRequest as IExpenditureCreateRequestOriginal
} from '@/types/expenditure';
import { 
  getExpendituresByPage, 
  getExpenditureById,
  createExpenditure as createExpenditureMock
} from '@/utils/mockdata/mock-expenditure';

// 정산 생성 요청 인터페이스
export interface IExpenditureCreateRequest {
  orderIds: string[];
  dueDate: Date;
  memo?: string;
  taxFree: boolean;
  hasTax: boolean;
  invoiceNumber?: string;
  paymentMethod: string;
}

// 매출 정산 목록 상태 관리 인터페이스
interface ExpenditureStoreState {
  // 데이터 상태
  expenditures: IExpenditure[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // 필터 상태
  filter: IExpenditureFilter;
  
  // 로딩 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setFilter: (filter: Partial<IExpenditureFilter>) => void;
  resetFilter: () => void;
  fetchExpenditures: (page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => void;
  
  // 정산 생성 및 관리
  addExpenditure: (data: IExpenditureCreateRequest) => Promise<string>;
  updateExpenditureStatus: (expenditureId: string, newStatus: ExpenditureStatusType) => Promise<void>;
  
  // 추가금 관리
  addAdditionalFee: (expenditureId: string, fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  removeAdditionalFee: (expenditureId: string, feeId: string) => Promise<void>;
  
  // 세금 관리
  setTaxFree: (expenditureId: string, isTaxFree: boolean) => Promise<void>;
  
  // 정산 생성
  createExpenditure: (data: IExpenditureCreateRequest) => Promise<void>;
}

// 초기 필터 상태
const initialFilter: IExpenditureFilter = {
  status: undefined,
  shipperName: undefined,
  startDate: undefined,
  endDate: undefined,
  searchTerm: undefined,
  invoiceStatus: undefined,
  manager: undefined
};

// 매출 정산 목록 상태 스토어
export const useExpenditureStore = create<ExpenditureStoreState>((set, get) => ({
  // 초기 상태
  expenditures: [],
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
    const processedFilter = { ...newFilter } as Partial<IExpenditureFilter>;
    
    // 문자열 필드에서 빈 문자열을 undefined로 변환
    Object.keys(processedFilter).forEach(key => {
      const k = key as keyof Partial<IExpenditureFilter>;
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
  fetchExpenditures: async (page = 1, limit = 10) => {
    console.log('fetchExpenditures 호출됨:', page, limit);
    const { filter } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      console.log('목업 데이터 요청 시작...');
      const response = getExpendituresByPage(
        page,
        limit,
        { ...filter }  // 모든 필터 옵션을 하나의 객체로 전달
      );
      console.log('목업 데이터 응답 받음:', response.data.length);
      
      set({
        expenditures: response.data,
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
  updateExpenditureStatus: async (expenditureId, newStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const expenditureIndex = get().expenditures.findIndex(expenditure => expenditure.id === expenditureId);
      
      if (expenditureIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 상태 업데이트
      const updatedExpenditures = [...get().expenditures];
      updatedExpenditures[expenditureIndex] = {
        ...updatedExpenditures[expenditureIndex],
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditures: updatedExpenditures,
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
  addAdditionalFee: async (expenditureId, fee) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const expenditureIndex = get().expenditures.findIndex(expenditure => expenditure.id === expenditureId);
      
      if (expenditureIndex === -1) {
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
      const updatedExpenditures = [...get().expenditures];
      const targetExpenditure = updatedExpenditures[expenditureIndex];
      
      // 추가금 추가
      const updatedFees = [...targetExpenditure.additionalFees, newFee];
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = targetExpenditure.totalBaseAmount + totalAdditionalAmount;
      const tax = targetExpenditure.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      updatedExpenditures[expenditureIndex] = {
        ...targetExpenditure,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditures: updatedExpenditures,
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
  removeAdditionalFee: async (expenditureId, feeId) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const expenditureIndex = get().expenditures.findIndex(expenditure => expenditure.id === expenditureId);
      
      if (expenditureIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 정산 정보 업데이트
      const updatedExpenditures = [...get().expenditures];
      const targetExpenditure = updatedExpenditures[expenditureIndex];
      
      // 추가금 삭제
      const updatedFees = targetExpenditure.additionalFees.filter(f => f.id !== feeId);
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = targetExpenditure.totalBaseAmount + totalAdditionalAmount;
      const tax = targetExpenditure.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      updatedExpenditures[expenditureIndex] = {
        ...targetExpenditure,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditures: updatedExpenditures,
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
  setTaxFree: async (expenditureId, isTaxFree) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 현재 상태에서 해당 정산 찾기
      const expenditureIndex = get().expenditures.findIndex(expenditure => expenditure.id === expenditureId);
      
      if (expenditureIndex === -1) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      // 정산 정보 업데이트
      const updatedExpenditures = [...get().expenditures];
      const targetExpenditure = updatedExpenditures[expenditureIndex];
      
      // 세금 계산
      const tax = isTaxFree ? 0 : Math.round(targetExpenditure.totalAmount * 0.1);
      
      updatedExpenditures[expenditureIndex] = {
        ...targetExpenditure,
        isTaxFree,
        tax,
        finalAmount: targetExpenditure.totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditures: updatedExpenditures,
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
  createExpenditure: async (data: IExpenditureCreateRequest) => {
    console.log('정산 생성 요청:', data);
    
    try {
      // 목업 정산 생성 함수 호출
      await createExpenditureMock(data);
      
      // 성공 후 정산 목록 다시 불러오기
      const page = get().currentPage;
      await get().fetchExpenditures(page);
      
      console.log('정산이 성공적으로 생성되었습니다.');
      return Promise.resolve();
    } catch (error) {
      console.error('정산 생성 중 오류 발생:', error);
      return Promise.reject(error);
    }
  },
  
  // 정산 생성 함수 추가
  addExpenditure: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 createExpenditure 함수 사용
      const newExpenditure = await createExpenditureMock(data);
      
      // 현재 목록이 정산대기 상태를 보여주고 있다면, 목록에 추가
      if (get().filter.status === 'MATCHING') {
        set(state => ({
          expenditures: [newExpenditure, ...state.expenditures],
          totalItems: state.totalItems + 1,
          totalPages: Math.ceil((state.totalItems + 1) / state.itemsPerPage),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      // 생성된 정산 ID 반환
      return newExpenditure.id;
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
interface ExpenditureDetailStoreState {
  // 데이터 상태
  selectedExpenditureId: string | null;
  expenditureDetail: IExpenditure | null;
  isSheetOpen: boolean;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  openSheet: (expenditureId: string) => void;
  closeSheet: () => void;
  fetchExpenditureDetail: (expenditureId: string) => Promise<void>;
  
  // 추가금 관리
  addAdditionalFee: (fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  removeAdditionalFee: (feeId: string) => Promise<void>;
  
  // 세금 관리
  setTaxFree: (isTaxFree: boolean) => Promise<void>;
  
  // 정산 상태 변경
  updateStatus: (newStatus: ExpenditureStatusType) => Promise<void>;
}

// ID 생성을 위한 카운터
let idCounter = 1;

// 안정적인 ID 생성 함수
const generateStableId = () => {
  return `fee_${idCounter++}`;
};

// 정산 상세 정보 스토어
export const useExpenditureDetailStore = create<ExpenditureDetailStoreState>((set, get) => ({
  // 초기 상태
  selectedExpenditureId: null,
  expenditureDetail: null,
  isSheetOpen: false,
  
  isLoading: false,
  error: null,
  
  // 정산 상세 시트 열기
  openSheet: (expenditureId) => {
    set({
      selectedExpenditureId: expenditureId,
      isSheetOpen: true
    });
    get().fetchExpenditureDetail(expenditureId);
  },
  
  // 정산 상세 시트 닫기
  closeSheet: () => {
    set({
      isSheetOpen: false,
      selectedExpenditureId: null,
      expenditureDetail: null
    });
  },
  
  // 정산 상세 정보 조회
  fetchExpenditureDetail: async (expenditureId) => {
    set({ isLoading: true, error: null });
    
    try {
      // 목업 데이터에서 상세 정보 조회
      const expenditureDetail = getExpenditureById(expenditureId);
      
      if (!expenditureDetail) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      
      set({
        expenditureDetail,
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
    const { selectedExpenditureId, expenditureDetail } = get();
    
    if (!selectedExpenditureId || !expenditureDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 추가금 생성 - 안정적인 ID 사용
      const newFee: IAdditionalFee = {
        id: generateStableId(),
        ...fee,
        createdAt: new Date().toISOString(),
        createdBy: '관리자'
      };
      
      // 추가금 추가
      const updatedFees = [...expenditureDetail.additionalFees, newFee];
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = expenditureDetail.totalBaseAmount + totalAdditionalAmount;
      const tax = expenditureDetail.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      const updatedExpenditureDetail = {
        ...expenditureDetail,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditureDetail: updatedExpenditureDetail,
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
    const { selectedExpenditureId, expenditureDetail } = get();
    
    if (!selectedExpenditureId || !expenditureDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 추가금 삭제
      const updatedFees = expenditureDetail.additionalFees.filter(f => f.id !== feeId);
      
      // 추가금 합계 재계산
      const totalAdditionalAmount = updatedFees.reduce((sum, f) => sum + f.amount, 0);
      
      // 총 금액 및 세금 업데이트
      const totalAmount = expenditureDetail.totalBaseAmount + totalAdditionalAmount;
      const tax = expenditureDetail.isTaxFree ? 0 : Math.round(totalAmount * 0.1);
      
      const updatedExpenditureDetail = {
        ...expenditureDetail,
        additionalFees: updatedFees,
        totalAdditionalAmount,
        totalAmount,
        tax,
        finalAmount: totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditureDetail: updatedExpenditureDetail,
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
    const { selectedExpenditureId, expenditureDetail } = get();
    
    if (!selectedExpenditureId || !expenditureDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 세금 계산
      const tax = isTaxFree ? 0 : Math.round(expenditureDetail.totalAmount * 0.1);
      
      const updatedExpenditureDetail = {
        ...expenditureDetail,
        isTaxFree,
        tax,
        finalAmount: expenditureDetail.totalAmount + tax,
        updatedAt: new Date().toISOString()
      };
      
      // 상태 반영
      set({
        expenditureDetail: updatedExpenditureDetail,
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
    const { selectedExpenditureId, expenditureDetail } = get();
    
    if (!selectedExpenditureId || !expenditureDetail) {
      set({ error: '정산 정보가 없습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 백엔드 연동 시 실제 API 호출로 변경
      // 목업 데이터에서는 상태만 변경
      
      // 상태 업데이트
      const updatedExpenditureDetail = {
        ...expenditureDetail,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // 상태가 정산완료인 경우 세금계산서 상태도 변경
      if (newStatus === 'COMPLETED' && expenditureDetail.invoiceStatus === '미발행') {
        updatedExpenditureDetail.invoiceStatus = '발행대기';
      }
      
      // 상태 반영
      set({
        expenditureDetail: updatedExpenditureDetail,
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