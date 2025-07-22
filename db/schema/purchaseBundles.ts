import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  pgEnum,
  text,
  numeric,
  jsonb,
  integer,
  index
} from "drizzle-orm/pg-core";
import { bankCodeEnum, companies } from "./companies";
import { orderPurchases } from "./orderPurchases";
import { ICompanySnapshot, ICompanySnapshotForSales, IDriverSnapshotForPurchase, IUserSnapshot } from "@/types/order";
import { users } from "./users";
import { bundleAdjTypeEnum, paymentMethodEnum,  bundlePeriodTypeEnum, salesBundleStatusEnum} from "./salesBundles";
import { drivers } from "./drivers";

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
  
  // 대상 정보 (운송사)
  companyId: uuid('company_id').references(() => companies.id), 
  companyName: varchar('company_name', { length: 50 }),
  companyBusinessNumber: varchar('company_business_number', { length: 20 }),

  companySnapshot: jsonb('company_snapshot').$type<ICompanySnapshot>(),
  companiesSnapshot: jsonb('companies_snapshot').$type<IDriverSnapshotForPurchase[]>(), //선택된 화물들의 회사 목록 정보
  
  //운송사 정산 담당자\
  managerId: uuid('manager_id'),
  managerSnapshot: jsonb('manager_snapshot').$type<IUserSnapshot>(),

  //기사 정보
  driverId: uuid('driver_id').references(() => drivers.id),
  driverName: varchar('driver_name', { length: 50 }),
  driverBusinessNumber: varchar('driver_business_number', { length: 20 }),
  driverSnapshot: jsonb('driver_snapshot').$type<IDriverSnapshotForPurchase>(),

  //화물 정보
  orderCount: integer('order_count').notNull().default(0),

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
  periodFrom: date('period_from'),
  periodTo: date('period_to'),
  invoiceIssuedAt: date('invoice_issued_at'),          // 세금계산서 발행일  

  depositRequestedAt: date('deposit_requested_at'),    // 송금 요청일 (이메일/청구 기준)
  depositReceivedAt: date('deposit_received_at'),      // 송금 완료일 (실제 송금일)

  settlementConfirmedAt: date('settlement_confirmed_at'), // 정산 승인일 (회계팀 승인 등)
  settlementBatchId: varchar('settlement_batch_id', { length: 50 }), // 정산 회차 ID
  settledAt: date('settled_at'), // 정산 완료일(만기일)

  //세금계산서 인보이스 정보
  invoiceNo: varchar('invoice_no', { length: 50 }), //세금계산서 번호
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }), //총 금액
  totalTaxAmount: numeric('total_tax_amount', { precision: 14, scale: 2 }), //총 세액
  totalAmountWithTax: numeric('total_amount_with_tax', { precision: 14, scale: 2 }), //총 금액(세액포함)=청구금액
  status: purchaseBundleStatusEnum('status').default('draft').notNull(), //상태
  
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
  
}, (t) => ({
  idxCompanyName: index('idx_purchase_bundles_company_name').on(t.companyName),
  idxCompanyBn: index('idx_purchase_bundles_company_bn').on(t.companyBusinessNumber),
}));

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
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' })
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
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' })
}); 