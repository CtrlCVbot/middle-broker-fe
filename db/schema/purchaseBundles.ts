import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  pgEnum,
  text,
  numeric
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { orderPurchases } from "./orderPurchases";
import { bundleAdjTypeEnum } from "./salesBundles";

// 번들 상태 Enum 정의
export const purchaseBundleStatusEnum = pgEnum('purchase_bundle_status', [
  'draft',      // 작성 중
  'issued',     // 전표 발행
  'paid',       // 지급 완료
  'canceled'    // 취소
]);

// 매입 번들 테이블 (헤더)
export const purchaseBundles = pgTable('purchase_bundles', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 대상 정보 (운송사 또는 기사)
  companyId: uuid('company_id').references(() => companies.id),
  driverId: uuid('driver_id'),
  
  // 기간 정보
  periodFrom: date('period_from'),
  periodTo: date('period_to'),
  
  // 지급 정보
  paymentNo: varchar('payment_no', { length: 50 }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }),
  status: purchaseBundleStatusEnum('status').default('draft').notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 매입 번들 아이템 테이블 (화물 매핑)
export const purchaseBundleItems = pgTable('purchase_bundle_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleId: uuid('bundle_id').notNull().references(() => purchaseBundles.id, { onDelete: 'cascade' }),
  orderPurchaseId: uuid('order_purchase_id').notNull().references(() => orderPurchases.id),
  
  // 금액 정보
  baseAmount: numeric('base_amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 매입 번들 조정 테이블 (번들 전체 할인/추가금)
export const purchaseBundleAdjustments = pgTable('purchase_bundle_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleId: uuid('bundle_id').notNull().references(() => purchaseBundles.id, { onDelete: 'cascade' }),
  
  // 조정 정보
  type: bundleAdjTypeEnum('type').notNull(),
  description: varchar('description', { length: 200 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 매입 아이템 조정 테이블 (개별 화물 할인/추가금)
export const purchaseItemAdjustments = pgTable('purchase_item_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleItemId: uuid('bundle_item_id').notNull().references(() => purchaseBundleItems.id, { onDelete: 'cascade' }),
  
  // 조정 정보
  type: bundleAdjTypeEnum('type').notNull(),
  description: varchar('description', { length: 200 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 