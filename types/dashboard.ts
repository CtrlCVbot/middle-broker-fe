/**
 * Dashboard 관련 타입 정의
 */

// KPI 지표 타입 정의
export interface IKPI {
  monthlyOrderCount: number;
  monthlyOrderAmount: number;
  monthlyOrderAverage: number;
  weeklyTarget: {
    target: number;
    current: number;
    percentage: number;
  };
  monthlyTarget: {
    target: number;
    current: number;
    percentage: number;
  };
  meta?: {
    companyId: string;
    from: string;
    to: string;
    basisField: string;
    currency: 'KRW';
  };
}

// 상태 통계 타입
export interface IStatusStat {
  status: string;
  count: number;
  percentage: number;
}

// 상태 로그 타입
export interface IStatusLog {
  id: string;
  orderNumber: string;
  timestamp: string;
  previousStatus: string | null;
  currentStatus: string;
  description: string;
  operator: string;
}

// 트렌드 데이터 포인트 타입
export interface ITrendDataPoint {
  date: string;
  orderCount: number;
  totalAmount: number;
  averageAmount: number;
}

// 지역 통계 타입
export interface IRegionStats {
  topDepartureRegions: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  topDestinationRegions: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

// 무게별 통계 타입
export interface IWeightStat {
  weight: string;
  count: number;
  percentage: number;
}

// 최근 주문 타입
export interface IRecentOrder {
  id: string;
  orderNumber: string;
  cargoName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  amount: number;
  createdAt: string;
} 