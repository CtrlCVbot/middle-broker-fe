import { chargeGroups, chargeLines } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 새로운 API 엔드포인트: /api/charge/with-lines
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    
    // JOIN을 사용한 단일 쿼리로 그룹과 라인을 함께 조회
    const result = await db
      .select({
        group: chargeGroups,
        lines: chargeLines
      })
      .from(chargeGroups)
      .leftJoin(chargeLines, eq(chargeGroups.id, chargeLines.groupId))
      .where(eq(chargeGroups.orderId, orderId as string))
      .execute();
      
    // 메모리에서 그룹별로 라인 데이터 그룹화
    const groupedData = result.reduce((acc: any, row: any) => {
      if (!acc[row.group.id]) {
        acc[row.group.id] = { ...row.group, chargeLines: [] };
      }
      if (row.lines) {
        acc[row.group.id].chargeLines.push(row.lines);
      }
      return acc;
    }, {});
    
    return NextResponse.json({ data: Object.values(groupedData) });
  }