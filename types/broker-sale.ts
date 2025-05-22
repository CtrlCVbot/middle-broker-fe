import { z } from 'zod';
import { orderFlowStatusEnum } from '@/db/schema/orders';
import { ICompanySnapshot, IDriverSnapshot, IUserSnapshot } from '@/types/order-ver01';

/**
 * 매출 정산 관련 타입 정의
 */

// 매출 정산 항목 타입
export interface ISalesChargeItem {
  description: string;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  originalChargeLineId?: string;
}

// 매출 정산 스키마
export interface ISalesData {
  orderId: string;
  companyId: string;
  invoiceNumber?: string;
  status?: 'draft' | 'issued' | 'paid' | 'canceled' | 'void';
  issueDate?: string;
  dueDate?: string;
  subtotalAmount: number;
  taxAmount?: number;
  totalAmount: number;
  financialSnapshot?: ISalesChargeItem[]; // 화물 운송 비용 항목 정보
  memo?: string;
  //items: ISalesChargeItem[];
}

// 매출 정산 응답 타입
export interface IOrderSale {
  id: string;
  orderId: string;
  companyId: string;
  invoiceNumber?: string;
  status: 'draft' | 'issued' | 'paid' | 'canceled' | 'void';
  issueDate?: string;
  dueDate?: string;
  subtotalAmount: number;
  taxAmount?: number;
  totalAmount: number;
  financialSnapshot?: any;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  items: ISalesChargeItem[];
}

// 배차 정보 타입 (매출 정산 관련 필드만 포함)
export interface IOrderDispatchSales {
  id: string;
  orderId: string;
  companyId: string;
  status: string;
  isClosed: boolean;
  chargeLines?: any[];
  order?: {
    id: string;
    flowStatus: typeof orderFlowStatusEnum.enumValues[number];
  };
}

// 매출 정산 상태를 포함한 배차 정보 타입
export interface IOrderDispatchWithSalesStatus extends IOrderDispatchSales {
  hasSales: boolean;
  salesId?: string;
  salesStatus?: 'draft' | 'issued' | 'paid' | 'canceled' | 'void';
}

// 매출 정산 상태 확인 응답 타입
export interface ISalesStatusResponse {
  hasSales: boolean;
  salesId?: string;
  salesStatus?: 'draft' | 'issued' | 'paid' | 'canceled' | 'void';
}

// 매출 정산 생성 요청 유효성 검증 스키마
export const createSalesSchema = z.object({
  orderId: z.string().min(1, "주문 ID는 필수입니다."),
  companyId: z.string().min(1, "회사 ID는 필수입니다."),
  subtotalAmount: z.number().min(0, "소계 금액은 0 이상이어야 합니다."),
  totalAmount: z.number().min(0, "총 금액은 0 이상이어야 합니다."),
  items: z.array(
    z.object({
      description: z.string().min(1, "항목 설명은 필수입니다."),
      amount: z.number().min(0, "항목 금액은 0 이상이어야 합니다."),
      taxRate: z.number().optional(),
      taxAmount: z.number().optional(),
      originalChargeLineId: z.string().optional(),
    })
  ).min(1, "최소 1개 이상의 정산 항목이 필요합니다.")
});

// 매출 정산 요약 정보 타입
export interface ISalesSummary {
  totalAmount: number;
  taxAmount: number;
  subtotalAmount: number;
  items: ISalesChargeItem[];
}

