// 차주 관련 타입 정의
export type DriverStatus = '활성' | '비활성';
export type VehicleType = '카고' | '윙바디' | '냉동' | '탑차' | '리프트' | '기타';
export type TonnageType = '1톤' | '1.4톤' | '2.5톤' | '3.5톤' | '5톤' | '8톤' | '11톤' | '18톤' | '25톤' | '기타';

// 차주 데이터 인터페이스
export interface IBrokerDriver {
  id: string;
  code: string;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  tonnage: TonnageType;
  address: string;
  companyName: string;
  businessNumber: string;
  dispatchCount: number;
  status: DriverStatus;
  createdAt: string;
  lastDispatchedAt: string | null;
  lastSettlementStatus: '완료' | '미정산' | '-';
  unsettledAmount: number;
  isActive: boolean;
  inactiveReason?: string;
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