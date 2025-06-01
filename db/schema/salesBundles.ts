import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  pgEnum,
  text,
  numeric,
  jsonb
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { orderSales } from "./orderSales";
import { ICompanySnapshot, ICompanySnapshotForSales, IUserSnapshot } from "@/types/order-ver01";
import { users } from "./users";
import { bankCodeEnum } from "./companies";
// 번들 상태 Enum 정의
export const salesBundleStatusEnum = pgEnum('sales_bundle_status', [
  'draft',     // 작성 중 = 정산 대기
  'issued',    // 송장 발행 = 정산 대사(진행중)
  'paid',      // 입금 완료 = 정산 완료
  'canceled'   // 취소
]);

// 조정 유형 Enum 정의
export const bundleAdjTypeEnum = pgEnum('bundle_adj_type', [
  'discount',   // 할인
  'surcharge'   // 추가금
]);

// 결제방법 Enum 정의
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',       // 현금
  'bank_transfer', // 은행 이체
  'card',       // 카드
  'etc'        // 기타
]);

// 기간 유형 Enum 정의
export const bundlePeriodTypeEnum = pgEnum('bundle_period_type', [
  'departure', // 출발기간
  'arrival',   // 도착기간
  'etc'        // 기타
]);

// 매출 번들 테이블 (헤더)
export const salesBundles = pgTable('sales_bundles', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 고객 정보 - 청구 회사
  companyId: uuid('company_id').notNull().references(() => companies.id),
  companySnapshot: jsonb('company_snapshot').$type<ICompanySnapshot>(),
  companiesSnapshot: jsonb('companies_snapshot').$type<ICompanySnapshotForSales[]>(), //선택된 화물들의 회사 목록 정보
  managerId: uuid('manager_id').references(() => users.id),
  managerSnapshot: jsonb('manager_snapshot').$type<IUserSnapshot>(),

  //결제방법
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('bank_transfer'),

  // 계좌 정보
  bankCode: bankCodeEnum('bank_code'), //은행코드  
  bankAccount: varchar('bank_account', { length: 30 }), //계좌번호
  bankAccountHolder: varchar('bank_account_holder', { length: 50 }), //예금주
  
  //기타
  settlementMemo: varchar('settlement_memo', { length: 200 }), //정산 메모


  // 기간 정보
  periodType: bundlePeriodTypeEnum('period_type').notNull().default('departure'), //기간 유형
  periodFrom: date('period_from'),  //운송기간 시작일
  periodTo: date('period_to'), //운송기간 종료일
  invoiceIssuedAt: date('invoice_issued_at'),          // 세금계산서 발행일  

  depositRequestedAt: date('deposit_requested_at'),    // 입금 요청일 (이메일/청구 기준)
  depositReceivedAt: date('deposit_received_at'),      // 입금 완료일 (실제 입금일)

  settlementConfirmedAt: date('settlement_confirmed_at'), // 정산 승인일 (회계팀 승인 등)
  settlementBatchId: varchar('settlement_batch_id', { length: 50 }), // 정산 회차 ID
  settledAt: date('settled_at'), // 정산 완료일
  
  // 인보이스 정보
  invoiceNo: varchar('invoice_no', { length: 50 }), //세금계산서 번호
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }), //총 금액
  totalTaxAmount: numeric('total_tax_amount', { precision: 14, scale: 2 }), //총 세액
  totalAmountWithTax: numeric('total_amount_with_tax', { precision: 14, scale: 2 }), //총 금액(세액포함)=청구금액
  status: salesBundleStatusEnum('status').default('draft').notNull(), //상태

  // 추가금액 정보
  itemExtraAmount: numeric('item_extra_amount', { precision: 14, scale: 2 }), //총 추가금액(화물 레벨)
  itemExtraAmountTax: numeric('item_extra_amount_tax', { precision: 14, scale: 2 }), //총 추가금액(화물 레벨) 세액
  bundleExtraAmount : numeric('bundle_extra_amount', { precision: 14, scale: 2 }), //총 추가금액(그룹화 레벨)
  bundleExtraAmountTax: numeric('bundle_extra_amount_tax', { precision: 14, scale: 2 }), //총 추가금액(그룹화 레벨) 세액

  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').notNull().references(() => users.id, { onDelete: 'cascade' })
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
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),

  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' })
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
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' })
  
}); 


