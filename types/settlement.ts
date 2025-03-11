// 정산 상태 타입
export type SettlementStatus = "COMPLETED" | "PENDING";

// 정산 항목 인터페이스
export interface ISettlementItem {
  id: string;
  orderId: string;
  orderDate: string;
  transportFee: number;
  additionalFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  description?: string;
  driverName: string;
  vehicleNumber: string;
}

// 정산 인터페이스
export interface ISettlement {
  id: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: SettlementStatus;
  totalAmount: number;
  requestDate: string;
  completedDate?: string;
  items: ISettlementItem[];
}

// 정산 차트 데이터 인터페이스
export interface ISettlementChartData {
  monthlyTrend: {
    month: string;
    completed: number;
    pending: number;
  }[];
  companyDistribution: {
    companyName: string;
    amount: number;
  }[];
  driverContribution: {
    driverName: string;
    amount: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
}

// 정산 필터 인터페이스
export interface ISettlementFilters {
  startDate: string | null;
  endDate: string | null;
  companyName: string | null;
  driverName: string | null;
  status: SettlementStatus | null;
}

// 정산 스토어 상태 인터페이스
export interface ISettlementState {
  settlements: ISettlement[];
  loading: {
    list: boolean;
    detail: boolean;
    chart: boolean;
  };
  selectedSettlement: ISettlement | null;
  chartData: ISettlementChartData;
  filters: ISettlementFilters;
  
  // 액션
  fetchSettlements: () => Promise<void>;
  fetchSettlementById: (id: string) => Promise<void>;
  fetchChartData: () => Promise<void>;
  updateSettlementStatus: (id: string, status: SettlementStatus) => Promise<void>;
  applyFilters: (filters: Partial<ISettlementFilters>) => void;
  resetFilters: () => void;
  downloadExcel: () => Promise<void>;
  downloadPdf: () => Promise<void>;
} 