import { create } from 'zustand';
import { OrderStatusType } from '@/types/order-ver01';
import { IOrderDetail } from '@/utils/mockdata/mock-orders-detail';

// 화물 상세 정보 스토어 인터페이스
interface IOrderDetailState {
  // 상태
  isSheetOpen: boolean;
  selectedOrderId: string | null;
  orderDetail: IOrderDetail | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  openSheet: (orderId: string) => void;
  closeSheet: () => void;
  setOrderDetail: (orderDetail: IOrderDetail | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 유틸리티
  isActionAvailable: (action: 'edit' | 'cancel' | 'receipt') => boolean;
}

// 화물 상세 정보 스토어 생성
export const useOrderDetailStore = create<IOrderDetailState>((set, get) => ({
  // 초기 상태
  isSheetOpen: false,
  selectedOrderId: null,
  orderDetail: null,
  isLoading: false,
  error: null,
  
  // 모달 열기
  openSheet: (orderId: string) => set({ 
    isSheetOpen: true,
    selectedOrderId: orderId,
    error: null
  }),
  
  // 모달 닫기
  closeSheet: () => set({ 
    isSheetOpen: false,
    selectedOrderId: null,
    orderDetail: null,
    error: null
  }),
  
  // 화물 상세 정보 설정
  setOrderDetail: (orderDetail: IOrderDetail | null) => set({ orderDetail }),
  
  // 로딩 상태 설정
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  // 에러 설정
  setError: (error: string | null) => set({ error }),
  
  // 액션 버튼 활성화 여부 확인
  isActionAvailable: (action: 'edit' | 'cancel' | 'receipt') => {
    const { orderDetail } = get();
    if (!orderDetail) return false;
    
    const currentStatus = orderDetail.statusProgress;
    
    switch (action) {
      case 'edit':
        // 운송완료 상태가 아니면 수정 가능
        return currentStatus !== '운송완료';
      
      case 'cancel':
        // 상차완료 이전 상태에서만 취소 가능
        return currentStatus === '배차대기' || currentStatus === '배차완료';
      
      case 'receipt':
        // 하차완료 또는 운송완료 상태에서만 인수증 발급 가능
        return currentStatus === '하차완료' || currentStatus === '운송완료';
      
      default:
        return false;
    }
  }
})); 