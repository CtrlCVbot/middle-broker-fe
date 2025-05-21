import { z } from 'zod';

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