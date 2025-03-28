import { create } from 'zustand';
import { 
  CITIES, 
  VEHICLE_TYPES, 
  WEIGHT_TYPES,
  MANAGERS
} from '@/utils/mockdata/mock-broker-orders';
import { IBrokerOrder, BrokerOrderStatusType } from '@/types/broker-order';
import { getMockBrokerOrders } from '@/utils/mockdata/mock-broker-orders';
import { persist } from 'zustand/middleware';
import { useExpenditureFormStore } from './expenditure-form-store';
import { toast } from 'sonner';

// 필터 옵션의 기본값 정의
const DEFAULT_CITIES = CITIES || ["서울", "부산", "인천", "대구", "대전", "광주", "울산", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const DEFAULT_VEHICLE_TYPES = VEHICLE_TYPES || ["카고", "윙바디", "탑차", "냉장", "냉동", "트레일러"];
const DEFAULT_WEIGHT_TYPES = WEIGHT_TYPES || ["1톤", "2.5톤", "3.5톤", "5톤", "11톤", "25톤"];
const DEFAULT_MANAGERS = MANAGERS ? MANAGERS.map(m => m.name) : ["김중개", "이주선", "박배송", "정관리", "최물류"];
const DEFAULT_STATUSES: BrokerOrderStatusType[] = ["운송마감"];

// 필터 타입 정의
export interface IExpenditureWaitingFilter {
  searchTerm?: string;
  departureCity?: string;
  arrivalCity?: string;
  vehicleType?: string;
  weight?: string;
  status?: BrokerOrderStatusType;
  startDate?: string;
  endDate?: string;
  company?: string;
  manager?: string;
}

interface IExpenditureWaitingState {
  // 데이터
  waitingOrders: IBrokerOrder[];
  filteredOrders: IBrokerOrder[];
  totalWaitingOrdersCount: number;
  isLoading: boolean;
  
  // 선택 관리
  selectedOrderIds: string[];
  
  // 검색 필터
  filter: IExpenditureWaitingFilter;
  tempFilter: IExpenditureWaitingFilter; // Popover에서 임시로 사용할 필터
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  totalPages: number;
  
  // 기본 필터 옵션
  filterOptions: {
    cities: string[];
    vehicleTypes: string[];
    weightTypes: string[];
    statuses: BrokerOrderStatusType[];
    companies: string[];
    managers: string[];
  };
  
  // 액션
  fetchWaitingOrders: () => Promise<void>;
  getOrdersByPage: (page: number) => IBrokerOrder[];
  setFilter: (filter: Partial<IExpenditureWaitingFilter>) => void;
  setTempFilter: (filter: Partial<IExpenditureWaitingFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // 선택 관련 액션
  selectOrder: (orderId: string, isSelected: boolean) => void;
  selectAllOrders: (isSelected: boolean) => void;
  clearSelection: () => void;
  createExpenditure: () => void;
  
  // 화주별 그룹화 액션
  getSelectedOrders: () => IBrokerOrder[];
  getShipperGroups: () => Array<{
    shipper: string;
    orders: IBrokerOrder[];
    total: number;
    count: number;
  }>;
  selectOrdersByShipper: (shipper: string, isSelected: boolean) => void;
}

// 초기 필터 상태
const initialFilter: IExpenditureWaitingFilter = {
  departureCity: undefined,
  arrivalCity: undefined,
  vehicleType: undefined,
  weight: undefined,
  searchTerm: '',
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  company: undefined,
  manager: undefined
};

// 회사명 추출 함수 (유니크한 값만)
const extractCompanies = (orders: IBrokerOrder[]): string[] => {
  const companiesSet = new Set(orders
    .filter(order => order.company)
    .map(order => order.company));
  return Array.from(companiesSet);
};

// ID 생성을 위한 카운터
let waitingIdCounter = 1;

// 안정적인 ID 생성 함수
const generateWaitingId = () => {
  return `waiting_${waitingIdCounter++}`;
};

// 정산 대기 화물 관리 스토어 생성
export const useExpenditureWaitingStore = create<IExpenditureWaitingState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      waitingOrders: [],
      filteredOrders: [],
      totalWaitingOrdersCount: 0,
      isLoading: false,
      
      selectedOrderIds: [],
      
      filter: { ...initialFilter, status: "운송마감" },
      tempFilter: { ...initialFilter, status: "운송마감" },
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      
      // 필터 옵션 목록
      filterOptions: {
        cities: DEFAULT_CITIES,
        vehicleTypes: DEFAULT_VEHICLE_TYPES,
        weightTypes: DEFAULT_WEIGHT_TYPES,
        statuses: DEFAULT_STATUSES,
        companies: [],
        managers: DEFAULT_MANAGERS
      },
      
      // 데이터 액션
      fetchWaitingOrders: async () => {
        set({ isLoading: true });
        try {
          // 실제 API 대신 목업 데이터를 사용
          const allOrders = getMockBrokerOrders();
          
          // 운송마감 상태의 화물만 필터링
          const waitingOrders = allOrders.filter(order => 
            order.status === "운송마감" && 
            !order.settlementId // 이미 정산되지 않은 화물만
          );
          
          // 필터 옵션에 회사명 추가
          const companies = extractCompanies(waitingOrders);
          
          // 현재 필터 적용
          const { filter } = get();
          const filteredOrders = applyFilter(waitingOrders, filter);
          const totalPages = Math.ceil(filteredOrders.length / get().pageSize);
          
          set({
            waitingOrders,
            filteredOrders,
            totalWaitingOrdersCount: waitingOrders.length,
            totalPages,
            isLoading: false,
            filterOptions: {
              ...get().filterOptions,
              companies
            }
          });
        } catch (error) {
          console.error("정산 대기 화물 로딩 실패:", error);
          set({ isLoading: false });
        }
      },
      
      getOrdersByPage: (page) => {
        const { filteredOrders, pageSize } = get();
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredOrders.slice(startIndex, endIndex);
      },
      
      // 필터링 액션
      setFilter: (filter: Partial<IExpenditureWaitingFilter>) => {
        set((state) => {
          const newFilter = { ...state.filter, ...filter };
          const filteredOrders = applyFilter(state.waitingOrders, newFilter);
          const totalPages = Math.ceil(filteredOrders.length / state.pageSize);
          
          return {
            filter: newFilter,
            tempFilter: { ...state.tempFilter, ...filter },
            filteredOrders,
            totalPages,
            currentPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
          };
        });
      },
      
      setTempFilter: (filter: Partial<IExpenditureWaitingFilter>) => set((state) => ({
        tempFilter: { ...state.tempFilter, ...filter },
      })),
      
      applyTempFilter: () => {
        set((state) => {
          const filteredOrders = applyFilter(state.waitingOrders, state.tempFilter);
          const totalPages = Math.ceil(filteredOrders.length / state.pageSize);
          
          return {
            filter: { ...state.tempFilter },
            filteredOrders,
            totalPages,
            currentPage: 1, // 필터가 변경되면 첫 페이지로 돌아감
          };
        });
      },
      
      resetFilter: () => {
        const basicFilter: IExpenditureWaitingFilter = { ...initialFilter, status: "운송마감" };
        set((state) => {
          const filteredOrders = applyFilter(state.waitingOrders, basicFilter);
          const totalPages = Math.ceil(filteredOrders.length / state.pageSize);
          
          return {
            filter: basicFilter,
            tempFilter: basicFilter,
            filteredOrders,
            totalPages,
            currentPage: 1,
          };
        });
      },
      
      resetTempFilter: () => set((state) => ({
        tempFilter: { ...state.filter },
      })),
      
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      setPageSize: (size: number) => set((state) => {
        const totalPages = Math.ceil(state.filteredOrders.length / size);
        return {
          pageSize: size,
          totalPages,
          currentPage: Math.min(state.currentPage, totalPages || 1)
        };
      }),
      
      // 선택 관련 액션
      selectOrder: (orderId: string, isSelected: boolean) => {
        set((state) => {
          const newSelectedOrderIds = isSelected
            ? [...state.selectedOrderIds, orderId]
            : state.selectedOrderIds.filter(id => id !== orderId);
          
          return { selectedOrderIds: newSelectedOrderIds };
        });
      },
      
      selectAllOrders: (isSelected: boolean) => {
        set((state) => {
          if (isSelected) {
            // 현재 페이지의 주문들만 선택
            const currentPageOrders = get().getOrdersByPage(state.currentPage);
            const currentPageOrderIds = currentPageOrders.map(order => order.id);
            
            // 기존 선택에 현재 페이지 주문들 추가 (중복 제거)
            const allSelectedIds = [...new Set([
              ...state.selectedOrderIds,
              ...currentPageOrderIds
            ])];
            
            return { selectedOrderIds: allSelectedIds };
          } else {
            // 현재 페이지의 주문들을 선택 해제
            const currentPageOrders = get().getOrdersByPage(state.currentPage);
            const currentPageOrderIds = currentPageOrders.map(order => order.id);
            
            // 현재 페이지의 주문들을 제외한 나머지 선택만 유지
            const remainingSelected = state.selectedOrderIds.filter(
              id => !currentPageOrderIds.includes(id)
            );
            
            return { selectedOrderIds: remainingSelected };
          }
        });
      },
      
      clearSelection: () => set({ selectedOrderIds: [] }),
      
      // 선택된 화물로 정산 생성
      createExpenditure: () => {
        const { selectedOrderIds } = get();
        
        if (selectedOrderIds.length === 0) {
          toast.error('선택된 화물이 없습니다.');
          console.error('선택된 화물 없음');
          return;
        }
        
        try {
          // 모든 화물 데이터 가져오기
          const allOrders = getMockBrokerOrders();
          
          // 선택된 화물만 필터링
          const selectedOrders = allOrders.filter(order => selectedOrderIds.includes(order.id));
          
          if (selectedOrders.length === 0) {
            toast.error('유효한 화물을 찾을 수 없습니다.');
            console.error('유효한 화물 없음');
            return;
          }
          
          // 문제: formStore.openForm 호출 방식 변경
          if (typeof window !== 'undefined') {
            // 선택한 주문 복사본 만들기 (참조 문제 방지)
            const ordersToSend = JSON.parse(JSON.stringify(selectedOrders));
            
            // 콘솔에 로그를 출력하여 디버깅 지원
            console.log('정산 생성 시작', ordersToSend.length, '개의 화물 선택됨');
            
            // 직접 브라우저 이벤트를 발생시켜 정산 폼 열기
            const event = new CustomEvent('openExpenditureForm', { 
              detail: { orders: ordersToSend } 
            });
            window.dispatchEvent(event);
            
            console.log('정산 폼 열기 이벤트 발송 완료');
          }
          
          // 선택된 화물 초기화
          set({ selectedOrderIds: [] });
          
        } catch (error) {
          console.error('정산 생성 중 오류 발생:', error);
          toast.error('정산 생성 중 오류가 발생했습니다.');
        }
      },
      
      // 화주별 그룹화 액션
      getSelectedOrders: () => {
        const { selectedOrderIds } = get();
        const allOrders = getMockBrokerOrders();
        return allOrders.filter(order => selectedOrderIds.includes(order.id));
      },
      
      getShipperGroups: () => {
        const selectedOrders = get().getSelectedOrders();
        const shipperGroups = new Map<string, { shipper: string; orders: IBrokerOrder[]; total: number; count: number }>();
        
        selectedOrders.forEach(order => {
          const shipper = order.company || "Unknown";
          if (!shipperGroups.has(shipper)) {
            shipperGroups.set(shipper, { shipper, orders: [], total: 0, count: 0 });
          }
          const group = shipperGroups.get(shipper);
          if (group) {
            group.orders.push(order);
            group.total += order.amount || 0;
            group.count++;
          }
        });
        
        return Array.from(shipperGroups.values());
      },
      
      selectOrdersByShipper: (shipper: string, isSelected: boolean) => {
        const { selectedOrderIds } = get();
        const selectedOrders = get().getSelectedOrders();
        
        const newSelectedOrderIds = isSelected
          ? [...selectedOrderIds, ...selectedOrders.filter(order => order.company === shipper).map(order => order.id)]
          : selectedOrderIds.filter(id => !selectedOrders.some(order => order.id === id && order.company === shipper));
        
        set({ selectedOrderIds: newSelectedOrderIds });
      }
    }),
    {
      name: 'Expenditure-waiting-store',
      partialize: (state) => ({
        filter: state.filter,
        pageSize: state.pageSize,
      }),
    }
  )
);

