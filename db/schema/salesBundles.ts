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
import { orderSales } from "./orderSales";

// 번들 상태 Enum 정의
export const salesBundleStatusEnum = pgEnum('sales_bundle_status', [
  'draft',     // 작성 중
  'issued',    // 송장 발행
  'paid',      // 입금 완료
  'canceled'   // 취소
]);

// 조정 유형 Enum 정의
export const bundleAdjTypeEnum = pgEnum('bundle_adj_type', [
  'discount',   // 할인
  'surcharge'   // 추가금
]);

// 매출 번들 테이블 (헤더)
export const salesBundles = pgTable('sales_bundles', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 고객 정보
  companyId: uuid('company_id').notNull().references(() => companies.id),
  
  // 기간 정보
  periodFrom: date('period_from'),
  periodTo: date('period_to'),
  
  // 인보이스 정보
  invoiceNo: varchar('invoice_no', { length: 50 }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }),
  status: salesBundleStatusEnum('status').default('draft').notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 매출 번들 아이템 테이블 (화물 매핑)
export const salesBundleItems = pgTable('sales_bundle_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleId: uuid('bundle_id').notNull().references(() => salesBundles.id, { onDelete: 'cascade' }),
  orderSalesId: uuid('order_sales_id').notNull().references(() => orderSales.id),
  
  // 금액 정보
  baseAmount: numeric('base_amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 매출 번들 조정 테이블 (번들 전체 할인/추가금)
export const salesBundleAdjustments = pgTable('sales_bundle_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleId: uuid('bundle_id').notNull().references(() => salesBundles.id, { onDelete: 'cascade' }),
  
  // 조정 정보
  type: bundleAdjTypeEnum('type').notNull(),
  description: varchar('description', { length: 200 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 매출 아이템 조정 테이블 (개별 화물 할인/추가금)
export const salesItemAdjustments = pgTable('sales_item_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관계 정보
  bundleItemId: uuid('bundle_item_id').notNull().references(() => salesBundleItems.id, { onDelete: 'cascade' }),
  
  // 조정 정보
  type: bundleAdjTypeEnum('type').notNull(),
  description: varchar('description', { length: 200 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 