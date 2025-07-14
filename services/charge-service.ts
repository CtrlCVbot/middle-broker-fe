import { db } from '@/db';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { chargeLines } from '@/db/schema/chargeLines';
import { eq, inArray, sql } from 'drizzle-orm';
import { IOrderCharge } from '@/types/order-with-dispatch';

export class ChargeService {
  private buildChargeSummarySQL() {
    return sql<string>`COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'groupId', ${chargeGroups.id},
          'stage', ${chargeGroups.stage},
          'reason', ${chargeGroups.reason},
          'description', ${chargeGroups.description},
          'isLocked', ${chargeGroups.isLocked},
          'totalAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id}),
          'salesAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id} AND cl.side = 'sales'),
          'purchaseAmount', (SELECT COALESCE(SUM(cl.amount), 0) FROM charge_lines cl WHERE cl.group_id = ${chargeGroups.id} AND cl.side = 'purchase'),
          'lines', (
            SELECT COALESCE(
              json_agg(
                jsonb_build_object(
                  'id', cl.id,
                  'side', cl.side,
                  'amount', cl.amount,
                  'memo', cl.memo,
                  'taxRate', cl.tax_rate,
                  'taxAmount', cl.tax_amount
                )
              ), '[]'::json
            )
            FROM charge_lines cl
            WHERE cl.group_id::text = ${chargeGroups.id}::text
          )
        )
      ) FILTER (WHERE ${chargeGroups.id} IS NOT NULL),
      '[]'::json
    )`;
  }

  private parseChargeSummary(raw: any) {
    const chargeGroups = Array.isArray(raw) ? raw : [];
    let totalAmount = 0;
    let salesAmount = 0;
    let purchaseAmount = 0;

    chargeGroups.forEach((g: any) => {
      if (typeof g.lines === 'string') {
        try { g.lines = JSON.parse(g.lines); } catch { g.lines = []; }
      }
      if (Array.isArray(g.lines)) {
        g.totalAmount = g.lines.reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
        g.salesAmount = g.lines.filter((l: any) => l.side === 'sales').reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
        g.purchaseAmount = g.lines.filter((l: any) => l.side === 'purchase').reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
        totalAmount += g.totalAmount;
        salesAmount += g.salesAmount;
        purchaseAmount += g.purchaseAmount;
      } else {
        g.totalAmount = 0;
        g.salesAmount = 0;
        g.purchaseAmount = 0;
      }
    });

    return {
      groups: chargeGroups,
      summary: {
        totalAmount,
        salesAmount,
        purchaseAmount,
        profit: salesAmount - purchaseAmount
      }
    };
  }

  async getChargeMap(orderIds: string[]): Promise<Map<string, IOrderCharge>> {
    if (!orderIds || orderIds.length === 0) return new Map();
    // 1. chargeGroupsResult 조회
    const chargeGroupsResult = await db
      .select({
        orderId: chargeGroups.orderId,
        summary: this.buildChargeSummarySQL()
      })
      .from(chargeGroups)
      .where(inArray(chargeGroups.orderId, orderIds))
      .groupBy(chargeGroups.orderId);

    // 2. group별 lines를 직접 DB에서 조회하여 삽입
    for (const cg of chargeGroupsResult) {
      if (Array.isArray(cg.summary)) {
        for (const group of cg.summary) {
          const groupId = group.groupId;
          const lines = await db.select().from(chargeLines).where(eq(chargeLines.groupId, groupId));
          group.lines = lines;
        }
      }
    }

    // 3. chargeMap 생성
    return new Map(
      chargeGroupsResult.map(cg => [cg.orderId, this.parseChargeSummary(cg.summary)])
    );
  }

  async getOrderCharge(orderId: string): Promise<IOrderCharge> {
    const map = await this.getChargeMap([orderId]);
    return map.get(orderId) ?? { groups: [], summary: { totalAmount: 0, salesAmount: 0, purchaseAmount: 0, profit: 0 } };
  }
} 