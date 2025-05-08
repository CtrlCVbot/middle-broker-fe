import { z } from 'zod';
import { orderDispatches, vehicleConnectionEnum } from '@/db/schema/orderDispatches';
import { dispatchStatusEnum, vehicleTypeEnum, vehicleWeightEnum } from '@/db/schema/orders';
import { ICompanySnapshot, IUserSnapshot } from '@/types/order-ver01';

// 목록 조회 응답 아이템 타입
export interface IOrderDispatchListItem {
  dispatchId: string;
  orderId: string;
  orderFlowStatus: string;
  cargoName: string;
  requestedVehicleInfo: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDateTime: string;
  deliveryDateTime: string;
  brokerManagerName?: string;
  assignedVehicleNumber?: string;
  assignedDriverName?: string;
  agreedFreightCost?: number;
  createdAt: string;
}

// 목록 조회 응답 타입
export interface IOrderDispatchListResponse {
  data: IOrderDispatchListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 상세 조회 응답 타입
export interface IOrderDispatchDetail {
  id: string;
  orderId: string;
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
  
  // 연결된 원본 주문 정보
  orderInfo: {
    id: string;
    flowStatus: string;
    cargoName: string;
    requestedVehicleType: string;
    requestedVehicleWeight: string;
    pickupAddressSnapshot: any;
    pickupDate: string;
    pickupTime: string;
    deliveryAddressSnapshot: any;
    deliveryDate: string;
    deliveryTime: string;
    memo?: string;
    // 추가 필요한 주문 정보들
  };
  
  // 추가 조인 정보
  brokerCompanyName?: string;
  brokerManager?: { id: string; name: string; phone?: string };
  assignedCarrierName?: string;
  assignedDriver?: { id: string; name: string; phone?: string };
}

// 신규 배차 생성 요청 Zod 스키마
export const createDispatchSchema = z.object({
  brokerCompanyId: z.string().uuid(),
  brokerManagerId: z.string().uuid().optional(),
  assignedDriverId: z.string().uuid(),
  assignedVehicleNumber: z.string().min(1).max(20),
  assignedVehicleType: z.enum(vehicleTypeEnum.enumValues),
  assignedVehicleWeight: z.enum(vehicleWeightEnum.enumValues),
  assignedVehicleConnection: z.enum(vehicleConnectionEnum.enumValues).optional(),
  agreedFreightCost: z.number().nonnegative().optional(),
  brokerMemo: z.string().max(500).optional(),
});

export type ICreateDispatchPayload = z.infer<typeof createDispatchSchema>;

// 배차 정보 수정 요청 Zod 스키마
export const updateDispatchSchema = z.object({
  dispatchStatus: z.enum(dispatchStatusEnum.enumValues).optional(),
  brokerManagerId: z.string().uuid().nullable().optional(),
  assignedDriverId: z.string().uuid().nullable().optional(),
  assignedVehicleNumber: z.string().min(1).max(20).nullable().optional(),
  assignedVehicleType: z.enum(vehicleTypeEnum.enumValues).nullable().optional(),
  assignedVehicleWeight: z.enum(vehicleWeightEnum.enumValues).nullable().optional(),
  assignedVehicleConnection: z.enum(vehicleConnectionEnum.enumValues).nullable().optional(),
  agreedFreightCost: z.number().nonnegative().nullable().optional(),
  brokerMemo: z.string().max(500).nullable().optional(),
});

export type IUpdateDispatchPayload = z.infer<typeof updateDispatchSchema>;

// 목록 조회 필터 Zod 스키마
export const dispatchListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  brokerCompanyId: z.string().uuid().optional(),
  brokerManagerId: z.string().uuid().optional(),
  dispatchStatus: z.enum(dispatchStatusEnum.enumValues).optional(),
  assignedCarrierId: z.string().uuid().optional(),
  assignedDriverId: z.string().uuid().optional(),
  assignedVehicleNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  keyword: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type IDispatchListQuery = z.infer<typeof dispatchListQuerySchema>; 