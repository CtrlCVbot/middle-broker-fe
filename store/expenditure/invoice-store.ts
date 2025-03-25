import { create } from 'zustand';
import { IInvoice, IInvoiceFilter, ICargo, IAdditionalCharge } from '@/types/broker/expenditure';
import { generateMockInvoices, getPaginatedInvoices } from '@/utils/mockdata/mock-invoices';

interface IInvoiceStore {
  // 상태
  invoices: IInvoice[];
  selectedInvoice: IInvoice | null;
  matchedCargos: ICargo[];
  additionalCharges: IAdditionalCharge[];
  filter: IInvoiceFilter;
  isMatchingSheetOpen: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;

  // 액션
  fetchInvoices: () => Promise<void>;
  selectInvoice: (invoice: IInvoice) => void;
  setMatchedCargos: (cargos: ICargo[]) => void;
  addAdditionalCharge: (charge: IAdditionalCharge) => void;
  removeAdditionalCharge: (id: string) => void;
  updateFilter: (newFilter: Partial<IInvoiceFilter>) => void;
  setMatchingSheetOpen: (isOpen: boolean) => void;
  resetFilter: () => void;
  setPage: (page: number) => void;
  
  // 계산된 값
  getTotalMatchedAmount: () => number;
  getAmountDifference: () => number;
}

// 목업 데이터
const mockInvoices = generateMockInvoices(50);

export const useInvoiceStore = create<IInvoiceStore>((set, get) => ({
  // 초기 상태
  invoices: [],
  selectedInvoice: null,
  matchedCargos: [],
  additionalCharges: [],
  filter: {},
  isMatchingSheetOpen: false,
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalItems: 0,
  isLoading: false,

  // 액션
  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const { data, total, totalPages } = getPaginatedInvoices(
        mockInvoices,
        get().currentPage,
        get().pageSize,
        get().filter
      );
      set({ 
        invoices: data,
        totalItems: total,
        totalPages,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      set({ isLoading: false });
    }
  },

  selectInvoice: (invoice) => set({ selectedInvoice: invoice }),
  
  setMatchedCargos: (cargos) => set({ matchedCargos: cargos }),
  
  addAdditionalCharge: (charge) => 
    set((state) => ({ 
      additionalCharges: [...state.additionalCharges, charge] 
    })),
  
  removeAdditionalCharge: (id) =>
    set((state) => ({
      additionalCharges: state.additionalCharges.filter(c => c.id !== id)
    })),
  
  updateFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
      currentPage: 1 // 필터 변경 시 첫 페이지로 이동
    }));
  },
  
  resetFilter: () => {
    set({
      filter: {},
      currentPage: 1
    });
  },
  
  setPage: (page) => set({ currentPage: page }),
  
  setMatchingSheetOpen: (isOpen) => set({ isMatchingSheetOpen: isOpen }),
  
  getTotalMatchedAmount: () => {
    const { matchedCargos } = get();
    return matchedCargos.reduce((sum, cargo) => sum + cargo.dispatchAmount, 0);
  },
  
  getAmountDifference: () => {
    const { selectedInvoice } = get();
    const totalMatchedAmount = get().getTotalMatchedAmount();
    return selectedInvoice ? selectedInvoice.totalAmount - totalMatchedAmount : 0;
  },
})); 