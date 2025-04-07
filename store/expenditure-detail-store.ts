import { create } from 'zustand';
import { 
  IExpenditure, 
  ExpenditureStatusType, 
  IAdditionalFee, 
  IExpenditureLog 
} from '@/types/expenditure';

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
  addAdditionalFee: (fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => void;
  removeAdditionalFee: (feeId: string) => void;
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

  addAdditionalFee: (fee) => {
    const currentExpenditure = get().expenditureDetail;
    if (!currentExpenditure) return;

    const newFee: IAdditionalFee = {
      id: `fee_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user', // TODO: 실제 사용자 ID로 대체
      ...fee
    };

    set({
      expenditureDetail: {
        ...currentExpenditure,
        additionalFees: [...currentExpenditure.additionalFees, newFee],
        updatedAt: new Date().toISOString(),
      }
    });
  },

  removeAdditionalFee: (feeId) => {
    const currentExpenditure = get().expenditureDetail;
    if (!currentExpenditure) return;

    set({
      expenditureDetail: {
        ...currentExpenditure,
        additionalFees: currentExpenditure.additionalFees.filter(fee => fee.id !== feeId),
        updatedAt: new Date().toISOString(),
      }
    });
  },
})); 