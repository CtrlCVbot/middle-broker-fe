import { create } from 'zustand';
import { IInvoice, IInvoiceFilter, ICargo, IAdditionalCharge } from '@/types/broker/expenditure';

interface IInvoiceStore {
  // 상태
  invoices: IInvoice[];
  selectedInvoice: IInvoice | null;
  matchedCargos: ICargo[];
  additionalCharges: IAdditionalCharge[];
  filter: IInvoiceFilter;
  isMatchingSheetOpen: boolean;

  // 액션
  setInvoices: (invoices: IInvoice[]) => void;
  selectInvoice: (invoice: IInvoice | null) => void;
  setMatchedCargos: (cargos: ICargo[]) => void;
  addAdditionalCharge: (charge: IAdditionalCharge) => void;
  removeAdditionalCharge: (id: string) => void;
  updateFilter: (filter: Partial<IInvoiceFilter>) => void;
  setMatchingSheetOpen: (isOpen: boolean) => void;
  
  // 계산된 값
  getTotalMatchedAmount: () => number;
  getAmountDifference: () => number;
}

export const useInvoiceStore = create<IInvoiceStore>((set, get) => ({
  // 초기 상태
  invoices: [],
  selectedInvoice: null,
  matchedCargos: [],
  additionalCharges: [],
  filter: {},
  isMatchingSheetOpen: false,

  // 액션 구현
  setInvoices: (invoices) => set({ invoices }),
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
  updateFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
  setMatchingSheetOpen: (isOpen) => set({ isMatchingSheetOpen: isOpen }),

  // 계산된 값 구현
  getTotalMatchedAmount: () => {
    const state = get();
    const cargoAmount = state.matchedCargos.reduce(
      (sum, cargo) => sum + cargo.dispatchAmount, 
      0
    );
    const additionalAmount = state.additionalCharges.reduce(
      (sum, charge) => sum + charge.amount, 
      0
    );
    return cargoAmount + additionalAmount;
  },
  getAmountDifference: () => {
    const state = get();
    if (!state.selectedInvoice) return 0;
    return state.selectedInvoice.totalAmount - get().getTotalMatchedAmount();
  }
})); 