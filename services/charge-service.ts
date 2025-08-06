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

  async getChargeMapFix(orderIds: string[]): Promise<Map<string, IOrderCharge>> {
    if (!orderIds || orderIds.length === 0) return new Map();

    // 단일 쿼리로 모든 데이터 조회 (N+1 문제 해결)
    const result = await db
      .select({
        orderId: chargeGroups.orderId,
        groupId: chargeGroups.id,
        stage: chargeGroups.stage,
        reason: chargeGroups.reason,
        description: chargeGroups.description,
        isLocked: chargeGroups.isLocked,
        lineId: chargeLines.id,
        side: chargeLines.side,
        amount: chargeLines.amount,
        memo: chargeLines.memo,
        taxRate: chargeLines.taxRate,
        taxAmount: chargeLines.taxAmount,
      })
      .from(chargeGroups)
      .leftJoin(chargeLines, eq(chargeLines.groupId, chargeGroups.id)) // ✅ 올바른 JOIN
      .where(inArray(chargeGroups.orderId, orderIds));
      
      
   
    // 클라이언트에서 효율적 그룹화 및 집계
    const chargeMap = new Map<string, IOrderCharge>();
    
    for (const row of result) {
      if (!chargeMap.has(row.orderId)) {
        chargeMap.set(row.orderId, {
          groups: [],
          summary: { totalAmount: 0, salesAmount: 0, purchaseAmount: 0, profit: 0 }
        });
      }
      
      const orderCharge = chargeMap.get(row.orderId)!;
      let group = orderCharge.groups.find(g => g.groupId === row.groupId);
      
      if (!group) {
        group = {
          groupId: row.groupId,
          stage: row.stage,
          reason: row.reason,
          description: row.description ?? '',
          isLocked: row.isLocked,
          lines: [],
          totalAmount: 0,
          salesAmount: 0,
          purchaseAmount: 0
        };
        orderCharge.groups.push(group);
      }
      
      if (row.lineId) {
        const line = {
          id: row.lineId,
          side: row.side as 'sales' | 'purchase',
          amount: Number(row.amount) || 0,
          memo: row.memo ?? '',
          taxRate: Number(row.taxRate) || 0,
          taxAmount: Number(row.taxAmount) || 0
        };
        group.lines.push(line);
        
        // 실시간 집계 계산 (중복 계산 방지)
        group.totalAmount += line.amount;
        orderCharge.summary.totalAmount += line.amount;
        
        if (line.side === 'sales') {
          group.salesAmount += line.amount;
          orderCharge.summary.salesAmount += line.amount;
        } else {
          group.purchaseAmount += line.amount;
          orderCharge.summary.purchaseAmount += line.amount;
        }
      }
    }
    
    // 최종 profit 계산
    for (const [, orderCharge] of chargeMap) {
      orderCharge.summary.profit = orderCharge.summary.salesAmount - orderCharge.summary.purchaseAmount;
    }
    
    return chargeMap;
  }

  // async getChargeMapFix01(orderIds: string[]): Promise<Map<string, IOrderCharge>> {
  //   if (!orderIds || orderIds.length === 0) return new Map();
  
  //   // 1. chargeGroupsResult 조회
  //   const chargeGroupsResult = await db
  //     .select({
  //       orderId: chargeGroups.orderId,
  //       //groupId: chargeGroups.id,
  //       summary: this.buildChargeSummarySQL()
  //     })
  //     .from(chargeGroups)
  //     .where(inArray(chargeGroups.orderId, orderIds))
  //     .groupBy(chargeGroups.orderId);
  
  //   // 2. groupId 목록 수집
  //   const groupIds = chargeGroupsResult.map(g => g.groupId);
  
  //   // 3. chargeLines를 groupId in (...)로 한방 조회
  //   const chargeLinesResult = await db
  //     .select()
  //     .from(chargeLines)
  //     .where(inArray(chargeLines.groupId, groupIds));
  
  //   // 4. groupId → lines[] 매핑
  //   const linesMap = new Map<string, typeof chargeLines[]>();
  //   for (const line of chargeLinesResult) {
  //     const groupId = line.groupId;
  //     if (!linesMap.has(groupId)) {
  //       linesMap.set(groupId, []);
  //     }
  //     linesMap.get(groupId)!.push(line as any);
  //   }
  
  //   // 5. group에 lines 삽입
  //   for (const cg of chargeGroupsResult) {
  //     const groupId = cg.groupId;
  //     const lines = linesMap.get(groupId) ?? [];
  //     const parsedSummary = typeof cg.summary === 'string' 
  //       ? JSON.parse(cg.summary) 
  //       : cg.summary;
  //     parsedSummary.lines = lines;
  //     cg.summary = parsedSummary;
  //   }
  
  //   // 6. 결과 매핑
  //   const result = new Map<string, IOrderCharge>();
  //   for (const cg of chargeGroupsResult) {
  //     const parsed = this.parseChargeSummary(cg.summary);
  //     result.set(cg.orderId, parsed);
  //   }
  
  //   return result;
  // }

  async getChargeMapFix02(orderIds: string[]): Promise<Map<string, IOrderCharge>> {
    if (!orderIds || orderIds.length === 0) return new Map();
  
    // chargeGroupsResult에 lines가 이미 포함되어 있음
    const chargeGroupsResult = await db
      .select({
        orderId: chargeGroups.orderId,
        summary: this.buildChargeSummarySQL()
      })
      .from(chargeGroups)
      .where(inArray(chargeGroups.orderId, orderIds))
      .groupBy(chargeGroups.orderId);
  
    // N+1 제거! → chargeLines 별도 쿼리 제거

    console.log("chargeGroupsResult-->", JSON.stringify(chargeGroupsResult));
  
    return new Map(
      chargeGroupsResult.map(cg => [cg.orderId, this.parseChargeSummary(cg.summary)])
    );
  }
  

  async getOrderCharge(orderId: string): Promise<IOrderCharge> {
    const map = await this.getChargeMap([orderId]);
    return map.get(orderId) ?? { groups: [], summary: { totalAmount: 0, salesAmount: 0, purchaseAmount: 0, profit: 0 } };
  }
} 
