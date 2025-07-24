import { z } from 'zod';
import { ICompanySnapshot, IUserSnapshot } from '@/types/order';

/**
 * 주문과 배차 정보를 함께 조회하는 API의 응답 타입 정의
 */

// 주문 정보 인터페이스
export interface IOrderWithDispatchOrderDetail {
  id: string;
  flowStatus: string;
  cargoName: string;
  requestedVehicleType: string;
  requestedVehicleWeight: string;
  
  companyId: string;
  companySnapshot?: ICompanySnapshot;
  contactUserSnapshot: IUserSnapshot;
  
  pickup: {
    name: string;
    contactName: string;
    contactPhone: string;
    address: any; // AddressSnapshot
    date: string;
    time: string;
  };
  delivery: {
    name: string;
    contactName: string;
    contactPhone: string;
    address: any; // AddressSnapshot
    date: string;
    time: string;
  };
  estimatedDistance?: number;
  estimatedPriceAmount?: number;
  priceType: string;
  taxType: string;
  memo?: string;
  isCanceled: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// 배차 정보 인터페이스
export interface IOrderWithDispatchDispatchDetail {
  id: string;
  brokerCompanyId: string;
  brokerCompanySnapshot?: ICompanySnapshot;
  brokerManagerId?: string;
  brokerManagerSnapshot?: IUserSnapshot;
  assignedDriverId?: string;
  assignedDriverSnapshot?: IUserSnapshot;
  assignedDriverPhone?: string;
  assignedVehicleNumber?: string;
  assignedVehicleType?: string;
  assignedVehicleWeight?: string;
  assignedVehicleConnection?: string;
  agreedFreightCost?: number;
  brokerMemo?: string;
  createdBy: string;
  createdBySnapshot?: IUserSnapshot;
  updatedBy: string;
  updatedBySnapshot?: IUserSnapshot;
  createdAt: string;
  updatedAt: string;
  isClosed?: boolean;
}

// 주문+배차 결합 아이템 인터페이스
export interface IOrderWithDispatchItem {
  order: IOrderWithDispatchOrderDetail;
  dispatch: IOrderWithDispatchDispatchDetail | null;
  // 운임 정보
  charge: IOrderCharge;
}

// 주문+배차 목록 응답 인터페이스
export interface IOrderWithDispatchListResponse {
  success: boolean;
  data: IOrderWithDispatchItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;  
}

// 주문+배차 상세 응답 인터페이스
export interface IOrderWithDispatchDetailResponse {
  success: boolean;
  data: IOrderWithDispatchItem;
}

// 주문+배차 목록 조회 쿼리 Zod 스키마
export const orderWithDispatchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  keyword: z.string().optional(),
  flowStatus: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleWeight: z.string().optional(),
  pickupCity: z.string().optional(),
  deliveryCity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  companyId: z.string().optional(),
  hasDispatch: z.enum(['true', 'false']).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type IOrderWithDispatchQuery = z.infer<typeof orderWithDispatchQuerySchema>; 

// 운임 라인 타입
export interface IOrderChargeLine {
  id: string;
  side: 'sales' | 'purchase';
  amount: number;
  memo?: string;
  taxRate?: number;
  taxAmount?: number;
}

// 운임 그룹 타입
export interface IOrderChargeGroup {
  groupId: string;
  stage: string;
  reason: string;
  description?: string;
  isLocked: boolean;
  totalAmount: number;
  salesAmount: number;
  purchaseAmount: number;
  lines: IOrderChargeLine[];
}

// 운임 요약 타입
export interface IOrderChargeSummary {
  totalAmount: number;
  salesAmount: number;
  purchaseAmount: number;
  profit: number;
}

// 주문별 운임 정보 타입
export interface IOrderCharge {
  groups: IOrderChargeGroup[];
  summary: IOrderChargeSummary;
} 