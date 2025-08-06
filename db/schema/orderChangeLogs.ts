import { pgTable, uuid, varchar, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';

// 변경 유형 Enum 정의  /추가됨 250806
export const orderChangeTypeEnum = pgEnum('order_change_type', [
  'create',
  'update',
  'updateStatus',
  'updatePrice',             // 청구금 + 배차금 변경
  'updatePriceSales',        // 청구금만 변경
  'updatePricePurchase',     // 배차금만 변경
  'updateDispatch',          // 배차정보 변경
  'cancelDispatch',          // 배차 취소
  'cancel',
  'delete'
]);

export const orderChangeActorRoleEnum = pgEnum('change_actor_role', [
  'shipper',
  'broker',
  'admin'
]);

// 화물 변경 이력 테이블
export const orderChangeLogs = pgTable('order_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 주문 참조
  orderId: uuid('order_id').notNull(),

  // 변경 유형
  changeType: orderChangeTypeEnum('change_type').notNull(),

  // 변경 주체 정보
  changedBy: uuid('changed_by').notNull(),
  changedByRole: orderChangeActorRoleEnum('changed_by_role').notNull().default('broker'),
  changedByName: varchar('changed_by_name', { length: 100 }),
  changedByEmail: varchar('changed_by_email', { length: 100 }),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),

  changedAt: timestamp('changed_at').defaultNow().notNull(),

  // 변경 데이터 스냅샷
  oldData: json('old_data'),
  newData: json('new_data'),

  // 변경 사유
  reason: varchar('reason', { length: 500 }),
}); 