import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  IOrderRegisterData, 
  ILocationInfo,
  VEHICLE_TYPES,
  WEIGHT_TYPES,
  VehicleType, 
  WeightType
} from '@/types/order';

// 초기 주소 정보
const initialLocationInfo: ILocationInfo = {
  address: '',
  detailedAddress: '',
  name: '',
  company: '',
  contact: '',
  date: '',
  time: ''
};

// 초기 화물 등록 데이터
const initialOrderRegisterData: IOrderRegisterData = {
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

// 최근 사용 주소 저장 인터페이스
interface IRecentLocation {
  id: string;
  type: 'departure' | 'destination';
  info: ILocationInfo;
  timestamp: number;
}

// 스토어 상태 인터페이스
export interface IOrderRegisterStore {
  registerData: IOrderRegisterData;
  isCalculating: boolean;
  recentLocations: IRecentLocation[];
  
  // 액션
  setVehicleType: (vehicleType: VehicleType) => void;
  setWeightType: (weightType: WeightType) => void;
  setCargoType: (cargoType: string) => void;
  setRemark: (remark: string) => void;
  setDeparture: (departure: ILocationInfo) => void;
  setDestination: (destination: ILocationInfo) => void;
  toggleOption: (optionId: string) => void;
  setEstimatedInfo: (distance: number, amount: number) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  resetForm: () => void;
  addRecentLocation: (type: 'departure' | 'destination', info: ILocationInfo) => void;
  useRecentLocation: (type: 'departure' | 'destination', locationId: string) => void;
}

// 화물 등록 스토어 생성
export const useOrderRegisterStore = create<IOrderRegisterStore>()(
  persist(
    (set) => ({
      // 초기 상태
      registerData: { ...initialOrderRegisterData },
      isCalculating: false,
      recentLocations: [],
      
      // 액션
      setVehicleType: (vehicleType) => 
        set((state) => ({
          registerData: { ...state.registerData, vehicleType }
        })),
        
      setWeightType: (weightType) => 
        set((state) => ({
          registerData: { ...state.registerData, weightType }
        })),
        
      setCargoType: (cargoType) => 
        set((state) => ({
          registerData: { ...state.registerData, cargoType }
        })),
        
      setRemark: (remark) => 
        set((state) => ({
          registerData: { ...state.registerData, remark }
        })),
        
      setDeparture: (departure) => 
        set((state) => ({
          registerData: { ...state.registerData, departure: { ...state.registerData.departure, ...departure } }
        })),
        
      setDestination: (destination) => 
        set((state) => ({
          registerData: { ...state.registerData, destination: { ...state.registerData.destination, ...destination } }
        })),
        
      toggleOption: (optionId) => 
        set((state) => {
          const selectedOptions = [...state.registerData.selectedOptions];
          const index = selectedOptions.indexOf(optionId);
          
          if (index === -1) {
            selectedOptions.push(optionId);
          } else {
            selectedOptions.splice(index, 1);
          }
          
          return {
            registerData: { ...state.registerData, selectedOptions }
          };
        }),
        
      setEstimatedInfo: (distance, amount) => 
        set((state) => ({
          registerData: { ...state.registerData, estimatedDistance: distance, estimatedAmount: amount }
        })),
        
      setIsCalculating: (isCalculating) => 
        set((state) => ({
          isCalculating
        })),
        
      resetForm: () => 
        set({
          registerData: { ...initialOrderRegisterData },
          isCalculating: false,
          recentLocations: []
        }),
        
      addRecentLocation: (type, info) => 
        set((state) => {
          // 최근 사용 주소에 추가
          const newLocation: IRecentLocation = {
            id: Date.now().toString(),
            type,
            info: { ...info },
            timestamp: Date.now()
          };
          
          // 중복 주소 처리 (동일한 주소가 있으면 제거)
          const filteredLocations = state.recentLocations
            .filter(loc => !(loc.type === type && loc.info.address === info.address));
          
          // 최대 10개까지만 저장
          const recentLocations = [newLocation, ...filteredLocations]
            .slice(0, 10);
            
          return { recentLocations };
        }),
        
      useRecentLocation: (type, locationId) => 
        set((state) => {
          const location = state.recentLocations.find(loc => loc.id === locationId);
          if (!location) return state;
          
          return {
            registerData: {
              ...state.registerData,
              [type]: { ...location.info }
            }
          };
        })
    }),
    {
      name: 'order-register-storage'
    }
  )
); 