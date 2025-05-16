import { create } from 'zustand';
import { BrokerOrderStatusType } from '@/types/broker-order';
import { IBrokerOrderDetail } from '@/utils/mockdata/mock-broker-orders-detail';
import { getOrderWithDispatchDetail } from '@/services/broker-dispatch-service';
import { mapApiResponseToBrokerOrderDetail } from '@/utils/data-mapper';

// 중개 화물 상세 정보 스토어 인터페이스
interface IBrokerOrderDetailState {
  // 상태
  isSheetOpen: boolean;
  selectedOrderId: string | null;
  orderDetail: IBrokerOrderDetail | null;
  isLoading: boolean;
  error: string | null;
  useApi: boolean; // API 사용 여부
  
  // 액션
  openSheet: (orderId: string) => void;
  closeSheet: () => void;
  setOrderDetail: (orderDetail: IBrokerOrderDetail | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  toggleApiMode: () => void;
  
  // 유틸리티
  isActionAvailable: (action: 'edit' | 'cancel' | 'receipt') => boolean;
}

// 중개 화물 상세 정보 스토어 생성
export const useBrokerOrderDetailStore = create<IBrokerOrderDetailState>((set, get) => ({
  // 초기 상태
  isSheetOpen: false,
  selectedOrderId: null,
  orderDetail: null,
  isLoading: false,
  error: null,
  useApi: true, // 기본적으로 API 사용
  
  // 모달 열기
  openSheet: (orderId: string) => {
    set({ 
      isSheetOpen: true,
      selectedOrderId: orderId,
      error: null
    });
    
    // API 모드가 활성화된 경우 데이터 가져오기
    if (get().useApi) {
      get().fetchOrderDetail(orderId);
    }
  },
  
  // 모달 닫기
  closeSheet: () => set({ 
    isSheetOpen: false,
    selectedOrderId: null,
    orderDetail: null,
    error: null
  }),
  
  // 중개 화물 상세 정보 설정
  setOrderDetail: (orderDetail: IBrokerOrderDetail | null) => set({ orderDetail }),
  
  // 로딩 상태 설정
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  // 에러 설정
  setError: (error: string | null) => set({ error }),
  
  // API 모드 토글
  toggleApiMode: () => set(state => ({ useApi: !state.useApi })),
  
  // API로 상세 정보 가져오기
  fetchOrderDetail: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // API 호출
      const response = await getOrderWithDispatchDetail(orderId);
      
      // 응답 데이터 매핑
      const orderDetail = mapApiResponseToBrokerOrderDetail(response);
      
      set({ orderDetail, isLoading: false });
    } catch (error) {
      console.error('중개 화물 상세 정보 조회 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '중개 화물 상세 정보를 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 액션 버튼 활성화 여부 확인
  isActionAvailable: (action: 'edit' | 'cancel' | 'receipt') => {
    const { orderDetail } = get();
    if (!orderDetail) return false;
    
    const currentStatus = orderDetail.statusProgress;
    
    switch (action) {
      case 'edit':
        // 운송마감 상태가 아니면 수정 가능
        return currentStatus !== '운송마감';
      
      case 'cancel':
        // 상차완료 이전 상태에서만 취소 가능
        return currentStatus === '배차대기' || currentStatus === '배차완료';
      
      case 'receipt':
        // 하차완료 또는 운송마감 상태에서만 인수증 발급 가능
        return currentStatus === '하차완료' || currentStatus === '운송마감';
      
      default:
        return false;
    }
  }
})); 