import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, date, time, json, pgEnum, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { addresses } from '@/db/schema/addresses';
import { IAddressSnapshot, IPriceSnapshot, IUserSnapshot, ITransportOptionsSnapshot, ICompanySnapshot } from '@/types/order';
import { IAddress } from '@/types/address';
import { IDistanceMetadata } from '@/types/distance';
import { calculationMethodEnum } from '@/db/schema/distanceCache';

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
  '1.4톤',
  '2.5톤',
  '3.5톤',
  '5톤',
  '8톤',
  '11톤',
  '18톤',
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

  //거리 정보 영역  
  // 예상 거리 정보 (카카오 API 기반)
  estimatedDistanceKm: numeric('estimated_distance_km', { precision: 10, scale: 2 }), // 예상 측정된 거리
  estimatedDurationMinutes: integer('estimated_duration_minutes'), // 예상 소요 시간

  // 거리 계산 방법 기록
  distanceCalculationMethod: calculationMethodEnum('distance_calculation_method').default('api'),
  
  // 거리 계산 시점 기록
  distanceCalculatedAt: timestamp('distance_calculated_at'),
  
  // 캐시 데이터 참조 (distance_cache 테이블 참조)
  distanceCacheId: uuid('distance_cache_id'), // .references(() => distanceCache.id), 
  
  // 거리 계산 정확도 메타데이터
  distanceMetadata: json('distance_metadata').$type<IDistanceMetadata>(),
  //거리 정보 영역 끝

  // 가격 정보
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
}, (table) => [
  // 최근 상차지 조회를 위한 인덱스
  index('idx_orders_company_pickup_created')
    .on(table.companyId, table.createdAt.desc())
    .where(sql`${table.pickupAddressSnapshot} IS NOT NULL`),
  
  // 최근 하차지 조회를 위한 인덱스  
  index('idx_orders_company_delivery_created')
    .on(table.companyId, table.createdAt.desc())
    .where(sql`${table.deliveryAddressSnapshot} IS NOT NULL`),

  // 거리 계산 방법별 조회 최적화
  index('idx_orders_distance_method')
    .on(table.distanceCalculationMethod, table.createdAt.desc()),
  
  // 예상 거리 기준 조회 (통계 분석용)
  index('idx_orders_estimated_distance')
    .on(table.estimatedDistanceKm, table.createdAt.desc())
    .where(sql`${table.estimatedDistanceKm} IS NOT NULL`),
]);

 
