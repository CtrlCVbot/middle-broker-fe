import { create } from 'zustand';

//service
import { 
  getChargeGroupsByOrderId,
  createChargeFromAdditionalFee,  
  getSettlementWaitingItems,  
  createOrderPurchase,
  createPurchaseBundle,
  getPurchaseBundles,  
  getPurchaseBundleById,
  updatePurchaseBundle,
  deletePurchaseBundle,
  getBundleAdjustments,
  createBundleAdjustment,
  updateBundleAdjustment,
  deleteBundleAdjustment,
  getItemAdjustments,
  createItemAdjustment,
  updateItemAdjustment,
  deleteItemAdjustment,
  getPurchaseBundleFreightList
} from '@/services/broker-charge-purchase-service';

//utils
import { 
  mapChargeDataToFinanceSummary,    
  mapWaitingItemsToBrokerOrders, 
  mapSettlementFormToPurchaseBundleInput, 
  mapPurchaseBundlesToIncomes  
} from '@/utils/charge-purchase-mapper';

//types
import { IPurchaseBundleFilter, IPurchaseBundleListItem, PurchaseBundleStatus, PurchaseMode } from '@/types/broker-charge-purchase';
import { IIncome, IncomeStatusType } from '@/types/income';
import { 
  IPurchaseMode,
  IChargeGroupWithLines,
  IFinanceSummary,
  IAdditionalFeeInput,  
  ISettlementWaitingItem,
  ISettlementSummary,  
  ISettlementFormState,
  ISettlementFormData,
  IPurchaseBundleAdjustment,
  IPurchaseItemAdjustment,
  IPurchaseBundleItemWithDetails,
  ICreateBundleAdjustmentInput,
  IUpdateBundleAdjustmentInput,
  ICreateItemAdjustmentInput,
  IUpdateItemAdjustmentInput
} from '@/types/broker-charge-purchase';
import { IWaitingFilter } from '@/components/broker/sale/settlement-waiting-search';


interface IBrokerChargeState {  

  // 필터 상태
  tabMode: IPurchaseMode;

  // 기존 운임 관련 상태
  isLoading: boolean;
  error: string | null;  
    chargeGroups: IChargeGroupWithLines[];  
    financeSummary: IFinanceSummary | null;    

  // 매출 정산 대기 화물 관련 상태
  waitingItemsFilter: IWaitingFilter;
  waitingItemsTempFilter: IWaitingFilter;
  waitingItems: ISettlementWaitingItem[];
  selectedWaitingItemIds: string[];
  selectedWaitingItems: ISettlementWaitingItem[]; // 새로 추가: 선택된 항목의 전체 데이터
  waitingItemsTotal: number;
  waitingItemsPage: number;
  waitingItemsPageSize: number;
  waitingItemsTotalPages: number;
  waitingItemsIsLoading: boolean;
  waitingItemsError: string | null;
  settlementSummary: ISettlementSummary | null;
  
  // 정산 폼 시트 관련 상태
  settlementForm: ISettlementFormState;
  
  // 편집 중인 sales bundle 관련 상태 추가
  selectedPurchaseBundleId: string | null;
  editingPurchaseBundle: any | null;  
  

  // purchase bundles 관련 상태 추가
  purchaseBundles: IPurchaseBundleListItem[];
  purchaseBundlesAsIncomes: IIncome[]; // IIncome 형태로 변환된 데이터
  purchaseBundlesTotal: number;
  purchaseBundlesPage: number;
  purchaseBundlesPageSize: number;
  purchaseBundlesTotalPages: number;
  purchaseBundlesIsLoading: boolean;
  purchaseBundlesError: string | null;
  purchaseBundlesFilter: IPurchaseBundleFilter;
  purchaseBundlesTempFilter: IPurchaseBundleFilter;

  // 새로 추가: 추가금 관련 상태
  bundleFreightList: IPurchaseBundleItemWithDetails[];
  bundleAdjustments: IPurchaseBundleAdjustment[];
  itemAdjustments: Map<string, IPurchaseItemAdjustment[]>; // itemId -> adjustments
  adjustmentsLoading: boolean;
  adjustmentsError: string | null;

