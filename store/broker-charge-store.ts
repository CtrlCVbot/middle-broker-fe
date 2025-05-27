import { create } from 'zustand';
import { 
  IChargeGroupWithLines,
  IFinanceSummary,
  IAdditionalFeeInput,
  IOrderSale,
  ISettlementWaitingItem,
  ISettlementSummary,
  ISettlementWaitingResponse,
  ISettlementFormState,
  ISettlementFormData
} from '@/types/broker-charge';
import { 
  getChargeGroupsByOrderId,
  createChargeFromAdditionalFee,
  getOrderSales,
  getSettlementWaitingItems,
  calculateSettlementSummary,
  createOrderSale,
  createSalesBundle
} from '@/services/broker-charge-service';
import { mapChargeDataToFinanceSummary,  calculateSalesSummary, mapWaitingItemsToBrokerOrders, mapSettlementFormToSalesBundleInput } from '@/utils/charge-mapper';
import { IBrokerOrder } from '@/types/broker-order';

interface IBrokerChargeState {  
  // 기존 운임 관련 상태
  isLoading: boolean;
  error: string | null;  
  chargeGroups: IChargeGroupWithLines[];  
  financeSummary: IFinanceSummary | null;

  // 매출 정산 관련 상태
  waitingItems: ISettlementWaitingItem[];
  selectedWaitingItemIds: string[];
  waitingItemsTotal: number;
  waitingItemsPage: number;
  waitingItemsPageSize: number;
  waitingItemsTotalPages: number;
  waitingItemsIsLoading: boolean;
  waitingItemsError: string | null;
  settlementSummary: ISettlementSummary | null;
  
  // 정산 폼 시트 관련 상태
  settlementForm: ISettlementFormState;
  
  // 필터 관련 상태
  waitingItemsFilter: {
    companyId?: string;
    startDate?: string;
    endDate?: string;
  };

  // 기존 운임 관련 액션
  fetchChargesByOrderId: (orderId: string) => Promise<IChargeGroupWithLines[]>;  
  addCharge: (fee: IAdditionalFeeInput, orderId: string, dispatchId?: string) => Promise<boolean>;  
  resetChargeState: () => void;

  // 매출 정산 관련 액션
  fetchWaitingItems: () => Promise<ISettlementWaitingItem[]>;
  selectWaitingItem: (id: string, selected: boolean) => void;
  selectAllWaitingItems: (selected: boolean) => void;
  updateWaitingItemsPage: (page: number) => void;
  updateWaitingItemsFilter: (filter: Partial<IBrokerChargeState['waitingItemsFilter']>) => void;
  calculateSettlementSummary: () => void;
  createOrderSaleFromWaitingItems: () => Promise<boolean>;
  resetWaitingItemsState: () => void;
  
  // 정산 폼 시트 관련 액션
  openSettlementForm: () => void;
  closeSettlementForm: () => void;
  updateSettlementFormData: (data: Partial<ISettlementFormData>) => void;

  // 새로운 액션
  createSalesBundleFromWaitingItems: (formData?: ISettlementFormData) => Promise<boolean>;
}

// 정산 폼 초기 데이터
const initialSettlementFormData: ISettlementFormData = {
  shipperName: '',
  shipperCeo: '',
  businessNumber: '',
  billingCompany: '',
  manager: '',
  managerContact: '',
  managerEmail: '',
  periodType: 'departure',
  startDate: '',
  endDate: '',
  dueDate: '',
  memo: '',
  taxFree: false,
  hasTax: true,
  issueInvoice: true,
  paymentMethod: 'BANK_TRANSFER'
};

