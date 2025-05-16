import { ICompanySnapshot } from "./order-ver01";

// 차주 관련 타입 정의
export type DriverStatus = '활성' | '비활성';
export type VehicleType = '카고' | '윙바디' | '냉동' | '탑차' | '리프트' | '기타';
export type TonnageType = '1톤' | '1.4톤' | '2.5톤' | '3.5톤' | '5톤' | '8톤' | '11톤' | '18톤' | '25톤' | '기타';
export type PermissionType = '일반' | '관리자';

// 차주 계정 정보 인터페이스
export interface IDriverAccount {
  id: string;
  email?: string;
  permission: PermissionType;
}

// 차량 화물함 정보 인터페이스
export interface ICargoBox {
  type: string;
  length: string;
}

// 차주 특이사항 인터페이스
export interface IDriverNote {
  id: string;
  content: string;
  date: Date;
}

// 차주 데이터 인터페이스
export interface IBrokerDriver {
  id: string;
  code?: string;
  name: string;  
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  tonnage: TonnageType;
  address: string;  
  businessNumber: string;
  dispatchCount?: number;
  status: DriverStatus;
  createdAt?: string;
  lastDispatchedAt?: string | null;
  lastSettlementStatus?: '완료' | '미정산' | '-';
  unsettledAmount?: number;
  isActive?: boolean;
  inactiveReason?: string;
  
  // 추가 속성
  cargoBox?: ICargoBox;
  manufactureYear?: string;
  account?: IDriverAccount;
  notes?: IDriverNote[];
}

// 차주 필터 인터페이스
export interface IBrokerDriverFilter {
  searchTerm: string;
  vehicleType: VehicleType | '';
  tonnage: TonnageType | '';
  status: DriverStatus | '';
  dispatchCount: string;  // '10건 이상', '30건 이상', '50건 이상'
  startDate: string | null;
  endDate: string | null;
} 