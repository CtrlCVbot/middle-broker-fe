import { create } from 'zustand';
import { IOrderDetail } from '@/utils/mockdata/mock-orders-detail';
import { IOrderRegisterData } from '@/types/order-ver01';

// 화물 수정 스토어 인터페이스
interface IOrderEditState {
  // 상태
  orderId: string | null;         // 수정 중인 화물 ID
  originalData: IOrderDetail | null; // 원본 화물 데이터
  registerData: IOrderRegisterData;  // 수정 중인 데이터 (registerForm 호환)
  isLoading: boolean;             // 데이터 로딩 중 상태
  isSaving: boolean;              // 저장 중 상태
  hasChanged: boolean;            // 데이터 변경 여부
  error: string | null;           // 오류 메시지
  
  // 액션
  setOrderId: (orderId: string | null) => void;
  setOriginalData: (data: IOrderDetail | null) => void;
  setRegisterData: (data: Partial<IOrderRegisterData>) => void;
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  
  // 유틸리티
  isFieldEditable: (fieldName: string) => boolean;
  convertDetailToRegisterData: (detail: IOrderDetail) => IOrderRegisterData;
}

// 기본 등록 데이터
const initialRegisterData: IOrderRegisterData = {
  vehicleType: '카고',
  weightType: '1톤',
  cargoType: '',
  remark: '',
  departure: {
    id: '',
    address: '',
    roadAddress: '',
    jibunAddress: '',
    latitude: 0,
    longitude: 0,
    detailedAddress: '',
    name: '',
    company: '',
    contact: '',
    date: '',
    time: '',
    createdAt: new Date().toISOString()
  },
  destination: {
    id: '',
    address: '',
    roadAddress: '',
    jibunAddress: '',
    latitude: 0,
    longitude: 0,
    detailedAddress: '',
    name: '',
    company: '',
    contact: '',
    date: '',
    time: '',
    createdAt: new Date().toISOString()
  },
  selectedOptions: [],
  estimatedDistance: undefined,
  estimatedAmount: undefined
};

// 화물 수정 스토어 생성
export const useOrderEditStore = create<IOrderEditState>((set, get) => ({
  // 초기 상태
  orderId: null,
  originalData: null,
  registerData: { ...initialRegisterData },
  isLoading: false,
  isSaving: false,
  hasChanged: false,
  error: null,
  
  // 액션
  setOrderId: (orderId: string | null) => set({ orderId }),
  
  setOriginalData: (data: IOrderDetail | null) => {
    if (data) {
      const registerData = get().convertDetailToRegisterData(data);
      set({ 
        originalData: data, 
        registerData,
        hasChanged: false
      });
    } else {
      set({ originalData: null });
    }
  },
  
  setRegisterData: (data: Partial<IOrderRegisterData>) => {
    const currentData = get().registerData;
    const newData = { ...currentData };
    
    // 단일 필드 업데이트 처리
    if ('vehicleType' in data) newData.vehicleType = data.vehicleType as any;
    if ('weightType' in data) newData.weightType = data.weightType as any;
    if ('cargoType' in data) newData.cargoType = data.cargoType as string;
    if ('remark' in data) newData.remark = data.remark;
    if ('selectedOptions' in data) newData.selectedOptions = data.selectedOptions || [];
    if ('estimatedDistance' in data) newData.estimatedDistance = data.estimatedDistance;
    if ('estimatedAmount' in data) newData.estimatedAmount = data.estimatedAmount;
    
    // 출발지/도착지 정보 업데이트 (partial update 지원)
    if (data.departure) {
      newData.departure = { ...currentData.departure, ...data.departure };
    }
    if (data.destination) {
      newData.destination = { ...currentData.destination, ...data.destination };
    }
    
    set({ 
      registerData: newData,
      hasChanged: true // 데이터가 변경되었음을 표시
    });
  },
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setSaving: (isSaving: boolean) => set({ isSaving }),
  
  setError: (error: string | null) => set({ error }),
  
  resetState: () => set({ 
    orderId: null,
    originalData: null,
    registerData: { ...initialRegisterData },
    isLoading: false,
    isSaving: false,
    hasChanged: false,
    error: null
  }),
  
  // 배차 상태에 따라 필드 수정 가능 여부 반환
  isFieldEditable: (fieldName: string) => {
    const { originalData } = get();
    if (!originalData) return true; // 기본적으로 수정 가능
    
    const status = originalData.status;
    
    // 배차 요청 & 배차 준비 상태에서는 모든 필드 수정 가능
    if (status === '배차대기') {
      return true;
    }
    
    // 배차 대기 이후 상태에서는 비고만 수정 가능
    if (['배차완료', '상차완료', '운송중'].includes(status)) {
      return fieldName === 'remark';
    }
    
    // 하차 완료 & 정산 완료 상태에서는 수정 불가
    if (['하차완료', '운송마감'].includes(status)) {
      return false;
    }
    
    return false; // 기본적으로 수정 불가
  },
  
  // 화물 상세 데이터를 등록 폼 데이터 형식으로 변환
  convertDetailToRegisterData: (detail: IOrderDetail): IOrderRegisterData => {
    // 중량 타입 호환성 확인
    const weightType = detail.vehicle.weight || '1톤';
    const safeWeightType = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤'].includes(weightType) 
      ? weightType as any 
      : '1톤';
    
    return {
      vehicleType: detail.vehicle.type as any,
      weightType: safeWeightType,
      cargoType: detail.cargo.type,
      remark: detail.cargo.remark || '',
      departure: {
        id: '',
        address: detail.departure.address,
        roadAddress: '',
        jibunAddress: '',
        latitude: 0,
        longitude: 0,
        detailedAddress: detail.departure.detailedAddress || '',
        name: detail.departure.name,
        company: detail.departure.company,
        contact: detail.departure.contact,
        date: detail.departure.date,
        time: detail.departure.time,
        createdAt: new Date().toISOString()
      },
      destination: {
        id: '',
        address: detail.destination.address,
        roadAddress: '',
        jibunAddress: '',
        latitude: 0,
        longitude: 0,
        detailedAddress: detail.destination.detailedAddress || '',
        name: detail.destination.name,
        company: detail.destination.company,
        contact: detail.destination.contact,
        date: detail.destination.date,
        time: detail.destination.time,
        createdAt: new Date().toISOString()
      },
      selectedOptions: detail.cargo.options || [],
      estimatedDistance: 0, // 상세 정보에서는 거리 정보가 없음
      estimatedAmount: parseInt(detail.amount.replace(/,/g, ''))
    };
  }
})); 