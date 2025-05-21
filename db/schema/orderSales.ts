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
import { orders } from "./orders";
import { companies } from "./companies";

// 인보이스 상태 Enum 정의
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',     // 초안
  'issued',    // 발행됨
  'paid',      // 결제됨
  'canceled',  // 취소됨
  'void'       // 무효
]);

// 매출 인보이스 테이블 정의
export const orderSales = pgTable('order_sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 주문 및 화주 정보
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  
  // 인보이스 정보
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date', { mode: 'string' }),
  dueDate: timestamp('due_date', { mode: 'string' }),
  
  // 금액 정보
  subtotalAmount: numeric('subtotal_amount', { precision: 14, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  
  // 스냅샷 및 메모
  financialSnapshot: jsonb('financial_snapshot'), // 금융 정보 스냅샷 (JSON)
  memo: text('memo'),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

