import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  getCompletedDispatches, 
  getSalesStatus,   
  closeSalesDispatch, 
  createSalesAndCloseDispatch,
  generateSalesSummary 
} from '@/services/broker-dispatch-service';
import { createSales } from '@/services/broker-sale-service';
import { IOrderDispatch} from '@/types/broker-dispatch';
import { IOrderDispatchWithSalesStatus, ISalesData, IOrderSale } from '@/types/broker-sale';

interface IBrokerDispatchState {
  // 상태
  completedDispatches: IOrderDispatchWithSalesStatus[];
  selectedDispatchId: string | null;
  selectedOrderId: string | null;
  salesSummary: ISalesData | null;
  loading: boolean;
  salesCreating: boolean;
  error: string | null;

  // 액션
  fetchCompletedDispatches: () => Promise<void>;
  selectDispatch: (dispatchId: string, orderId: string) => void;
  checkSalesStatus: (dispatchId: string) => Promise<boolean>;
  createDispatchSales: (dispatchId: string) => Promise<void>;
  generateSalesSummary: (dispatchId: string) => Promise<void>;
  resetSummary: () => void;
  resetError: () => void;
}

export const useBrokerDispatchStore = create<IBrokerDispatchState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      completedDispatches: [],
      selectedDispatchId: null,
      selectedOrderId: null,
      salesSummary: null,
      loading: false,
      salesCreating: false,
      error: null,

      // 운송 완료된 디스패치 목록 조회
      fetchCompletedDispatches: async () => {
        set({ loading: true, error: null });
        try {
          const dispatches = await getCompletedDispatches();
          
          // 각 디스패치의 매출 정산 상태 확인
          const dispatchesWithSalesStatus: IOrderDispatchWithSalesStatus[] = await Promise.all(
            dispatches.map(async (dispatch) => {
              try {
                const salesStatus = await getSalesStatus(dispatch.id);
                return {
                  ...dispatch,
                  hasSales: salesStatus.hasSales,
                  salesId: salesStatus.salesId,
                  salesStatus: salesStatus.salesStatus,
                };
              } catch (error) {
                // 상태 확인 실패 시 기본값 사용
                return {
                  ...dispatch,
                  hasSales: false,
                };
              }
            })
          );
          
          set({ completedDispatches: dispatchesWithSalesStatus, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '운송 완료 디스패치 목록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false });
        }
      },

      // 디스패치 선택
      selectDispatch: (dispatchId: string, orderId: string) => {
        set({ 
          selectedDispatchId: dispatchId, 
          selectedOrderId: orderId,
          salesSummary: null 
        });
      },

      // 디스패치 매출 정산 상태 확인
      checkSalesStatus: async (dispatchId: string) => {
        set({ loading: true, error: null });
        try {
          const salesStatus = await getSalesStatus(dispatchId);
          
          // 현재 상태의 디스패치 목록에서 해당 디스패치 정보 업데이트
          set((state) => ({
            completedDispatches: state.completedDispatches.map((dispatch) => 
              dispatch.id === dispatchId 
                ? { ...dispatch, hasSales: salesStatus.hasSales, salesId: salesStatus.salesId, salesStatus: salesStatus.salesStatus }
                : dispatch
            ),
            loading: false
          }));
          
          return salesStatus.hasSales;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '매출 정산 상태 확인 중 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      // 디스패치 매출 정산 생성
      createDispatchSales: async (dispatchId: string) => {
        const { salesSummary, selectedOrderId } = get();
        
        if (!selectedOrderId || !salesSummary) {
          set({ error: '매출 정산 데이터가 준비되지 않았습니다. 요약 정보를 먼저 생성해주세요.' });
          return;
        }
        
        set({ salesCreating: true, error: null });
        try {
          // 매출 정산 생성 및 디스패치 마감 처리
          await createSalesAndCloseDispatch(dispatchId, salesSummary);
          
          // 디스패치 목록 갱신
          await get().fetchCompletedDispatches();
          
          set({ salesCreating: false, salesSummary: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '매출 정산 생성 중 오류가 발생했습니다.';
          set({ error: errorMessage, salesCreating: false });
        }
      },

      // 매출 정산 요약 정보 생성
      generateSalesSummary: async (dispatchId: string) => {
        set({ loading: true, error: null });
        try {
          const summary = await generateSalesSummary(dispatchId);
          set({ salesSummary: summary, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '매출 정산 요약 정보 생성 중 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false });
        }
      },

      // 요약 정보 초기화
      resetSummary: () => {
        set({ salesSummary: null });
      },

      // 오류 초기화
      resetError: () => {
        set({ error: null });
      }
    }),
    { name: 'broker-dispatch-store' }
  )
); 