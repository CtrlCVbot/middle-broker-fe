import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, date, time, json, pgEnum } from 'drizzle-orm/pg-core';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { addresses } from '@/db/schema/addresses';
import { IAddressSnapshot, IPriceSnapshot, IUserSnapshot, ITransportOptionsSnapshot, ICompanySnapshot } from '@/types/order1';
import { IAddress } from '@/types/address';

// 화물 상태 Enum 정의
export const orderFlowStatusEnum = pgEnum('order_flow_status', [  
  '운송요청',
  '배차대기',
  '배차완료',
  '상차대기',
  '상차완료',
  '운송중',
  '하차완료',
  '운송완료',
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

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  '카고',
  '윙바디',
  '탑차',
  '냉장',
  '냉동',
  '트레일러'
]);

export const vehicleWeightEnum = pgEnum('vehicle_weight', [
  '1톤',
  '2.5톤',
  '3.5톤',
  '5톤',
  '11톤',
  '25톤'
]);

export const priceTypeEnum = pgEnum('price_type', [
  '기본',
  '계약'
]);

export const taxTypeEnum = pgEnum('tax_type', [
  '비과세',
  '과세'
]);

// 화주 주문 정보 테이블
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 화주 정보
  companyId: uuid('company_id').notNull(), //화주 회사
  companySnapshot: json('company_snapshot').$type<ICompanySnapshot>(), //화주 회사 스냅샷
  contactUserId: uuid('contact_user_id').notNull(),
  contactUserPhone: varchar('contact_user_phone', { length: 100 }), //화주 담당자 전화번호
  contactUserMail: varchar('contact_user_mail', { length: 100 }), //화주 담당자 이메일

  contactUserSnapshot: json('contact_user_snapshot').$type<IUserSnapshot>(), //화주 담당자 스냅샷

  // 상태
  flowStatus: orderFlowStatusEnum('flow_status').notNull().default('운송요청'), //흐름 상태
  isCanceled: boolean('is_canceled').default(false), //취소여부

  // 화물 정보
  cargoName: varchar('cargo_name', { length: 100 }), //화물 품목  
  requestedVehicleType: vehicleTypeEnum('requested_vehicle_type').notNull().default('카고'), //요청 차량 종류
  requestedVehicleWeight: vehicleWeightEnum('requested_vehicle_weight').notNull().default('1톤'), //요청 차량 무게
  memo: varchar('memo', { length: 500 }), //추가요청 및 메모

  // 주소 정보
  pickupAddressId: uuid('pickup_address_id'), //상차지 주소
  pickupAddressSnapshot: json('pickup_address_snapshot').$type<IAddressSnapshot>(),  //상차지 주소
  pickupAddressDetail: varchar('pickup_address_detail', { length: 100 }), //상차지 주소 상세
  pickupName: varchar('pickup_name', { length: 100 }), //상차지 이름
  pickupContactName: varchar('pickup_contact_name', { length: 100 }), //담당자명
  pickupContactPhone: varchar('pickup_contact_phone', { length: 100 }), //담당자 전화번호

  deliveryAddressId: uuid('delivery_address_id'), //하차지 주소
  deliveryAddressSnapshot: json('delivery_address_snapshot').$type<IAddressSnapshot>(),  //하차지 주소
  deliveryAddressDetail: varchar('delivery_address_detail', { length: 100 }), //하차지 주소 상세
  deliveryName: varchar('delivery_name', { length: 100 }), //하차지 이름
  deliveryContactName: varchar('delivery_contact_name', { length: 100 }), //담당자명
  deliveryContactPhone: varchar('delivery_contact_phone', { length: 100 }), //담당자 전화번호
  

  // 일정 정보
  pickupDate: date('pickup_date'), //상차일
  pickupTime: time('pickup_time'), //상차시간
  deliveryDate: date('delivery_date'), //하차일
  deliveryTime: time('delivery_time'), //하차시간

  //운송 옵션
  transportOptions: json('transport_options').$type<ITransportOptionsSnapshot>(),


  //거리 및 가격 정보
  estimatedDistance: numeric('estimated_distance', { precision: 8, scale: 2 }), //예상 거리
  estimatedPriceAmount: numeric('estimated_price_amount', { precision: 12, scale: 2 }), //예상 가격
  priceType: priceTypeEnum('price_type').notNull().default('기본'), //가격 타입
  taxType: taxTypeEnum('tax_type').notNull().default('과세'), //세율 타입
  priceSnapshot: json('price_snapshot').$type<IPriceSnapshot>(), //가격 스냅샷

  // 생성/수정 정보
  createdBy: uuid('created_by') //생성자
    .notNull(),
  createdBySnapshot: json('created_by_snapshot').$type<IUserSnapshot>(), //생성자 스냅샷
  createdAt: timestamp('created_at').defaultNow(), //생성일

  updatedBy: uuid('updated_by') //수정자
    .notNull(),
  updatedBySnapshot: json('updated_by_snapshot').$type<IUserSnapshot>(), //수정자 스냅샷
  updatedAt: timestamp('updated_at').defaultNow(), //수정일
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