  //탭 모드
  setTabMode: (mode: Partial<IPurchaseMode>) => void;

  //대기 화물 검색
  setFilter: (filter: Partial<IWaitingFilter>) => void;
  setTempFilter: (filter: Partial<IWaitingFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;

  // 기존 운임 관련 액션
  fetchChargesByOrderId: (orderId: string) => Promise<IChargeGroupWithLines[]>;  
  addCharge: (fee: IAdditionalFeeInput, orderId: string, dispatchId?: string) => Promise<boolean>;  
  resetChargeState: () => void;

  // 매출 정산 대기 화물 관련 액션
  fetchWaitingItems: () => Promise<ISettlementWaitingItem[]>;
  selectWaitingItem: (id: string, selected: boolean) => void;
  selectAllWaitingItems: (selected: boolean) => void;
  updateWaitingItemsPage: (page: number) => void;
  updateWaitingItemsFilter: (filter: Partial<IBrokerChargeState['waitingItemsFilter']>) => void;
  calculateSettlementSummary: () => void;
  createOrderPurchaseFromWaitingItems: () => Promise<boolean>;
  resetWaitingItemsState: () => void;
  
  // 정산 폼 시트 관련 액션
  openSettlementForm: () => void;
  closeSettlementForm: () => void;
  updateSettlementFormData: (data: Partial<ISettlementFormData>) => void;

  // 새로운 액션
  createPurchaseBundleFromWaitingItems: (formData?: ISettlementFormData) => Promise<boolean>;

  // sales bundles 관련 액션 추가
  setPurchaseBundlesFilter: (filter: Partial<IPurchaseBundleFilter>) => void;
  setPurchaseBundlesTempFilter: (filter: Partial<IPurchaseBundleFilter>) => void;
  applyPurchaseBundlesTempFilter: () => void;    
  fetchPurchaseBundles: () => Promise<IPurchaseBundleListItem[]>;
  updatePurchaseBundlesPage: (page: number) => void;
  updatePurchaseBundlesFilter: (filter: Partial<IPurchaseBundleFilter>) => void;
  resetPurchaseBundlesFilter: () => void;
  resetPurchaseBundlesTempFilter: () => void;
  resetPurchaseBundlesState: () => void;
  
  
  // sales bundle 편집 관련 액션 추가
  openSettlementFormForEdit: (bundleId: string) => Promise<void>;
  updatePurchaseBundleData: (id: string, formData: ISettlementFormData, reason?: string) => Promise<boolean>;
  deletePurchaseBundleData: (id: string) => Promise<boolean>;
  completePurchaseBundleData: (id: string) => Promise<boolean>;

  // 새로 추가: 추가금 관련 액션들
  fetchBundleFreightList: (bundleId: string) => Promise<IPurchaseBundleItemWithDetails[]>;
  fetchBundleAdjustments: (bundleId: string) => Promise<IPurchaseBundleAdjustment[]>;
  addBundleAdjustment: (bundleId: string, data: ICreateBundleAdjustmentInput) => Promise<boolean>;
  editBundleAdjustment: (bundleId: string, adjustmentId: string, data: IUpdateBundleAdjustmentInput) => Promise<boolean>;
  removeBundleAdjustment: (bundleId: string, adjustmentId: string) => Promise<boolean>;
  
  fetchItemAdjustments: (itemId: string) => Promise<IPurchaseItemAdjustment[]>;
  addItemAdjustment: (itemId: string, data: ICreateItemAdjustmentInput) => Promise<boolean>;
  editItemAdjustment: (itemId: string, adjustmentId: string, data: IUpdateItemAdjustmentInput) => Promise<boolean>;
  removeItemAdjustment: (itemId: string, adjustmentId: string) => Promise<boolean>;
  
  resetAdjustmentsState: () => void;
}

const initialTabMode: IPurchaseMode = {
  mode: 'WAITING' as PurchaseMode,
};

const initialWaitingFilter: IWaitingFilter = {
  searchTerm: undefined,
  departureCity: undefined,
  arrivalCity: undefined,
  vehicleType: undefined,
  weight: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  company: undefined,
  manager: undefined,
};

const initialPurchaseBundleFilter: IPurchaseBundleFilter = {
  companyId: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  search: undefined,
};

// 정산 폼 초기 데이터
const initialSettlementFormData: ISettlementFormData = {
  shipperId: '',
  shipperName: '',
  shipperCeo: '',
  businessNumber: '',
  billingCompany: '',
  managerId: '',
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
  paymentMethod: 'BANK_TRANSFER',
  totalAmount: 0,
  totalTaxAmount: 0,
  totalAmountWithTax: 0,
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
  selectedWaitingItems: [], // 초기 상태에 추가
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
  

  //탭 모드
  tabMode: initialTabMode,

  // 편집 중인 sales bundle 관련 상태 추가
  selectedPurchaseBundleId: null,
  editingPurchaseBundle: null,
  
  // 필터 초기 상태
  waitingItemsFilter: { ...initialWaitingFilter },
  waitingItemsTempFilter: { ...initialWaitingFilter },
  
  // sales bundles 초기 상태 추가
  purchaseBundles: [],
  purchaseBundlesAsIncomes: [],
  purchaseBundlesTotal: 0,
  purchaseBundlesPage: 1,
  purchaseBundlesPageSize: 10,
  purchaseBundlesTotalPages: 0,
  purchaseBundlesIsLoading: false,
  purchaseBundlesError: null,
  
  purchaseBundlesFilter: { ...initialPurchaseBundleFilter },
  purchaseBundlesTempFilter: { ...initialPurchaseBundleFilter },
  
  
  // 새로 추가: 추가금 관련 초기 상태
  bundleFreightList: [],
  bundleAdjustments: [],
  itemAdjustments: new Map(),
  adjustmentsLoading: false,
  adjustmentsError: null,

  setTabMode: (mode: Partial<IPurchaseMode>) => set((state) => ({
    tabMode: { ...state.tabMode, ...mode },
  })),

  setFilter: (filter: Partial<IWaitingFilter>) => set((state) => ({
    waitingItemsFilter: { ...state.waitingItemsFilter, ...filter },
    waitingItemsTempFilter: { ...state.waitingItemsTempFilter, ...filter },
    waitingItemsPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
  })),

  setTempFilter: (filter: Partial<IWaitingFilter>) => set((state) => ({
    waitingItemsTempFilter: { ...state.waitingItemsTempFilter, ...filter },
  })),

  applyTempFilter: () => set((state) => ({
    waitingItemsFilter: { ...state.waitingItemsTempFilter },
    waitingItemsPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
  })),

  resetFilter: () => set({ 
    waitingItemsFilter: { ...initialWaitingFilter },
    waitingItemsTempFilter: { ...initialWaitingFilter },
    waitingItemsPage: 1,
  }),

  resetTempFilter: () => set((state) => ({
    waitingItemsTempFilter: { ...state.waitingItemsFilter },
  })),
  
  // 주문 ID로 운임 정보 조회
  fetchChargesByOrderId: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const chargeGroups = await getChargeGroupsByOrderId(orderId);
      const financeSummary = mapChargeDataToFinanceSummary(chargeGroups);

      console.log("fetchChargesByOrderId:", chargeGroups, financeSummary);
      console.log("chargeGroups:", chargeGroups);
      console.log("financeSummary:", financeSummary);
      
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
       
        filter: waitingItemsFilter
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
    const { selectedWaitingItemIds, selectedWaitingItems, waitingItems } = get();
    
    if (selected && !selectedWaitingItemIds.includes(id)) {
      // 현재 페이지에서 해당 항목 찾기
      const item = waitingItems.find(item => item.id === id);
      if (item) {
        set({ 
          selectedWaitingItemIds: [...selectedWaitingItemIds, id],
          selectedWaitingItems: [...selectedWaitingItems, item]
        });
      }
    } else if (!selected && selectedWaitingItemIds.includes(id)) {
      set({ 
        selectedWaitingItemIds: selectedWaitingItemIds.filter(itemId => itemId !== id),
        selectedWaitingItems: selectedWaitingItems.filter(item => item.id !== id)
      });
    }
    
    // 선택 항목이 변경되면 요약 정보 업데이트
    get().calculateSettlementSummary();
  },
  
