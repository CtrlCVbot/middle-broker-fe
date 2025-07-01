// /db/schema/broker_dispatches.ts (새 파일 또는 기존 파일 수정)
import { pgTable, uuid, varchar, numeric, timestamp, json, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { orderFlowStatusEnum, orders } from '@/db/schema/orders'; // orders 테이블 import
import { companies } from '@/db/schema/companies'; // companies 테이블 import (운송사, 주선사)
import { users } from '@/db/schema/users'; // users 테이블 import (기사, 주선사 담당자)
import { vehicleTypeEnum, vehicleWeightEnum } from '@/db/schema/orders'; // 기존 Enum 재사용 또는 필요시 분리
import { dispatchStatusEnum } from '@/db/schema/orders'; // 현재는 기존 것 사용 가정
import { ICompanySnapshot, IDriverSnapshot, IUserSnapshot } from '@/types/order';
import { drivers } from './drivers';

// (선택적) 주선사 배차 관련 스냅샷 타입 정의
// interface IBrokerCarrierSnapshot { ... }
// interface IBrokerDriverSnapshot { ... }
// interface IBrokerManagerSnapshot { ... }

// 화물 상태 Enum 정의
export const vehicleConnectionEnum = pgEnum('vehicle_connection', [
  '24시',
  '원콜',
  '화물맨',
  '기타'
]);

export const orderDispatches = pgTable('order_dispatches', {
  id: uuid('id').defaultRandom().primaryKey(), // 배차 정보 고유 ID

  // 연결된 원본 주문 정보
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }), // 원본 화물 주문 ID (FK)
  brokerFlowStatus: orderFlowStatusEnum('broker_flow_status').notNull().default('배차대기'), // 흐름 상태 (Enum, 기본값: '배차대기')

  // 담당 주선사 정보
  brokerCompanyId: uuid('broker_company_id').references(() => companies.id), // 담당 주선사 ID (FK)
  brokerCompanySnapshot: json('broker_company_snapshot').$type<ICompanySnapshot>(), // 담당 주선사 스냅샷
  brokerManagerId: uuid('broker_manager_id').references(() => users.id), // 담당 주선사 내부 담당자 ID (FK, Nullable 가능)
  brokerManagerSnapshot: json('broker_manager_snapshot').$type<IUserSnapshot>(), // 담당 주선사 내부 담당자 스냅샷
  

  // 할당된 운송사 정보 (배차가 된 경우)
  //assignedCarrierId: uuid('assigned_carrier_id').references(() => companies.id), // 할당된 운송사 ID (FK, Nullable)

  // 할당된 기사 정보 (배차가 된 경우)
  assignedDriverId: uuid('assigned_driver_id').references(() => drivers.id), // 할당된 기사 ID (FK, Nullable)
  assignedDriverSnapshot: json('assigned_driver_snapshot').$type<IDriverSnapshot>(), // 할당된 기사 스냅샷
  assignedDriverPhone: varchar('assigned_driver_phone', { length: 100 }), // 할당된 기사 전화번호
  

  // 할당된 차량 정보 (배차가 된 경우)  
  assignedVehicleNumber: varchar('assigned_vehicle_number', { length: 20 }), // 할당된 차량 번호 (Nullable)
  assignedVehicleType: vehicleTypeEnum('assigned_vehicle_type'), // 할당된 차량 종류 (Enum, Nullable)
  assignedVehicleWeight: vehicleWeightEnum('assigned_vehicle_weight'), // 할당된 차량 톤수 (Enum, Nullable)
  assignedVehicleConnection: vehicleConnectionEnum('assigned_vehicle_connection'), // 할당된 차량 연결 방법 정보 (Nullable)

  // 주선 비용 (운송사에 지급할 금액)
  agreedFreightCost: numeric('agreed_freight_cost', { precision: 12, scale: 2 }), // 운송사와 합의된 운임 (Nullable)

  // 주선사 내부 메모
  brokerMemo: varchar('broker_memo', { length: 500 }), // 주선사 특이사항 및 내부 메모

  isClosed: boolean('is_closed').default(false).notNull(),// 운송 마감 여부

  // 생성/수정 정보 (이 배차 정보를 생성/수정한 주선사 직원)
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdBySnapshot: json('created_by_snapshot').$type<IUserSnapshot>(), // 생성자 스냅샷
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
  updatedBySnapshot: json('updated_by_snapshot').$type<IUserSnapshot>(), // 수정자 스냅샷
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
});