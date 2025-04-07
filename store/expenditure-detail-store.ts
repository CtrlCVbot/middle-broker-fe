import { create } from 'zustand';
import { IExpenditure, ExpenditureStatusType } from '@/types/expenditure';

interface IOrder {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  vehicle: {
    type: string;
    weight: string;
  };
  chargeAmount?: number;
  amount: number;
  fee: number;
}

interface IExpenditureWithOrders extends IExpenditure {
  orders: IOrder[];
}

interface IExpenditureDetailState {
  isSheetOpen: boolean;
  expenditureDetail: IExpenditureWithOrders | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  openSheet: () => void;
  closeSheet: () => void;
  setSelectedExpenditure: (expenditure: IExpenditureWithOrders) => void;
  updateStatus: (status: ExpenditureStatusType) => void;
  setTaxFree: (isTaxFree: boolean) => void;
}

export const useExpenditureDetailStore = create<IExpenditureDetailState>((set, get) => ({
  isSheetOpen: false,
  expenditureDetail: null,
  isLoading: false,
  error: null,
  
  openSheet: () => {
    set({ 
      isSheetOpen: true,
      expenditureDetail: null
    });
  },
  
  closeSheet: () => {
    set({ 
      isSheetOpen: false,
      expenditureDetail: null
    });
  },
  
  setSelectedExpenditure: (expenditure) => {
    set({ expenditureDetail: expenditure });
  },

  updateStatus: (status) => {
    const currentExpenditure = get().expenditureDetail;
    if (!currentExpenditure) return;

    set({
      expenditureDetail: {
        ...currentExpenditure,
        status,
        updatedAt: new Date().toISOString(),
      }
    });
  },

  setTaxFree: (isTaxFree) => {
    const currentExpenditure = get().expenditureDetail;
    if (!currentExpenditure) return;

    set({
      expenditureDetail: {
        ...currentExpenditure,
        isTaxFree,
        updatedAt: new Date().toISOString(),
      }
    });
  },
})); 