// 필터 적용 함수
const applyFilter = (orders: IBrokerOrder[], filter: IExpenditureWaitingFilter): IBrokerOrder[] => {
  return orders.filter(order => {
    // 검색어 필터링
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      const matchesSearchTerm = 
        order.id.toLowerCase().includes(searchTerm) ||
        order.departureLocation.toLowerCase().includes(searchTerm) ||
        order.arrivalLocation.toLowerCase().includes(searchTerm) ||
        (order.company && order.company.toLowerCase().includes(searchTerm)) ||
        (order.driver.name && order.driver.name.toLowerCase().includes(searchTerm));
        
      if (!matchesSearchTerm) return false;
    }
    
    // 출발지 필터링
    if (filter.departureCity && !order.departureLocation.includes(filter.departureCity)) {
      return false;
    }
    
    // 도착지 필터링
    if (filter.arrivalCity && !order.arrivalLocation.includes(filter.arrivalCity)) {
      return false;
    }
    
    // 차량 종류 필터링
    if (filter.vehicleType && order.vehicle.type !== filter.vehicleType) {
      return false;
    }
    
    // 중량 필터링
    if (filter.weight && order.vehicle.weight !== filter.weight) {
      return false;
    }
    
    // 상태 필터링
    if (filter.status && order.status !== filter.status) {
      return false;
    }
    
    // 회사 필터링
    if (filter.company && order.company !== filter.company) {
      return false;
    }
    
    // 담당자 필터링
    if (filter.manager && order.manager !== filter.manager) {
      return false;
    }
    
    // 날짜 필터링 (출발일 기준)
    if (filter.startDate && order.departureDateTime < filter.startDate) {
      return false;
    }
    
    if (filter.endDate) {
      // endDate에 하루를 더해서 해당 날짜를 포함시킴
      const endDateObj = new Date(filter.endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const adjustedEndDate = endDateObj.toISOString().split('T')[0];
      
      if (order.departureDateTime >= adjustedEndDate) {
        return false;
      }
    }
    
    return true;
  });
}; 