import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { sql } from 'drizzle-orm';

/**
 * 주문 번호 생성 함수
 * 형식: YYYYMMDD-XXXX (XXXX는 당일 순번)
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // 오늘 생성된 주문 수 조회
  const result = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(sql`date(created_at) = current_date`);

  const count = result[0].count + 1;
  const sequence = count.toString().padStart(4, '0');

  return `${dateStr}-${sequence}`;
}

/**
 * 주문 번호 유효성 검사
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const pattern = /^\d{8}-\d{4}$/;
  return pattern.test(orderNumber);
} 