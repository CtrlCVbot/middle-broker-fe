import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  jsonb,
  text,
  numeric
} from "drizzle-orm/pg-core";
import { orderSales } from "./orderSales";
import { orderPurchases } from "./orderPurchases";
import { salesBundles } from "./salesBundles";
import { purchaseBundles } from "./purchaseBundles";

// 조정 노트 유형 Enum 정의
export const adjustmentTypeEnum = pgEnum('adjustment_type', [
  'refund',      // 환불
  'additional',  // 추가 요금
  'correction',  // 오류 수정
  'other'        // 기타
]);

// 조정 노트 상태 Enum 정의
export const adjustmentStatusEnum = pgEnum('adjustment_status', [
  'draft',      // 초안
  'issued',     // 발행됨
  'processed',  // 처리됨
  'canceled'    // 취소됨
]);

// Credit Note(대변 전표) 테이블 정의 - 매출 관련 조정
export const creditNotes = pgTable('credit_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 원본 참조
  orderSaleId: uuid('order_sale_id').references(() => orderSales.id),
  salesBundleId: uuid('sales_bundle_id').references(() => salesBundles.id),
  
  // 조정 정보
  creditNoteNumber: varchar('credit_note_number', { length: 100 }),
  type: adjustmentTypeEnum('type').notNull(),
  status: adjustmentStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date', { mode: 'string' }),
  
  // 금액 정보
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  
  // 추가 정보
  reason: text('reason').notNull(),
  snapshot: jsonb('snapshot'), // 오리지널 인보이스 데이터 스냅샷
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

// Debit Note(차변 전표) 테이블 정의 - 매입 관련 조정
export const debitNotes = pgTable('debit_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 원본 참조
  orderPurchaseId: uuid('order_purchase_id').references(() => orderPurchases.id),
  purchaseBundleId: uuid('purchase_bundle_id').references(() => purchaseBundles.id),
  
  // 조정 정보
  debitNoteNumber: varchar('debit_note_number', { length: 100 }),
  type: adjustmentTypeEnum('type').notNull(),
  status: adjustmentStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date', { mode: 'string' }),
  
  // 금액 정보
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  
  // 추가 정보
  reason: text('reason').notNull(),
  snapshot: jsonb('snapshot'), // 오리지널 전표 데이터 스냅샷
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}); 