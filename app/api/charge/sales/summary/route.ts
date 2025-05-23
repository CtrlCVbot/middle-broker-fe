import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { companies as companiesTable } from '@/db/schema/companies';
import { ICompanySummary, ISettlementSummary } from '@/types/broker-charge';
import { orderSales } from '@/db/schema/orderSales';

// 정산 요약 계산 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 주문 ID 목록
    const orderIdsParam = searchParams.get('orderIds');
    if (!orderIdsParam) {
      return NextResponse.json(
        { error: '주문 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }
    
    const orderIds = orderIdsParam.split(',');
    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: '최소 하나 이상의 주문 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 주문 데이터 조회
    const selectedOrders = await db.select({
      id: orders.id,
      companyId: orders.companyId,
      companyName: companiesTable.name,
      totalAmount: orderSales.totalAmount,
      subtotalAmount: orderSales.subtotalAmount,
      taxAmount: orderSales.taxAmount
    })
    .from(orderSales)
    .leftJoin(companiesTable, eq(orderSales.companyId, companiesTable.id))
    .where(inArray(orderSales.id, orderIds));
    
    // 회사별로 그룹화하여 요약 계산
    const companySummaries = new Map<string, ICompanySummary>();
    
    selectedOrders.forEach(order => {
      const companyId = order.companyId;
      const companyName = order.companyName || "알 수 없음";
      
      // 배차비는 임시로 총액의 90%로 가정
      const chargeAmount = order.totalAmount;
      const dispatchAmount = Math.round(Number(chargeAmount) * 0.9);
      const profitAmount = Number(chargeAmount) - Number(dispatchAmount);
      
      if (companySummaries.has(companyId)) {
        const summary = companySummaries.get(companyId)!;
        summary.items += 1;
        summary.chargeAmount += Number(chargeAmount);
        summary.dispatchAmount += Number(dispatchAmount);
        summary.profitAmount += Number(profitAmount);
      } else {
        companySummaries.set(companyId, {
          companyId,
          companyName,
          items: 1,
          chargeAmount: Number(chargeAmount),
          dispatchAmount: Number(dispatchAmount),
          profitAmount: Number(profitAmount)
        });
      }
    });
    
    // 전체 합계 계산
    const companies = Array.from(companySummaries.values());
    const totalItems = companies.reduce((sum, company) => sum + company.items, 0);
    const totalChargeAmount = companies.reduce((sum, company) => sum + company.chargeAmount, 0);
    const totalDispatchAmount = companies.reduce((sum, company) => sum + company.dispatchAmount, 0);
    const totalProfitAmount = companies.reduce((sum, company) => sum + company.profitAmount, 0);

    console.log("전체 합계 계산", totalItems, totalChargeAmount, totalDispatchAmount, totalProfitAmount);
    const summary: ISettlementSummary = {
      totalItems,
      totalChargeAmount,
      totalDispatchAmount,
      totalProfitAmount,
      companies
    };
    
    return NextResponse.json({
      data: summary
    });
  } catch (error) {
    console.error('정산 요약 계산 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 