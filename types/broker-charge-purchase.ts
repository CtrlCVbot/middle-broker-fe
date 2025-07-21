import { z } from 'zod';
import { IAddressSnapshot } from '@/types/order';

// Enum 타입 정의
export type ChargeStage = 'estimate' | 'progress' | 'completed';
export type ChargeReason = 'base_freight' | 'extra_wait' | 'night_fee' | 'toll' | 'discount' | 'penalty' | 'etc';
export type ChargeSide = 'sales' | 'purchase';

// API 응답 기본 타입
export interface IApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// 운임 그룹 타입
export interface IChargeGroup {
  id: string;
  orderId: string;
  dispatchId?: string;
  stage: ChargeStage;
  reason: ChargeReason;
  description?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 운임 라인 타입
export interface IChargeLine {
  id: string;
  groupId: string;
  side: ChargeSide;
  amount: number;
  memo?: string;
  taxRate?: number;
  taxAmount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 운임 그룹과 라인을 함께 포함하는 타입
export interface IChargeGroupWithLines extends IChargeGroup {
  chargeLines: IChargeLine[];
}

// 화면에서 사용할 추가 비용 타입
export interface IAdditionalFeeInput {
  type: string;
  amount: string;
  memo: string;
  target: {
    charge: boolean;
    dispatch: boolean;
  };
  amounts?: {
    charge?: string;
    dispatch?: string;
  };
}

// 운임 그룹 생성 요청 스키마
export const CreateChargeGroupSchema = z.object({
  orderId: z.string().uuid(),
  dispatchId: z.string().uuid().optional(),
  stage: z.enum(['estimate', 'progress', 'completed']),
  reason: z.enum(['base_freight', 'extra_wait', 'night_fee', 'toll', 'discount', 'penalty', 'etc']),
  description: z.string().optional()
});

export type CreateChargeGroupInput = z.infer<typeof CreateChargeGroupSchema>;

// 운임 라인 생성 요청 스키마
export const CreateChargeLineSchema = z.object({
  groupId: z.string().uuid(),
  side: z.enum(['sales', 'purchase']),
  amount: z.number().nonnegative(),
  memo: z.string().optional(),
  taxRate: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional()
});

export type CreateChargeLineInput = z.infer<typeof CreateChargeLineSchema>;

// 운임 그룹과 라인을 한 번에 생성하기 위한 통합 스키마
export const CreateChargeSchema = z.object({
  group: CreateChargeGroupSchema,
  salesLine: CreateChargeLineSchema.omit({ groupId: true }).optional(),
  purchaseLine: CreateChargeLineSchema.omit({ groupId: true }).optional()
});

export type CreateChargeInput = z.infer<typeof CreateChargeSchema>;

// 운임 정보 요약 타입 (FinanceSummaryCard에 사용)
export interface IFinanceItem {
  label: string;
  amount: number;
}

export interface IFinanceSummary {
  title?: string;
  date?: string;
  estimate?: IFinanceItem[];
  income?: IFinanceItem[];
  expense?: IFinanceItem[];
  balance?: number;
}

// 매출 인보이스 상태 타입
export type OrderPurchaseStatus = 'draft' | 'issued' | 'paid' | 'canceled';

// 매출 인보이스 타입
export interface IOrderPurchase {
  id: string;
  orderId: string;
  companyId: string;
  invoiceNumber?: string;
  status: OrderPurchaseStatus;
  issueDate?: string;
  dueDate?: string;
  subtotalAmount: number;
  taxAmount?: number;
  totalAmount: number;
  financialSnapshot?: any;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 매출 인보이스 요약 정보 (회사별)
export interface IOrderPurchaseSummary {
  companyId: string;
  companyName: string;
  count: number;
  chargeAmount: number; // 청구액 (운송비)
  dispatchAmount: number; // 배차비
  profitAmount: number; // 수익 (청구액 - 배차비)
}

// 정산 대기 항목 타입
export interface ISettlementWaitingItem {
  id: string;
  orderId: string;
  companyId: string;
  companyName: string;
  companyBusinessNumber: string;
  companyCeo: string;
  companyBankCode: string;
  companyBankAccountHolder: string;
  companyBankAccount: string;
  pickupName: string;
  deliveryName: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  pickupAddressSnapshot: IAddressSnapshot | null;
  deliveryAddressSnapshot: IAddressSnapshot | null;
  requestedVehicleWeight: number;
  requestedVehicleType: string;
  assignedDriverSnapshot: any;
  chargeAmount: number; // 청구액 (운송비)
  dispatchAmount: number; // 배차비
  profitAmount: number; // 수익 (청구액 - 배차비)
  createdAt: string;
  isClosed: boolean;
  flowStatus: string;
  amount: number;
  
}

// 정산 대기 목록 페이지 응답 타입
export interface ISettlementWaitingResponse {
  data: ISettlementWaitingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 회사별 정산 요약 타입
export interface ICompanySummary {
  companyId: string;
  companyName: string;
  items: number;
  chargeAmount: number;
  dispatchAmount: number;
  profitAmount: number;
}

// 전체 정산 요약 타입
export interface ISettlementSummary {
  totalItems: number;
  totalChargeAmount: number;
  totalDispatchAmount: number;
  totalProfitAmount: number;
  companies: ICompanySummary[];
}

// 정산 기간 타입
export type SettlementPeriodType = 'departure' | 'arrival';

// 정산 폼 데이터 타입
export interface ISettlementFormData {
  shipperId: string;
  shipperName: string;
  shipperCeo: string;
  businessNumber: string;
  billingCompany: string;
  managerId: string;
  manager?: string;
  managerContact?: string;
  managerEmail?: string;
  periodType: SettlementPeriodType;
  startDate: string;
  endDate: string;
  dueDate?: string;
  memo?: string;
  taxFree: boolean;
  hasTax: boolean;
  issueInvoice: boolean;
  paymentMethod: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  totalAmount: number;
  totalTaxAmount: number;
  totalAmountWithTax: number;
  itemExtraAmount?: number;
  bundleExtraAmount?: number;
  orderCount?: number;
  invoiceIssuedAt?: string | null;
  depositReceivedAt?: string | null;
  status?: PurchaseBundleStatus;
}

// 정산 폼 시트 상태 타입
export interface ISettlementFormState {
  isOpen: boolean;
  selectedItems: ISettlementWaitingItem[];
  formData: ISettlementFormData;
  isLoading: boolean;
}

// 매출 번들(정산 묶음) 관련 타입
//export type SalesMode= 'WAITING' | 'MATCHING' | 'COMPLETED';
export type PurchaseMode= 'WAITING' | 'MATCHING' | 'COMPLETED';
//port type SalesBundleStatus = 'draft' | 'issued' | 'paid' | 'canceled';
export type PurchaseBundleStatus = 'draft' | 'issued' | 'paid' | 'canceled';
export type BundleAdjType = 'discount' | 'surcharge';
export type BundlePeriodType = 'departure' | 'arrival' | 'etc';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'etc';


export interface IPurchaseMode {
  mode: PurchaseMode;
}

export interface IPurchaseBundle {
  id: string;
  companyId: string;
  companySnapshot?: any;
  managerId?: string;
  managerSnapshot?: any;
  paymentMethod: PaymentMethod;
  bankCode?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  settlementMemo?: string;
  periodType: BundlePeriodType;
  periodFrom?: string;
  periodTo?: string;
  invoiceIssuedAt?: string;
  depositRequestedAt?: string;
  depositReceivedAt?: string;
  settlementConfirmedAt?: string;
  settlementBatchId?: string;
  settledAt?: string;
  invoiceNo?: string;
  totalAmount: number;
  totalTaxAmount?: number;
  totalAmountWithTax?: number;
  status: PurchaseBundleStatus;
  createdAt: string;
  updatedAt: string;
  items?: IPurchaseBundleItem[];
  adjustments?: IPurchaseBundleAdjustment[];
}

export interface IPurchaseBundleItem {
  id: string;
  bundleId: string;
  orderSalesId: string;
  baseAmount: number;
  createdAt: string;
  updatedAt: string;
  orderPurchase?: IOrderPurchase;
}

export interface IPurchaseBundleAdjustment {
  id: string;
  bundleId: string;
  type: BundleAdjType;
  description?: string;
  amount: number;
  taxAmount: number;
  createdAt: string;
  createdBy: string;
}

// 개별 화물 추가금 타입 (새로 추가)
export interface IPurchaseItemAdjustment {
  id: string;
  bundleItemId: string;
  type: BundleAdjType;
  description?: string;
  amount: number;
  taxAmount: number;
  createdAt: string;
  createdBy: string;
}

// 화물 목록 상세 정보 (orderPurchases, orderDispatches, orders 조인 정보 포함)
export interface IPurchaseBundleItemWithDetails extends IPurchaseBundleItem {
  orderDetails: {
    orderId: string;
    companyId: string;
    companyName: string;
    pickupName: string;
    deliveryName: string;
    pickupDate: string;
    deliveryDate: string;
    amount: number;
  };
  adjustments: IPurchaseItemAdjustment[];
}

// 통합 추가금 생성/수정 입력 타입
export interface ICreateBundleAdjustmentInput {
  type: BundleAdjType;
  description?: string;
  amount: number;
  taxAmount?: number;
}

export interface IUpdateBundleAdjustmentInput {
  type?: BundleAdjType;
  description?: string;
  amount?: number;
  taxAmount?: number;
}

// 개별 화물 추가금 생성/수정 입력 타입
export interface ICreateItemAdjustmentInput {
  type: BundleAdjType;
  description?: string;
  amount: number;
  taxAmount?: number;
}

export interface IUpdateItemAdjustmentInput {
  type?: BundleAdjType;
  description?: string;
  amount?: number;
  taxAmount?: number;
}

// purchase bundle 생성 요청 타입
export interface CreatePurchaseBundleInput {
  companyId: string;
  managerId: string;
  bankCode?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  memo?: string;
  periodType: BundlePeriodType;
  periodFrom?: string;
  periodTo?: string;
  settledAt?: string;
  invoiceNo?: string;
  totalAmount: number;
  totalTaxAmount?: number;
  totalAmountWithTax?: number;
  status?: PurchaseBundleStatus;
  items: { orderPurchaseId: string; baseAmount: number }[];
  adjustments?: { type: BundleAdjType; description?: string; amount: number }[];
  orderCount?: number;
}

// purchase bundle 목록 조회 관련 타입
export interface IPurchaseBundleListItem {
  id: string;
  companyId: string;
  companySnapshot?: {
    name: string;
    businessNumber: string;
    ceoName: string;
  };
  managerId?: string;
  managerSnapshot?: {
    name: string;
    email: string;
    mobile: string;
  };
  paymentMethod: PaymentMethod;
  bankCode?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  settlementMemo?: string;
  periodType: BundlePeriodType;
  periodFrom?: string;
  periodTo?: string;
  invoiceIssuedAt?: string;
  depositRequestedAt?: string;
  depositReceivedAt?: string;
  settlementConfirmedAt?: string;
  settlementBatchId?: string;
  settledAt?: string;
  invoiceNo?: string;
  totalAmount: number;
  totalTaxAmount?: number;
  totalAmountWithTax?: number;
  itemExtraAmount?: number;
  bundleExtraAmount?: number;
  status: PurchaseBundleStatus;
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
}

// purchase bundle 목록 응답 타입
export interface IPurchaseBundleListResponse {
  data: IPurchaseBundleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

//  purchase bundle 필터 타입
export interface IPurchaseBundleFilter {
  companyId?: string;
  shipperName?: string;
  shipperBusinessNumber?: string;
  status?: PurchaseBundleStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'periodFrom' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  invoiceStatus?: string;
  manager?: string;            // 담당자
  minAmount?: number;          // 최소 금액
  maxAmount?: number;          // 최대 금액
  search?: string;
  
} 