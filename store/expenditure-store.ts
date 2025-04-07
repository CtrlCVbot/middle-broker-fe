import { create } from 'zustand';
import { IExpenditure, IExpenditureCreateRequest, ExpenditureStatusType } from '@/types/expenditure';
import { generateId } from '@/lib/utils';

interface IExpenditureState {
  expenditures: IExpenditure[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filter: {
    status?: ExpenditureStatusType;
    [key: string]: any;
  };
  
  // 액션
  addExpenditure: (data: IExpenditureCreateRequest) => void;
  updateExpenditure: (id: string, data: Partial<IExpenditure>) => void;
  deleteExpenditure: (id: string) => void;
  getExpenditure: (id: string) => IExpenditure | undefined;
  getAllExpenditures: () => IExpenditure[];
  setError: (error: string | null) => void;
  fetchExpenditures: (page: number) => void;
  setFilter: (filter: Partial<IExpenditureState['filter']>) => void;
  resetFilter: () => void;
  setPage: (page: number) => void;
  updateExpenditureStatus: (id: string, status: ExpenditureStatusType) => void;
}

export const useExpenditureStore = create<IExpenditureState>((set, get) => ({
  expenditures: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  filter: {},
  
  fetchExpenditures: async (page: number) => {
    set({ isLoading: true });
    try {
      // TODO: API 연동 시 실제 데이터 fetching 로직으로 대체
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        isLoading: false,
        currentPage: page,
        // 임시 데이터
        expenditures: [],
        totalPages: 1
      });
    } catch (error) {
      set({ 
        isLoading: false,
        error: '데이터 로딩 중 오류가 발생했습니다.'
      });
    }
  },

  setFilter: (newFilter) => {
    set(state => ({
      filter: { ...state.filter, ...newFilter }
    }));
  },

  resetFilter: () => {
    set({ filter: {} });
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchExpenditures(page);
  },

  updateExpenditureStatus: (id, status) => {
    set(state => ({
      expenditures: state.expenditures.map(exp =>
        exp.id === id ? { ...exp, status } : exp
      )
    }));
  },
  
  addExpenditure: (data) => {
    const newExpenditure: IExpenditure = {
      id: generateId('EXP'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'WAITING',
      orderCount: data.orderIds.length,
      totalBaseAmount: 0,
      totalAdditionalAmount: 0,
      totalAmount: 0,
      tax: 0,
      finalAmount: 0,
      isTaxFree: data.isTaxFree ?? false,
      additionalFees: data.additionalFees ?? [],
      logs: [{
        status: 'WAITING',
        time: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        handler: data.manager,
        remark: '정산 생성'
      }],
      ...data,
    };
    
    set(state => ({
      expenditures: [...state.expenditures, newExpenditure],
    }));
  },
  
  updateExpenditure: (id, data) => {
    set(state => ({
      expenditures: state.expenditures.map(exp => 
        exp.id === id 
          ? { ...exp, ...data, updatedAt: new Date().toISOString() }
          : exp
      ),
    }));
  },
  
  deleteExpenditure: (id) => {
    set(state => ({
      expenditures: state.expenditures.filter(exp => exp.id !== id),
    }));
  },
  
  getExpenditure: (id) => {
    return get().expenditures.find(exp => exp.id === id);
  },
  
  getAllExpenditures: () => {
    return get().expenditures;
  },
  
  setError: (error) => {
    set({ error });
  },
})); 