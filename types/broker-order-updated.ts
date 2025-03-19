// 중개 화물 관리 시스템 타입 정의

// 상수 임포트
import { 
  BROKER_VEHICLE_TYPES, 
  BROKER_WEIGHT_TYPES, 
  PAYMENT_METHODS, 
  LOADING_METHODS,
  BROKER_ORDER_STATUS,
  ADDITIONAL_FEE_TYPES,
  CALL_CENTER_OPTIONS
} from "@/utils/mockdata/constants";

// 중개 화물 상태 타입 정의
export type BrokerOrderStatusType = typeof BROKER_ORDER_STATUS[number];

// 콜센터 타입 정의 
export type CallCenterType = typeof CALL_CENTER_OPTIONS[number];

// 결제 방식 타입 정의
export type PaymentMethodType = typeof PAYMENT_METHODS[number];

// 상하차 방식 타입 정의
export type LoadingMethodType = typeof LOADING_METHODS[number];

// 추가금 타입 정의
export type AdditionalFeeType = typeof ADDITIONAL_FEE_TYPES[number];

// 중개 화물 로그 항목 인터페이스
export interface IBrokerOrderLog {
  status: BrokerOrderStatusType;
  time: string;
  date: string;
  handler?: string;
  location?: string;
  remark?: string;
}

// 차량 종류
export type BrokerVehicleType = typeof BROKER_VEHICLE_TYPES[number];

// 차량 중량
export type BrokerWeightType = typeof BROKER_WEIGHT_TYPES[number];

// 운송 옵션
export interface IBrokerTransportOption {
  id: string;
  label: string;
  description?: string;
}

// 추가금 대상 정의
export interface IAdditionalFeeTarget {
  charge: boolean;
  dispatch: boolean;
}

// 추가금 인터페이스
export interface IAdditionalFee {
  id: string;
  type: AdditionalFeeType;
  amount: number | string;
  memo: string;
  target: IAdditionalFeeTarget;
}

// 업체 주의사항 인터페이스
export interface ICompanyWarning {
  id: string;
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

// 주소 정보 인터페이스 (확장)
export interface IBrokerLocationInfo {
  address: string;
  detailedAddress?: string;
  name: string;
  company: string;
  contact: string;
  date: string;
  time: string;
  loadingMethod?: LoadingMethodType; // 상하차 방법 추가
}

// 화물 정보 인터페이스 (확장)
export interface ICargoInfo {
  type: string;
  options?: string[];
  weight?: string;
  remark?: string;
  vehicleType?: string;
  paymentMethod?: PaymentMethodType; // 결제 방법 추가
}

// 화주 정보 인터페이스 (확장)
export interface IShipperInfo {
  name: string;
  manager: string;
  contact: string;
  email: string;
  warnings?: ICompanyWarning[]; // 업체 주의사항 추가
}

// 기본 화물 정보
export interface IBrokerOrderBaseInfo {
  departure: IBrokerLocationInfo;
  destination: IBrokerLocationInfo;
  cargo: ICargoInfo;
  shipper: IShipperInfo;
}

// 운임/정산 정보 인터페이스
export interface IFeeInfo {
  estimated?: string | number;
  contracted?: string | number;
  discount?: string | number;
  baseAmount?: string | number;
  chargeAmount?: string | number;
  additionalFees?: IAdditionalFee[];
  dispatchTotal?: number;
  chargeTotal?: number;
  profit?: number;
}

// 정산 정보 인터페이스
export interface ISettlementInfo {
  id?: string;
  status?: string;
  dueDate?: string;
  completedDate?: string;
  method?: string;
} 