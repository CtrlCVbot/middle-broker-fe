import { create } from 'zustand';
import { 
  IChargeGroupWithLines,
  IFinanceSummary,
  IAdditionalFeeInput
} from '@/types/broker-charge';
import { 
  getChargeGroupsByOrderId,
  createChargeFromAdditionalFee
} from '@/services/broker-charge-service';
import { mapChargeDataToFinanceSummary } from '@/utils/charge-mapper';

interface IBrokerChargeState {  
    // 상태  
    isLoading: boolean;  error: string | null;  
    chargeGroups: IChargeGroupWithLines[];  
    financeSummary: IFinanceSummary | null;    
    // 액션  
    fetchChargesByOrderId: (orderId: string) => Promise<IChargeGroupWithLines[]>;  
    addCharge: (fee: IAdditionalFeeInput, orderId: string, dispatchId?: string) => Promise<boolean>;  
    resetChargeState: () => void;}

export const useBrokerChargeStore = create<IBrokerChargeState>((set, get) => ({
  // 초기 상태
  isLoading: false,
  error: null,
  chargeGroups: [],
  financeSummary: null,
  
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
  }
})); 