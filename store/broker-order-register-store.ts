import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  IBrokerOrderRegisterData, 
  IBrokerLocationInfo,
  BROKER_VEHICLE_TYPES,
  BROKER_WEIGHT_TYPES,
  BrokerVehicleType, 
  BrokerWeightType
} from '@/types/broker-order';

// 초기 주소 정보
const initialLocationInfo: IBrokerLocationInfo = {
  address: '',
  detailedAddress: '',
  name: '',
  company: '',
  contact: '',
  date: '',
  time: ''
};

// 초기 중개 화물 등록 데이터
const initialBrokerOrderRegisterData: IBrokerOrderRegisterData = {
  vehicleType: '카고',
  weightType: '1톤',
  cargoType: '',
  remark: '',
  departure: {
    address: '',
    detailedAddress: '',
    name: '',
    company: '',
    contact: '',
    date: '',
    time: ''
  },
  destination: {
    address: '',
    detailedAddress: '',
    name: '',
    company: '',
    contact: '',
    date: '',
    time: ''
  },
  selectedOptions: [],
  estimatedDistance: undefined,
  estimatedAmount: undefined
};

// 최근 사용 위치 인터페이스
interface IBrokerRecentLocation {
  id: string;
  type: 'departure' | 'destination';
  info: IBrokerLocationInfo;
  timestamp: number;
}

// 중개 화물 등록 상태 스토어 인터페이스
export interface IBrokerOrderRegisterStore {
  registerData: IBrokerOrderRegisterData;
  isCalculating: boolean;
  recentLocations: IBrokerRecentLocation[];
  
  // 액션
  setVehicleType: (vehicleType: BrokerVehicleType) => void;
  setWeightType: (weightType: BrokerWeightType) => void;
  setCargoType: (cargoType: string) => void;
  setRemark: (remark: string) => void;
  setDeparture: (departure: IBrokerLocationInfo) => void;
  setDestination: (destination: IBrokerLocationInfo) => void;
  toggleOption: (optionId: string) => void;
  setEstimatedInfo: (distance: number, amount: number) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  resetForm: () => void;
  addRecentLocation: (type: 'departure' | 'destination', info: IBrokerLocationInfo) => void;
  useRecentLocation: (type: 'departure' | 'destination', locationId: string) => void;
}

// 중개 화물 등록 상태 스토어 구현
export const useBrokerOrderRegisterStore = create<IBrokerOrderRegisterStore>()(
  persist(
    (set) => ({
      registerData: initialBrokerOrderRegisterData,
      isCalculating: false,
      recentLocations: [],
      
      // 차량 종류 설정
      setVehicleType: (vehicleType) => set((state) => ({
        registerData: { ...state.registerData, vehicleType }
      })),
      
      // 중량 설정
      setWeightType: (weightType) => set((state) => ({
        registerData: { ...state.registerData, weightType }
      })),
      
      // 화물 종류 설정
      setCargoType: (cargoType) => set((state) => ({
        registerData: { ...state.registerData, cargoType }
      })),
      
      // 비고 설정
      setRemark: (remark) => set((state) => ({
        registerData: { ...state.registerData, remark }
      })),
      
      // 출발지 설정
      setDeparture: (departure) => set((state) => ({
        registerData: { ...state.registerData, departure }
      })),
      
      // 도착지 설정
      setDestination: (destination) => set((state) => ({
        registerData: { ...state.registerData, destination }
      })),
      
      // 옵션 토글
      toggleOption: (optionId) => set((state) => {
        const selectedOptions = [...state.registerData.selectedOptions];
        const index = selectedOptions.indexOf(optionId);
        
        if (index === -1) {
          selectedOptions.push(optionId);
        } else {
          selectedOptions.splice(index, 1);
        }
        
        return {
          registerData: {
            ...state.registerData,
            selectedOptions
          }
        };
      }),
      
      // 예상 거리 및 금액 설정
      setEstimatedInfo: (distance, amount) => set((state) => ({
        registerData: {
          ...state.registerData,
          estimatedDistance: distance,
          estimatedAmount: amount
        }
      })),
      
      // 계산 중 상태 설정
      setIsCalculating: (isCalculating) => set({ isCalculating }),
      
      // 폼 초기화
      resetForm: () => set({ registerData: initialBrokerOrderRegisterData }),
      
      // 최근 사용 위치 추가
      addRecentLocation: (type, info) => set((state) => {
        const recentLocations = [...state.recentLocations];
        const newLocation: IBrokerRecentLocation = {
          id: Date.now().toString(),
          type,
          info,
          timestamp: Date.now()
        };
        
        // 최대 10개까지만 저장
        if (recentLocations.length >= 10) {
          recentLocations.pop();
        }
        
        return {
          recentLocations: [newLocation, ...recentLocations]
        };
      }),
      
      // 최근 사용 위치 사용
      useRecentLocation: (type, locationId) => set((state) => {
        const location = state.recentLocations.find(loc => loc.id === locationId);
        if (!location) return state;
        
        return {
          registerData: {
            ...state.registerData,
            [type]: location.info
          }
        };
      })
    }),
    {
      name: 'broker-order-register-storage',
      partialize: (state) => ({
        recentLocations: state.recentLocations
      })
    }
  )
); 