export const useBrokerChargeStore = create<IBrokerChargeState>((set, get) => ({
  // 초기 상태 - 기존 운임 관련
  isLoading: false,
  error: null,
  chargeGroups: [],
  financeSummary: null,
  
  // 초기 상태 - 매출 정산 관련
  waitingItems: [],
  selectedWaitingItemIds: [],
  waitingItemsTotal: 0,
  waitingItemsPage: 1,
  waitingItemsPageSize: 10,
  waitingItemsTotalPages: 0,
  waitingItemsIsLoading: false,
  waitingItemsError: null,
  settlementSummary: null,
  
  // 정산 폼 시트 초기 상태
  settlementForm: {
    isOpen: false,
    selectedItems: [],
    formData: initialSettlementFormData,
    isLoading: false
  },
  
  // 필터 초기 상태
  waitingItemsFilter: {
    companyId: undefined,
    startDate: undefined,
    endDate: undefined,
  },
  
  // 주문 ID로 운임 정보 조회
  fetchChargesByOrderId: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const chargeGroups = await getChargeGroupsByOrderId(orderId);
      const financeSummary = mapChargeDataToFinanceSummary(chargeGroups);
      
      set({ 
        chargeGroups,
        financeSummary,
        isLoading: false 
      });
      
      return chargeGroups;
    } catch (error) {
      console.error('운임 정보 조회 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : '운임 정보 조회에 실패했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 새로운 운임 추가
  addCharge: async (fee: IAdditionalFeeInput, orderId: string, dispatchId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // 운임 그룹 및 라인 생성
      const createdCharge = await createChargeFromAdditionalFee(fee, orderId, dispatchId);
      
      // 상태 업데이트
      const { chargeGroups } = get();
      const updatedChargeGroups = [...chargeGroups, createdCharge];
      const financeSummary = mapChargeDataToFinanceSummary(updatedChargeGroups);
      
      set({ 
        chargeGroups: updatedChargeGroups,
        financeSummary,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('운임 추가 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : '운임 추가에 실패했습니다.',
        isLoading: false 
      });
      return false;
    }
  },
  
  // 상태 초기화
  resetChargeState: () => {
    set({
      isLoading: false,
      error: null,
      chargeGroups: [],
      financeSummary: null
    });
  },

  // 정산 대기 항목 조회
  fetchWaitingItems: async () => {
    try {
      set({ waitingItemsIsLoading: true, waitingItemsError: null });
      
      const { waitingItemsPage, waitingItemsPageSize, waitingItemsFilter } = get();
      
      const response = await getSettlementWaitingItems({
        page: waitingItemsPage,
        pageSize: waitingItemsPageSize,
        companyId: waitingItemsFilter.companyId,
        startDate: waitingItemsFilter.startDate,
        endDate: waitingItemsFilter.endDate
      });
      
      set({ 
        waitingItems: response.data,
        waitingItemsTotal: response.total,
        waitingItemsPage: response.page,
        waitingItemsPageSize: response.pageSize,
        waitingItemsTotalPages: response.totalPages,
        waitingItemsIsLoading: false 
      });

      console.log('fetchWaitingItems:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('정산 대기 항목 조회 중 오류 발생:', error);
      set({ 
        waitingItemsError: error instanceof Error ? error.message : '정산 대기 항목 조회에 실패했습니다.',
        waitingItemsIsLoading: false 
      });
      return [];
    }
  },
  
  // 정산 대기 항목 선택
  selectWaitingItem: (id: string, selected: boolean) => {
    const { selectedWaitingItemIds } = get();
    
    if (selected && !selectedWaitingItemIds.includes(id)) {
      set({ selectedWaitingItemIds: [...selectedWaitingItemIds, id] });
    } else if (!selected && selectedWaitingItemIds.includes(id)) {
      set({ 
        selectedWaitingItemIds: selectedWaitingItemIds.filter(itemId => itemId !== id) 
      });
    }
    
    // 선택 항목이 변경되면 요약 정보 업데이트
    get().calculateSettlementSummary();
  },
  
  // 모든 정산 대기 항목 선택/해제
  selectAllWaitingItems: (selected: boolean) => {
    const { waitingItems } = get();
    
    if (selected) {
      // 모든 항목 선택
      const allIds = waitingItems.map(item => item.id);
      set({ selectedWaitingItemIds: allIds });
    } else {
      // 모든 항목 선택 해제
      set({ selectedWaitingItemIds: [] });
    }
    
    // 선택 항목이 변경되면 요약 정보 업데이트
    get().calculateSettlementSummary();
  },
  
  // 정산 대기 항목 페이지 변경
  updateWaitingItemsPage: (page: number) => {
    set({ waitingItemsPage: page });
    get().fetchWaitingItems();
  },
  
  // 정산 대기 항목 필터 변경
  updateWaitingItemsFilter: (filter: Partial<IBrokerChargeState['waitingItemsFilter']>) => {
    set({ 
      waitingItemsFilter: { ...get().waitingItemsFilter, ...filter },
      waitingItemsPage: 1 // 필터가 변경되면, 첫 페이지로 이동
    });
    get().fetchWaitingItems();
  },
  
  // 선택한 정산 대기 항목의 요약 정보 계산
  calculateSettlementSummary: () => {
    const { waitingItems, selectedWaitingItemIds } = get();
    
    // 선택된 항목이 없으면 요약 정보 초기화
    if (selectedWaitingItemIds.length === 0) {
      set({ settlementSummary: null });
      return;
    }
    
    // 선택된 항목만 필터링
    const selectedItems = waitingItems.filter(item => 
      selectedWaitingItemIds.includes(item.id)
    );
    
    // 회사별 요약 계산
    const companySummaries = new Map<string, {
      companyId: string;
      companyName: string;
      items: number;
      chargeAmount: number;
      dispatchAmount: number;
      profitAmount: number;
    }>();
    
    selectedItems.forEach(item => {
      const { companyId, companyName, chargeAmount, dispatchAmount, profitAmount } = item;
      
      if (companySummaries.has(companyId)) {
        const summary = companySummaries.get(companyId)!;
        summary.items += 1;
        summary.chargeAmount += chargeAmount;
        summary.dispatchAmount += dispatchAmount;
        summary.profitAmount += profitAmount;
      } else {
        companySummaries.set(companyId, {
          companyId,
          companyName,
          items: 1,
          chargeAmount,
          dispatchAmount,
          profitAmount
        });
      }
    });
    
    // 전체 요약 계산
    const companies = Array.from(companySummaries.values());
    const summary: ISettlementSummary = {
      totalItems: selectedItems.length,
      totalChargeAmount: companies.reduce((sum, company) => sum + company.chargeAmount, 0),
      totalDispatchAmount: companies.reduce((sum, company) => sum + company.dispatchAmount, 0),
      totalProfitAmount: companies.reduce((sum, company) => sum + company.profitAmount, 0),
      companies
    };
    
    set({ settlementSummary: summary });
  },
  
  // 선택한 정산 대기 항목으로 매출 인보이스 생성
  createOrderSaleFromWaitingItems: async () => {
    try {
      const { waitingItems, selectedWaitingItemIds } = get();
      
      // 선택된 항목이 없으면 취소
      if (selectedWaitingItemIds.length === 0) {
        return false;
      }
      
      set({ isLoading: true, error: null });
      
      // 선택된 항목만 필터링
      const selectedItems = waitingItems.filter(item => 
        selectedWaitingItemIds.includes(item.id)
      );
      
      // 각 항목에 대해 매출 인보이스 생성
      const promises = selectedItems.map(item => 
        createOrderSale({
          orderId: item.orderId,
          companyId: item.companyId,
          totalAmount: item.chargeAmount,
          memo: `운송 대금 정산 - ${new Date().toLocaleDateString()}`
        })
      );
      
      await Promise.all(promises);
      
      // 정산 대기 항목 다시 조회
      await get().fetchWaitingItems();
      
      // 선택 항목 초기화
      set({ 
        selectedWaitingItemIds: [],
        settlementSummary: null,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('매출 인보이스 생성 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : '매출 인보이스 생성에 실패했습니다.',
        isLoading: false 
      });
      return false;
    }
  },
  
  // 정산 대기 항목 상태 초기화
  resetWaitingItemsState: () => {
    set({
      waitingItems: [],
      selectedWaitingItemIds: [],
      waitingItemsTotal: 0,
      waitingItemsPage: 1,
      waitingItemsPageSize: 10,
      waitingItemsTotalPages: 0,
      waitingItemsIsLoading: false,
      waitingItemsError: null,
      settlementSummary: null,
      waitingItemsFilter: {
        companyId: undefined,
        startDate: undefined,
        endDate: undefined,
      }
    });
  },
  
  // 정산 폼 시트 열기
  openSettlementForm: () => {
    const { waitingItems, selectedWaitingItemIds } = get();
    
    // 선택된 항목이 없으면 종료
    if (selectedWaitingItemIds.length === 0) {
      console.error('선택된 항목이 없습니다.');
      return;
    }
    
    // 선택된 항목만 필터링
    const selectedItems = waitingItems.filter(item => 
      selectedWaitingItemIds.includes(item.id)
    );
    
    // IBrokerOrder 형태로 변환
    const brokerOrders = mapWaitingItemsToBrokerOrders(selectedItems);
    
    // 정산 폼 상태 업데이트
    set({
      settlementForm: {
        ...get().settlementForm,
        isOpen: true,
        selectedItems
      }
    });
    
    // 기존 SettlementEditFormSheet와 연동하기 위해 커스텀 이벤트 발생
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('openIncomeForm', { 
        detail: { orders: brokerOrders } 
      });
      window.dispatchEvent(event);
    }
  },
  
  // 정산 폼 시트 닫기
  closeSettlementForm: () => {
    set({
      settlementForm: {
        ...get().settlementForm,
        isOpen: false,
        selectedItems: []
      }
    });
  },
  
  // 정산 폼 데이터 업데이트
  updateSettlementFormData: (data: Partial<ISettlementFormData>) => {
    set({
      settlementForm: {
        ...get().settlementForm,
        formData: {
          ...get().settlementForm.formData,
          ...data
        }
      }
    });
  },

  // 선택한 정산 대기 항목으로 매출 번들(정산 묶음) 생성
  createSalesBundleFromWaitingItems: async (formData?: ISettlementFormData) => {
    try {
      const { waitingItems, selectedWaitingItemIds } = get();
      console.log("createSalesBundleFromWaitingItems:", waitingItems, selectedWaitingItemIds, formData);
      if (selectedWaitingItemIds.length === 0) return false;
      
      const selectedItems = waitingItems.filter(item => selectedWaitingItemIds.includes(item.id));
      
      // formData가 전달되지 않으면 store의 데이터 사용 (fallback)
      const actualFormData = formData || get().settlementForm.formData;
      
      // 추가금 등은 추후 확장, 현재는 adjustments 없음
      const bundleInput = mapSettlementFormToSalesBundleInput(actualFormData, selectedItems, []);
      
      set({ isLoading: true, error: null });
      await createSalesBundle(bundleInput);
      
      // 성공 시 폼 닫기 및 상태 초기화
      set({
        settlementForm: { ...get().settlementForm, isOpen: false, selectedItems: [] },
        selectedWaitingItemIds: [],
        isLoading: false
      });
      
      // 대기 목록 갱신
      await get().fetchWaitingItems();
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '매출 번들 생성에 실패했습니다.',
        isLoading: false
      });
      return false;
    }
  },
})); 