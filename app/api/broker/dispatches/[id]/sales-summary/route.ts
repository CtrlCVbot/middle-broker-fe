import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { chargeLines } from '@/db/schema/chargeLines';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { ISalesData } from '@/types/broker-sale';
import { chargeGroups } from '@/db/schema/chargeGroups';

/**
 * 디스패치 매출 정산 요약 정보 생성 API
 * GET /api/broker/dispatches/[id]/sales-summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    const dispatchId = params.id;

    // 디스패치 정보 조회
    const dispatch = await db.query.orderDispatches.findFirst({
      where: eq(orderDispatches.id, dispatchId),
      with: {
        order: true,
      }
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: '해당 디스패치 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 마감된 디스패치인 경우
    if (dispatch.isClosed) {
      return NextResponse.json(
        { error: '이미 마감된 디스패치입니다.' },
        { status: 400 }
      );
    }

    const orderId = dispatch.orderId;
    const companyId = dispatch.brokerCompanyId;

    // 운임 그룹 조회
    const chargeGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.orderId, orderId),
      with: {
        chargeLines: true
      }
    });

    const chargeLines = chargeGroup?.chargeLines;

    if (!chargeLines || chargeLines.length === 0) {
      return NextResponse.json(
        { error: '해당 주문에 대한 과금 항목이 없습니다.' },
        { status: 404 }
      );
    }

    // 매출 정산 요약 정보 생성
    let subtotalAmount = 0;
    let taxAmount = 0;

    const items = chargeLines.map(line => {
      // 각 항목의 세금 계산 (기본 10%)
      const lineAmount = Number(line.amount) || 0;
      const lineTaxRate = Number(line.taxRate) || 10;
      const lineTaxAmount = Math.round(lineAmount * (lineTaxRate / 100));

      subtotalAmount += lineAmount;
      taxAmount += lineTaxAmount;

      return {
        description: line.memo || '화물 운송 비용',
        amount: lineAmount,
        taxRate: lineTaxRate,
        taxAmount: lineTaxAmount,
        originalChargeLineId: line.id
      };
    });

    const totalAmount = subtotalAmount + taxAmount;

    // 현재 날짜로 발행일자와 마감일자 설정
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // 기본 마감일은 30일 후

    const salesSummary: ISalesData = {
      orderId,      
      companyId: dispatch.brokerCompanyId,
      invoiceNumber: `INV-${orderId.slice(0, 8)}`,
      status: 'draft',
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      subtotalAmount,
      taxAmount,
      totalAmount,
      items,
      memo: `주문 ID: ${orderId}에 대한 매출 정산`,
    }as any;

    return NextResponse.json({
      data: salesSummary,
      message: '디스패치 매출 정산 요약 정보가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('디스패치 매출 정산 요약 정보 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '디스패치 매출 정산 요약 정보 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 