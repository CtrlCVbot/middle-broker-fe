import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  text,
  numeric
} from "drizzle-orm/pg-core";
import { chargeGroups } from "./chargeGroups";
import { users } from "./users";

// 운임 구분 Enum 정의 (매출/매입)
export const chargeSideEnum = pgEnum('charge_side', [
  'sales',    // 매출 (화주 청구)
  'purchase'  // 매입 (차주 지급)
]);

// 운임 라인 테이블 정의
export const chargeLines = pgTable('charge_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 그룹 정보
  groupId: uuid('group_id').notNull().references(() => chargeGroups.id, { onDelete: 'cascade' }),
  
  // 운임 정보
  side: chargeSideEnum('side').notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  memo: text('memo'),
  
  // 세금 관련 정보
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('10'),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
}); 