import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, date, json, pgEnum } from 'drizzle-orm/pg-core';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { addresses } from '@/db/schema/addresses';
import { IAddressSnapshot, IUserSnapshot } from '../../types/order1';

// 화물 상태 Enum 정의
export const orderFlowStatusEnum = pgEnum('order_flow_status', [
  '등록',
  '운송요청',
  '배차대기',
  '배차완료',
  '상차대기',
  '상차완료',
  '운송중',
  '하차완료',
  '운송완료',
  '취소',
]);

// 배차 상태 Enum 정의
export const dispatchStatusEnum = pgEnum('dispatch_status', [
  '배차대기',
  '배차완료',
  '상차중',
  '운송중',
  '하차완료',
  '정산완료'
]);

// 화주 주문 정보 테이블
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 화주 정보
  companyId: uuid('company_id').notNull().references(() => companies.id),
  orderContactId: uuid('order_contact_id').references(() => users.id),
  orderContactSnapshot: json('order_contact_snapshot').$type<IUserSnapshot>(),

  // 기본 정보
  orderNumber: varchar('order_number', { length: 30 }).notNull().unique(),
  orderName: varchar('order_name', { length: 100 }).notNull(),

  // 상태
  flowStatus: orderFlowStatusEnum('flow_status').notNull().default('등록'),

  // 화물 정보
  cargoName: varchar('cargo_name', { length: 100 }),
  cargoWeight: numeric('cargo_weight', { precision: 10, scale: 2 }),
  cargoUnit: varchar('cargo_unit', { length: 20 }),
  cargoQuantity: integer('cargo_quantity'),
  packagingType: varchar('packaging_type', { length: 50 }),

  // 차량 정보
  vehicleType: varchar('vehicle_type', { length: 50 }),
  vehicleCount: integer('vehicle_count'),

  // 가격 정보
  priceAmount: numeric('price_amount', { precision: 12, scale: 2 }),
  priceType: varchar('price_type', { length: 20 }),
  taxType: varchar('tax_type', { length: 20 }),

  // 주소 정보
  pickupAddressId: uuid('pickup_address_id').references(() => addresses.id),
  deliveryAddressId: uuid('delivery_address_id').references(() => addresses.id),
  pickupSnapshot: json('pickup_snapshot').$type<IAddressSnapshot>(),
  deliverySnapshot: json('delivery_snapshot').$type<IAddressSnapshot>(),

  // 일정 정보
  pickupDate: date('pickup_date'),
  deliveryDate: date('delivery_date'),

  // 상태 및 메모
  isCanceled: boolean('is_canceled').default(false),
  memo: varchar('memo', { length: 500 }),

  // 생성/수정 정보
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  createdBySnapshot: json('created_by_snapshot').$type<IUserSnapshot>(),
  createdAt: timestamp('created_at').defaultNow(),

  updatedBy: uuid('updated_by')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  updatedBySnapshot: json('updated_by_snapshot').$type<IUserSnapshot>(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 주선사 배차 및 운송 정보 테이블
export const brokerOrders = pgTable('broker_orders', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 연결된 주문
  orderId: uuid('order_id').notNull().references(() => orders.id),

  // 배차 상태
  dispatchStatus: dispatchStatusEnum('dispatch_status').notNull().default('배차대기'),

  // 배차 정보
  driverId: uuid('driver_id').references(() => users.id),
  carrierId: uuid('carrier_id').references(() => companies.id),
  vehicleNumber: varchar('vehicle_number', { length: 20 }),

  // 차량 상세
  truckType: varchar('truck_type', { length: 50 }),
  tonnage: numeric('tonnage', { precision: 6, scale: 2 }),

  // 정산
  payToCarrier: numeric('pay_to_carrier', { precision: 12, scale: 2 }),
  payMethod: varchar('pay_method', { length: 30 }),
  settlementMemo: varchar('settlement_memo', { length: 300 }),

  // 특이사항
  specialNotes: varchar('special_notes', { length: 500 }),

  // 생성/수정 정보
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 