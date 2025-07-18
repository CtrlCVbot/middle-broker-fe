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
//import { companies } from "./companies";
import { drivers } from "./drivers";

// 지불 상태 Enum 정의
export const paymentStatusEnum = pgEnum('payment_status', [
  'draft',    // 대기중
  'issued',     // 발행됨
  'paid',       // 지급됨
  'canceled',   // 취소됨
  'void'        // 무효
]);

// 매입 전표 테이블 정의
export const orderPurchases = pgTable('order_purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 주문 및 운송사/기사 정보
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => drivers.id), // 기사=> 개인사업자!
  //driverId: uuid('driver_id'), // 기사 ID (있는 경우)
  
  // 지불 정보
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  status: paymentStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date', { mode: 'string' }),
  paymentDate: timestamp('payment_date', { mode: 'string' }),
  
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

