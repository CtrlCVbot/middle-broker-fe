import { create } from 'zustand';
import { IBrokerSettlementState, IOrderSale } from '@/types/settlement';
import { createSale, checkSaleExists, createPurchase, checkPurchaseExists } from '@/services/broker-settlement-service';

export const useBrokerSettlementStore = create<IBrokerSettlementState & {
  // 액션들
  createSale: (orderId: string, dispatchId: string) => Promise<IOrderSale | null>;
  createPurchase: (orderId: string, dispatchId: string) => Promise<IOrderSale | null>;
  checkOrderClosed: (orderId: string) => Promise<boolean>;
  resetState: () => void;
}>((set, get) => ({
  // 초기 상태
  isLoading: false,
  error: null,
  currentSale: null,
  isSaleClosed: false,

  // 매출 정산 데이터 생성 액션
  createSale: async (orderId: string, dispatchId: string) => {
    try {
      set({ isLoading: true, error: null });

      // 이미 매출 정산이 생성되었는지 확인
      const exists = await get().checkOrderClosed(orderId);
      if (exists) {
        set({ isLoading: false, error: '이미 매출 정산이 생성된 주문입니다.', isSaleClosed: true });
        return null;
      }

      // 매출 정산 데이터 생성
      const saleData = await createSale(orderId, dispatchId);
      set({ 
        isLoading: false, 
        currentSale: saleData,
        isSaleClosed: true 
      });
      
      return saleData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '매출 정산 생성 중 오류가 발생했습니다.';
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

   // 매입 정산 데이터 생성 액션
   createPurchase: async (orderId: string, dispatchId: string) => {
    try {
      set({ isLoading: true, error: null });

      // 이미 매출 정산이 생성되었는지 확인
      const exists = false;//await get().checkOrderClosed(orderId);
      if (exists) {
        set({ isLoading: false, error: '이미 매입 정산이 생성된 주문입니다.', isSaleClosed: true });
        return null;
      }

      // 매입 정산 데이터 생성
      const saleData = await createPurchase(orderId, dispatchId);
      set({ 
        isLoading: false, 
        currentSale: saleData,
        isSaleClosed: true 
      });
      
      return saleData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '매입 정산 생성 중 오류가 발생했습니다.';
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  // 주문이 이미 마감되었는지 확인하는 액션
  checkOrderClosed: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const exists = await checkSaleExists(orderId);
      set({ 
        isLoading: false, 
        isSaleClosed: exists 
      });
      
      return exists;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '매출 정산 확인 중 오류가 발생했습니다.';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  // 상태 초기화 액션
  resetState: () => {
    set({
      isLoading: false,
      error: null,
      currentSale: null,
      isSaleClosed: false
    });
  }
})); 