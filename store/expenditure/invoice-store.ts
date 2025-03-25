import { create } from 'zustand';
import { IInvoice, IInvoiceFilter, ICargo, IAdditionalCharge } from '@/types/broker/expenditure';
import { generateMockInvoices, getPaginatedInvoices } from '@/utils/mockdata/mock-invoices';

type SheetMode = 'CREATE' | 'MATCH';

interface IInvoiceStore {
  // 상태
  invoices: IInvoice[];
  selectedInvoice: IInvoice | null;
  isMatchingSheetOpen: boolean;
  matchedCargos: ICargo[];
  additionalCharges: IAdditionalCharge[];
  filter: IInvoiceFilter;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  mode: SheetMode;

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
  setMode: (mode: SheetMode) => void;
  setSelectedInvoice: (invoice: IInvoice | null) => void;
  
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
  filter: {
    status: 'WAITING'
  },
  isMatchingSheetOpen: false,
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalItems: 0,
  isLoading: false,
  mode: 'MATCH',

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
      filter: {
        status: 'WAITING'
      },
      currentPage: 1
    });
  },
  
  setPage: (page) => set({ currentPage: page }),
  
  setMatchingSheetOpen: (isOpen) => {
    if (!isOpen) {
      set({ 
        selectedInvoice: null,
        matchedCargos: [],
        mode: 'MATCH'
      });
    }
    set({ isMatchingSheetOpen: isOpen });
  },
  
  setMode: (mode) => set({ mode }),
  
  setSelectedInvoice: (invoice) => {
    set({ 
      selectedInvoice: invoice,
      mode: 'MATCH',
      matchedCargos: []
    });
  },
  
  getTotalMatchedAmount: () => {
    const { matchedCargos } = get();
    return matchedCargos.reduce((sum, cargo) => sum + (cargo.dispatchAmount || 0), 0);
  },
  
  getAmountDifference: () => {
    const { selectedInvoice } = get();
    const totalMatchedAmount = get().getTotalMatchedAmount();
    if (!selectedInvoice) return 0;
    return (selectedInvoice.totalAmount || 0) - totalMatchedAmount;
  }
})); 