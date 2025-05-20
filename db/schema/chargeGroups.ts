import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  text,
  numeric
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { orderDispatches } from "./orderDispatches";

// 운임 단계 Enum 정의
export const chargeStageEnum = pgEnum('charge_stage', [
  '견적',
  '배차',
  '운송중',
  '운송완료'
]);

// 운임 사유 Enum 정의
export const chargeReasonEnum = pgEnum('charge_reason', [
  'base_freight', // 기본 운임
  'extra_wait',   // 대기료
  'night_fee',    // 야간 할증
  'toll',         // 통행료
  'discount',     // 할인
  'penalty',      // 패널티
  'etc'           // 기타
]);

// 운임 그룹 테이블 정의
export const chargeGroups = pgTable('charge_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 관련 주문 정보
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  dispatchId: uuid('dispatch_id').references(() => orderDispatches.id, { onDelete: 'cascade' }),
  
  // 운임 메타데이터
  stage: chargeStageEnum('stage').notNull(),
  reason: chargeReasonEnum('reason').notNull(),
  description: text('description'),
  isLocked: boolean('is_locked').default(false).notNull(),
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}); 