  // 모든 정산 대기 항목 선택/해제
  selectAllWaitingItems: (selected: boolean) => {
    const { waitingItems, selectedWaitingItems } = get();
    
    if (selected) {
      // 현재 페이지의 모든 항목을 기존 선택 항목에 추가
      const newSelectedItems = [...selectedWaitingItems];
      const newSelectedIds = [...get().selectedWaitingItemIds];
      
      waitingItems.forEach(item => {
        if (!newSelectedIds.includes(item.id)) {
          newSelectedItems.push(item);
          newSelectedIds.push(item.id);
        }
      });
      
      set({ 
        selectedWaitingItemIds: newSelectedIds,
        selectedWaitingItems: newSelectedItems
      });
    } else {
      // 현재 페이지의 항목들만 선택 해제
      const currentPageIds = waitingItems.map(item => item.id);
      const remainingItems = selectedWaitingItems.filter(item => 
        !currentPageIds.includes(item.id)
      );
      const remainingIds = remainingItems.map(item => item.id);
      
      set({ 
        selectedWaitingItemIds: remainingIds,
        selectedWaitingItems: remainingItems
      });
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
  updateWaitingItemsFilter: (filter: Partial<IWaitingFilter>) => {
    set({ 
      waitingItemsFilter: { ...get().waitingItemsFilter, ...filter },
      waitingItemsPage: 1, // 필터가 변경되면, 첫 페이지로 이동
      // 필터가 변경되면 선택 상태 초기화
      selectedWaitingItemIds: [],
      selectedWaitingItems: [],
      settlementSummary: null
    });
    get().fetchWaitingItems();
  },
  
  // 선택한 정산 대기 항목의 요약 정보 계산
  calculateSettlementSummary: () => {
    const { selectedWaitingItems } = get();
    
    // 선택된 항목이 없으면 요약 정보 초기화
    if (selectedWaitingItems.length === 0) {
      set({ settlementSummary: null });
      return;
    }
    
    // selectedWaitingItems를 직접 사용 (이미 전체 데이터가 있음)
    const selectedItems = selectedWaitingItems;
    
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
  createOrderPurchaseFromWaitingItems: async () => {
    try {
      const { selectedWaitingItems } = get();
      
      // 선택된 항목이 없으면 취소
      if (selectedWaitingItems.length === 0) {
        return false;
      }
      
      set({ isLoading: true, error: null });
      
      // selectedWaitingItems를 직접 사용
      const selectedItems = selectedWaitingItems;
      
      // 각 항목에 대해 매출 인보이스 생성
      const promises = selectedItems.map(item => 
        createOrderPurchase({
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
        selectedWaitingItems: [],
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
      selectedWaitingItems: [], // 초기 상태에 추가
      waitingItemsTotal: 0,
      waitingItemsPage: 1,
      waitingItemsPageSize: 10,
      waitingItemsTotalPages: 0,
      waitingItemsIsLoading: false,
      waitingItemsError: null,
      settlementSummary: null,
      waitingItemsFilter: {
        //companyId: undefined,
        startDate: undefined,
        endDate: undefined,
      }
    });
  },
  
  // 정산 폼 시트 열기
  openSettlementForm: () => {
    const { selectedWaitingItems } = get();
    
    // 선택된 항목이 없으면 종료
    if (selectedWaitingItems.length === 0) {
      console.error('선택된 항목이 없습니다.');
      return;
    }
    
    // selectedWaitingItems를 직접 사용
    const selectedItems = selectedWaitingItems;
    
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
      },
      // 편집 관련 상태 초기화
      selectedPurchaseBundleId: null,
      editingPurchaseBundle: null
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
  createPurchaseBundleFromWaitingItems: async (formData?: ISettlementFormData) => {
    try {
      const { selectedWaitingItems } = get();
      console.log("createPurchaseBundleFromWaitingItems:", selectedWaitingItems, formData);
      if (selectedWaitingItems.length === 0) return false;
      
      const selectedItems = selectedWaitingItems;
      
      // formData가 전달되지 않으면 store의 데이터 사용 (fallback)
      const actualFormData = formData || get().settlementForm.formData;
      
      // 추가금 등은 추후 확장, 현재는 adjustments 없음
      const bundleInput = mapSettlementFormToPurchaseBundleInput(actualFormData, selectedItems, []);
      
      console.log("bundleInput:", bundleInput);
      set({ isLoading: true, error: null });
      await createPurchaseBundle(bundleInput);
      
      // 성공 시 폼 닫기 및 상태 초기화
      set({
        settlementForm: { ...get().settlementForm, isOpen: false, selectedItems: [] },
        selectedWaitingItemIds: [],
        selectedWaitingItems: [],
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

  //
  setPurchaseBundlesFilter: (filter: Partial<IPurchaseBundleFilter>) => set((state) => ({    
      purchaseBundlesFilter: { ...state.purchaseBundlesFilter, ...filter },
      purchaseBundlesTempFilter: { ...state.purchaseBundlesTempFilter, ...filter },
      purchaseBundlesPage: 1
  })),

  setPurchaseBundlesTempFilter: (filter: Partial<IPurchaseBundleFilter>) => set((state) => ({
    purchaseBundlesTempFilter: { ...state.purchaseBundlesTempFilter, ...filter },
  })),

  applyPurchaseBundlesTempFilter: () => set((state) => ({
    purchaseBundlesFilter: { ...state.purchaseBundlesTempFilter },
    purchaseBundlesPage: 1
  })),  
  

  // purchase bundles 관련 액션 추가
  fetchPurchaseBundles: async () => {
    try {
      set({ purchaseBundlesIsLoading: true, purchaseBundlesError: null });
      
      const { purchaseBundlesPage, purchaseBundlesPageSize, purchaseBundlesFilter } = get();
      
      const response = await getPurchaseBundles(
        purchaseBundlesPage,
        purchaseBundlesPageSize,
        purchaseBundlesFilter
      );
      
      console.log('fetchPurchaseBundles:', response.data);
      // IIncome 형태로 변환
      const purchaseBundlesAsIncomes = mapPurchaseBundlesToIncomes(response.data);
      
      set({ 
        purchaseBundles: response.data,
        purchaseBundlesAsIncomes,
        purchaseBundlesTotal: response.total,
        purchaseBundlesPage: response.page,
        purchaseBundlesPageSize: response.pageSize,
        purchaseBundlesTotalPages: response.totalPages,
        purchaseBundlesIsLoading: false 
      });

      console.log('fetchPurchaseBundles:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('매출 번들 조회 중 오류 발생:', error);
      set({ 
        purchaseBundlesError: error instanceof Error ? error.message : '매출 번들 조회에 실패했습니다.',
        purchaseBundlesIsLoading: false 
      });
      return [];
    }
  },
  
  // 매출 번들 페이지 변경
  updatePurchaseBundlesPage: (page: number) => {
    set({ purchaseBundlesPage: page });
    get().fetchPurchaseBundles();
  },
  
  // 매출 번들 필터 변경
  updatePurchaseBundlesFilter: (filter: Partial<IPurchaseBundleFilter>) => {
    set({ 
      purchaseBundlesFilter: { ...get().purchaseBundlesFilter, ...filter },
      purchaseBundlesPage: 1 // 필터가 변경되면, 첫 페이지로 이동
    });
    get().fetchPurchaseBundles();
  },
  
  // 매출 번들 필터 초기화
  resetPurchaseBundlesFilter: () => {
    set({
      purchaseBundlesFilter: { ...initialPurchaseBundleFilter },
      purchaseBundlesTempFilter: { ...initialPurchaseBundleFilter },
      purchaseBundlesPage: 1
    });
    get().fetchPurchaseBundles();
  },
  resetPurchaseBundlesTempFilter: () => set((state) => ({    
    purchaseBundlesTempFilter: { ...initialPurchaseBundleFilter },    
  })),
  
  // 매출 번들 상태 초기화
  resetPurchaseBundlesState: () => {
    set({
      purchaseBundles: [],
      purchaseBundlesTotal: 0,
      purchaseBundlesPage: 1,
      purchaseBundlesPageSize: 10,
      purchaseBundlesTotalPages: 0,
      purchaseBundlesIsLoading: false,
      purchaseBundlesError: null,
      purchaseBundlesFilter: { ...initialPurchaseBundleFilter },
      purchaseBundlesTempFilter: { ...initialPurchaseBundleFilter },
    });
  },
  

  // purchase bundle 편집 관련 액션 추가
  openSettlementFormForEdit: async (bundleId: string) => {
    try {
      set({ selectedPurchaseBundleId: bundleId });
      const bundle = await getPurchaseBundleById(bundleId);
      console.log("openSettlementFormForEdit:", bundle);
      set({ 
        editingPurchaseBundle: bundle,
        settlementForm: {
          ...get().settlementForm,
          isOpen: true,
          selectedItems: [] // 편집 모드에서는 선택된 항목이 없음
        }
      });
    } catch (error) {
      console.error('purchase bundle 편집 중 오류 발생:', error);
    }
  },

  updatePurchaseBundleData: async (id: string, formData: ISettlementFormData, reason?: string) => {
    try {
      set({ isLoading: true, error: null });

      // ISettlementFormData → purchase bundle update input 변환
      const updateInput = {
        //companyName: formData.shipperName,
        //businessNumber: formData.businessNumber,
        companySnapshot: {
          name: formData.shipperName,
          businessNumber: formData.businessNumber,
          ceoName: formData.shipperCeo || '',
        },
        managerSnapshot: {
          name: formData.manager,
          contact: formData.managerContact,
          email: formData.managerEmail || '',
        },
        periodType: formData.periodType,
        periodFrom: formData.startDate,
        periodTo: formData.endDate,
        settlementMemo: formData.memo || '',
        paymentMethod: formData.paymentMethod,
        bankCode: formData.bankName === '' ? null : formData.bankName,
        bankAccountHolder: formData.accountHolder === '' ? null : formData.accountHolder,
        bankAccount: formData.accountNumber === '' ? null : formData.accountNumber,
        settledAt: formData.dueDate || '',
        totalAmount: formData.totalAmount,
        totalTaxAmount: formData.totalTaxAmount,
        totalAmountWithTax: formData.totalAmountWithTax,
        itemExtraAmount: formData.itemExtraAmount,
        bundleExtraAmount: formData.bundleExtraAmount,
        invoiceIssuedAt: formData.invoiceIssuedAt || null,
        depositReceivedAt: formData.depositReceivedAt || null,
        // 필요시 추가 필드 변환
      };

      console.log('updatePurchaseBundleData-before:', updateInput);
      await updatePurchaseBundle(id, updateInput, reason);
      set({ isLoading: false });
      // 성공 시 sales bundles 목록 새로고침
      await get().fetchPurchaseBundles();
      return true;
    } catch (error) {
      console.error('purchase bundle 업데이트 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : 'sales bundle 업데이트에 실패했습니다.',
        isLoading: false 
      });
      return false;
    }
  },

  completePurchaseBundleData: async (id: string, reason?: string) => {
    try {
      set({ isLoading: true, error: null });

      // ISettlementFormData → purchase bundle update input 변환
      const updateInput = {
        status: 'paid'
        // 필요시 추가 필드 변환
      };
      
      await updatePurchaseBundle(id, updateInput, reason);
      set({ isLoading: false });
      // 성공 시 sales bundles 목록 새로고침
      await get().fetchPurchaseBundles();
      return true;
    } catch (error) {
      console.error('purchase bundle 업데이트 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : 'purchase bundle 업데이트에 실패했습니다.',
        isLoading: false 
      });
      return false;
    }
  },

  deletePurchaseBundleData: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deletePurchaseBundle(id);
      set({ isLoading: false });
      
      // 성공 시 sales bundles 목록 새로고침
      await get().fetchPurchaseBundles();
      
      return true;
    } catch (error) {
      console.error('sales bundle 삭제 중 오류 발생:', error);
      set({ 
        error: error instanceof Error ? error.message : 'sales bundle 삭제에 실패했습니다.',
        isLoading: false 
      });
      return false;
    }
  },

  // 새로 추가: 추가금 관련 액션들
  
  /**
   * 정산 그룹의 화물 목록 조회
   */
  fetchBundleFreightList: async (bundleId: string) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const freightList = await getPurchaseBundleFreightList(bundleId);
      
      set({ 
        bundleFreightList: freightList,
        adjustmentsLoading: false 
      });
      
      return freightList;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '화물 목록 조회에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      throw error;
    }
  },

  /**
   * 통합 추가금 목록 조회
   */
  fetchBundleAdjustments: async (bundleId: string) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const adjustments = await getBundleAdjustments(bundleId);
      
      set({ 
        bundleAdjustments: adjustments,
        adjustmentsLoading: false 
      });
      
      return adjustments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '통합 추가금 조회에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      throw error;
    }
  },

  /**
   * 통합 추가금 생성
   */
  addBundleAdjustment: async (bundleId: string, data: ICreateBundleAdjustmentInput) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const newAdjustment = await createBundleAdjustment(bundleId, data);
      
      const currentAdjustments = get().bundleAdjustments;
      set({ 
        bundleAdjustments: [...currentAdjustments, newAdjustment],
        adjustmentsLoading: false 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '통합 추가금 생성에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

  /**
   * 통합 추가금 수정
   */
  editBundleAdjustment: async (bundleId: string, adjustmentId: string, data: IUpdateBundleAdjustmentInput) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const updatedAdjustment = await updateBundleAdjustment(bundleId, adjustmentId, data);
      
      const currentAdjustments = get().bundleAdjustments;
      const updatedAdjustments = currentAdjustments.map(adj => 
        adj.id === adjustmentId ? updatedAdjustment : adj
      );
      
      set({ 
        bundleAdjustments: updatedAdjustments,
        adjustmentsLoading: false 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '통합 추가금 수정에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

  /**
   * 통합 추가금 삭제
   */
  removeBundleAdjustment: async (bundleId: string, adjustmentId: string) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      await deleteBundleAdjustment(bundleId, adjustmentId);
      
      const currentAdjustments = get().bundleAdjustments;
      const filteredAdjustments = currentAdjustments.filter(adj => adj.id !== adjustmentId);
      
      set({ 
        bundleAdjustments: filteredAdjustments,
        adjustmentsLoading: false 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '통합 추가금 삭제에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

 

  /**
   * 개별 화물 추가금 목록 조회
   */
  fetchItemAdjustments: async (itemId: string) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const adjustments = await getItemAdjustments(itemId);
      
      const currentItemAdjustments = get().itemAdjustments;
      const updatedItemAdjustments = new Map(currentItemAdjustments);
      updatedItemAdjustments.set(itemId, adjustments);
      
      set({ 
        itemAdjustments: updatedItemAdjustments,
        adjustmentsLoading: false 
      });
      
      return adjustments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개별 화물 추가금 조회에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      throw error;
    }
  },

  /**
   * 개별 화물 추가금 생성
   */
  addItemAdjustment: async (itemId: string, data: ICreateItemAdjustmentInput) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const newAdjustment = await createItemAdjustment(itemId, data);
      
      // 1. itemAdjustments Map 업데이트
      const currentItemAdjustments = get().itemAdjustments;
      const itemAdjustments = currentItemAdjustments.get(itemId) || [];
      const updatedItemAdjustments = new Map(currentItemAdjustments);
      updatedItemAdjustments.set(itemId, [...itemAdjustments, newAdjustment]);
      
      // 2. bundleFreightList의 해당 아이템에도 새로운 추가금 추가 (화면 즉시 업데이트용)
      const currentBundleFreightList = get().bundleFreightList;
      const updatedBundleFreightList = currentBundleFreightList.map(freightItem => {
        if (freightItem.id === itemId) {
          return {
            ...freightItem,
            adjustments: [...(freightItem.adjustments || []), newAdjustment]
          };
        }
        return freightItem;
      });
      
      set({ 
        itemAdjustments: updatedItemAdjustments,
        bundleFreightList: updatedBundleFreightList,
        adjustmentsLoading: false 
      });
      
      console.log('개별 추가금 추가 완료 - 로컬 상태 업데이트:', { itemId, newAdjustment });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개별 화물 추가금 생성에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

  /**
   * 개별 화물 추가금 수정
   */
  editItemAdjustment: async (itemId: string, adjustmentId: string, data: IUpdateItemAdjustmentInput) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      const updatedAdjustment = await updateItemAdjustment(itemId, adjustmentId, data);
      
      // 1. itemAdjustments Map 업데이트
      const currentItemAdjustments = get().itemAdjustments;
      const itemAdjustments = currentItemAdjustments.get(itemId) || [];
      const updatedAdjustments = itemAdjustments.map(adj => 
        adj.id === adjustmentId ? updatedAdjustment : adj
      );
      
      const updatedItemAdjustments = new Map(currentItemAdjustments);
      updatedItemAdjustments.set(itemId, updatedAdjustments);
      
      // 2. bundleFreightList의 해당 아이템 추가금도 업데이트 (화면 즉시 업데이트용)
      const currentBundleFreightList = get().bundleFreightList;
      const updatedBundleFreightList = currentBundleFreightList.map(freightItem => {
        if (freightItem.id === itemId) {
          return {
            ...freightItem,
            adjustments: (freightItem.adjustments || []).map(adj => 
              adj.id === adjustmentId ? updatedAdjustment : adj
            )
          };
        }
        return freightItem;
      });
      
      set({ 
        itemAdjustments: updatedItemAdjustments,
        bundleFreightList: updatedBundleFreightList,
        adjustmentsLoading: false 
      });
      
      console.log('개별 추가금 수정 완료 - 로컬 상태 업데이트:', { itemId, adjustmentId, updatedAdjustment });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개별 화물 추가금 수정에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

  /**
   * 개별 화물 추가금 삭제
   */
  removeItemAdjustment: async (itemId: string, adjustmentId: string) => {
    try {
      set({ adjustmentsLoading: true, adjustmentsError: null });
      
      await deleteItemAdjustment(itemId, adjustmentId);
      
      // 1. itemAdjustments Map 업데이트
      const currentItemAdjustments = get().itemAdjustments;
      const itemAdjustments = currentItemAdjustments.get(itemId) || [];
      const filteredAdjustments = itemAdjustments.filter(adj => adj.id !== adjustmentId);
      
      const updatedItemAdjustments = new Map(currentItemAdjustments);
      updatedItemAdjustments.set(itemId, filteredAdjustments);
      
      // 2. bundleFreightList의 해당 아이템에서도 추가금 제거 (화면 즉시 업데이트용)
      const currentBundleFreightList = get().bundleFreightList;
      const updatedBundleFreightList = currentBundleFreightList.map(freightItem => {
        if (freightItem.id === itemId) {
          return {
            ...freightItem,
            adjustments: (freightItem.adjustments || []).filter(adj => adj.id !== adjustmentId)
          };
        }
        return freightItem;
      });
      
      set({ 
        itemAdjustments: updatedItemAdjustments,
        bundleFreightList: updatedBundleFreightList,
        adjustmentsLoading: false 
      });
      
      console.log('개별 추가금 삭제 완료 - 로컬 상태 업데이트:', { itemId, adjustmentId });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개별 화물 추가금 삭제에 실패했습니다.';
      set({ 
        adjustmentsError: errorMessage,
        adjustmentsLoading: false 
      });
      return false;
    }
  },

  /**
   * 추가금 관련 상태 초기화
   */
  resetAdjustmentsState: () => {
    set({
      bundleFreightList: [],
      bundleAdjustments: [],
      itemAdjustments: new Map(),
      adjustmentsLoading: false,
      adjustmentsError: null
    });
  },
})); 