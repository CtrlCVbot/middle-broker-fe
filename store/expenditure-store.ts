import { create } from "zustand";
import { IExpenditure, ExpenditureStatusType } from "@/types/expenditure";

interface IExpenditureFilter {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

interface IExpenditureState {
  expenditures: IExpenditure[];
  isLoading: boolean;
  error: string | null;
  selectedExpenditureId: string | null;
  isSheetOpen: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filter: IExpenditureFilter;
  
  // Actions
  setExpenditures: (expenditures: IExpenditure[]) => void;
  addExpenditure: (expenditure: IExpenditure) => void;
  updateExpenditure: (id: string, expenditure: Partial<IExpenditure>) => void;
  deleteExpenditure: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedExpenditureId: (id: string | null) => void;
  openSheet: () => void;
  closeSheet: () => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setTotalItems: (total: number) => void;
  setFilter: (filter: Partial<IExpenditureFilter>) => void;
  resetFilter: () => void;
  fetchExpenditures: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  updateExpenditureStatus: (id: string, status: ExpenditureStatusType) => Promise<void>;
}

export const useExpenditureStore = create<IExpenditureState>((set, get) => ({
  expenditures: [],
  isLoading: false,
  error: null,
  selectedExpenditureId: null,
  isSheetOpen: false,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  filter: {},
  
  setExpenditures: (expenditures) => set({ expenditures }),
  addExpenditure: (expenditure) => 
    set((state) => ({ 
      expenditures: [...state.expenditures, expenditure] 
    })),
  updateExpenditure: (id, expenditure) =>
    set((state) => ({
      expenditures: state.expenditures.map((exp) =>
        exp.id === id ? { ...exp, ...expenditure } : exp
      ),
    })),
  deleteExpenditure: (id) =>
    set((state) => ({
      expenditures: state.expenditures.filter((exp) => exp.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedExpenditureId: (id) => set({ selectedExpenditureId: id }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false, selectedExpenditureId: null }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setTotalItems: (total) => set({ totalItems: total }),
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  resetFilter: () => set({ filter: {}, currentPage: 1 }),
  fetchExpenditures: async (page) => {
    const state = get();
    const currentPage = page || state.currentPage;
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call
      const response = await fetch(`/api/expenditures?page=${currentPage}`);
      const data = await response.json();
      set({ 
        expenditures: data.expenditures,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        currentPage,
        isLoading: false 
      });
    } catch (error) {
      set({ error: "Failed to fetch expenditures", isLoading: false });
    }
  },
  setPage: (page) => {
    set({ currentPage: page });
  },
  updateExpenditureStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call
      await fetch(`/api/expenditures/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      set((state) => ({
        expenditures: state.expenditures.map((exp) =>
          exp.id === id ? { ...exp, status } : exp
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update expenditure status", isLoading: false });
    }
  },
}));

interface IExpenditureDetailState {
  selectedExpenditureId: string | null;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  setSelectedExpenditureId: (id: string | null) => void;
}

export const useExpenditureDetailStore = create<IExpenditureDetailState>((set) => ({
  selectedExpenditureId: null,
  isSheetOpen: false,
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false, selectedExpenditureId: null }),
  setSelectedExpenditureId: (id) => set({ selectedExpenditureId: id }),
})); 