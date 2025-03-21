import { create } from 'zustand';
import { 
  AdditionalFeeType, 
  IAdditionalFee, 
  IIncome, 
  IIncomeCreateRequest 
} from '@/types/income';
import { IBrokerOrder } from '@/types/broker-order';
import { useIncomeStore } from './income-store';
import { getMockBrokerOrders } from '@/utils/mockdata/mock-broker-orders';
import { generateId } from '@/lib/utils';

// 관리자 목록
const DEFAULT_MANAGERS = ['김중개', '이주선', '박배송', '정관리', '최물류'];

// 정산 폼 데이터 인터페이스
interface IIncomeFormData {
  shipperName: string;              // 화주명
  businessNumber: string;           // 사업자번호
  billingCompany: string;           // 매출 회사(청구 주체)
  manager: string;                  // 담당자
  managerContact: string;           // 담당자 연락처
  periodType: 'departure' | 'arrival'; // 정산 구분 (상차/하차 기준)
  startDate: string;                // 시작일
  endDate: string;                  // 종료일
  isTaxFree: boolean;               // 면세 여부
  memo: string;                     // 메모
  
  // 제출 시 추가되는 필드
  totalBaseAmount?: number;         // 기본 운임 합계
  totalAdditionalAmount?: number;   // 추가금 합계
  tax?: number;                     // 세금
  finalAmount?: number;             // 최종 금액
  orderCount?: number;              // 화물 건수
  orderIds?: string[];              // 화물 ID 목록
}

// 정산 폼 스토어 상태 인터페이스
interface IIncomeFormState {
  isOpen: boolean;                  // 폼 열림 여부
  selectedOrders: IBrokerOrder[];   // 선택된 화물 목록
  formData: IIncomeFormData;        // 폼 데이터
  additionalFees: IAdditionalFee[]; // 추가금 목록
  companies: string[];              // 회사 목록 (매출 회사 선택용)
  managers: string[];               // 담당자 목록
  isLoading: boolean;               // 로딩 상태
  error: string | null;             // 에러 메시지
  
  // 액션
  openForm: (orders: IBrokerOrder[]) => void;  // 폼 열기
  closeForm: () => void;                       // 폼 닫기
  setFormField: <K extends keyof IIncomeFormData>(
    key: K, 
    value: IIncomeFormData[K]
  ) => void;  // 폼 필드 설정
  addAdditionalFee: (fee: Omit<IAdditionalFee, 'id' | 'createdAt' | 'createdBy'>) => void;  // 추가금 추가
  removeAdditionalFee: (id: string) => void;   // 추가금 제거
  resetForm: () => void;                       // 폼 초기화
  submitForm: (data: IIncomeCreateRequest) => void;  // 폼 제출
}

// 초기 폼 데이터
const initialFormData: IIncomeFormData = {
  shipperName: '',
  businessNumber: '',
  billingCompany: '',
  manager: DEFAULT_MANAGERS[0],
  managerContact: '010-1234-5678',
  periodType: 'departure',
  startDate: '',
  endDate: '',
  isTaxFree: false,
  memo: '',
};

// 회사 목록 추출 (매출 회사 선택용)
const extractCompanies = (): string[] => {
  const allOrders = getMockBrokerOrders();
  const companiesSet = new Set<string>();
  
  allOrders.forEach(order => {
    if (order.company) {
      companiesSet.add(order.company);
    }
  });
  
  return Array.from(companiesSet);
};

// 정산 폼 스토어 생성
export const useIncomeFormStore = create<IIncomeFormState>((set, get) => ({
  isOpen: false,
  selectedOrders: [],
  formData: { ...initialFormData },
  additionalFees: [],
  companies: extractCompanies(),
  managers: DEFAULT_MANAGERS,
  isLoading: false,
  error: null,
  
  openForm: (orders) => {
    set({
      isOpen: true,
      selectedOrders: orders,
      formData: { ...initialFormData },
      additionalFees: [],
      error: null,
    });
  },
  
  closeForm: () => {
    set({ isOpen: false });
  },
  
  setFormField: (key, value) => {
    set(state => ({
      formData: {
        ...state.formData,
        [key]: value,
      }
    }));
  },
  
  addAdditionalFee: (fee) => {
    const newFee: IAdditionalFee = {
      id: generateId('ADDFEE'),
      createdAt: new Date().toISOString(),
      createdBy: get().formData.manager,
      ...fee,
    };
    
    set(state => ({
      additionalFees: [...state.additionalFees, newFee],
    }));
  },
  
  removeAdditionalFee: (id) => {
    set(state => ({
      additionalFees: state.additionalFees.filter(fee => fee.id !== id),
    }));
  },
  
  resetForm: () => {
    set({
      formData: { ...initialFormData },
      additionalFees: [],
      error: null,
    });
  },
  
  submitForm: (data) => {
    set({ isLoading: true });
    
    // 실제 API 호출 대신 목업 데이터 처리
    setTimeout(() => {
      try {
        // 정산 스토어에 새 정산 추가
        useIncomeStore.getState().addIncome({
          ...data,
          additionalFees: get().additionalFees,
        });
        
        // 성공 처리
        set({
          isOpen: false,
          isLoading: false,
          selectedOrders: [],
          formData: { ...initialFormData },
          additionalFees: [],
        });
      } catch (error) {
        // 에러 처리
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : '정산 생성 실패',
        });
      }
    }, 800); // 0.8초 지연 (로딩 상태 표시용)
  },
})); 