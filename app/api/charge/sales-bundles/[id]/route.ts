import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { salesBundles } from '@/db/schema/salesBundles';
import { salesBundleItems } from '@/db/schema/salesBundles';
import { salesBundleAdjustments } from '@/db/schema/salesBundles';
import { z } from 'zod';
import { validate as isValidUUID } from 'uuid';
import { orderSales } from '@/db/schema/orderSales';

// 필드 업데이트 스키마
const UpdateSalesBundleFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

// 개별 매출 번들 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매출 번들 ID입니다.' },
        { status: 400 }
      );
    }

    // 매출 번들 조회
    const salesBundle = await db.query.salesBundles.findFirst({
      where: eq(salesBundles.id, id),
      with: {
        items: {
          with: {
            orderSale: true
          }
        },
        adjustments: true
      }
    });

    if (!salesBundle) {
      return NextResponse.json(
        { error: '매출 번들을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('salesBundle', salesBundle);

    return NextResponse.json({
      data: salesBundle
    });
  } catch (error) {
    console.error('매출 번들 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매출 번들 필드 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매출 번들 ID입니다.' },
        { status: 400 }
      );
    }

    const requestUserId = request.headers.get('x-user-id') || '';

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdateSalesBundleFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;

    // 매출 번들 존재 여부 확인
    const existingSalesBundle = await db.query.salesBundles.findFirst({
      where: eq(salesBundles.id, id),
    });

    if (!existingSalesBundle) {
      return NextResponse.json(
        { error: '존재하지 않는 매출 번들입니다.' },
        { status: 404 }
      );
    }

    // 업데이트 가능한 필드 목록
    const allowedFields = [
      'companyId',
      'companySnapshot',
      'managerId',
      'managerSnapshot',
      'paymentMethod',
      'bankCode',
      'bankAccount',
      'bankAccountHolder',
      'settlementMemo',
      'periodType',
      'periodFrom',
      'periodTo',
      'invoiceIssuedAt',
      'depositRequestedAt',
      'depositReceivedAt',
      'settlementConfirmedAt',
      'settlementBatchId',
      'settledAt',
      'invoiceNo',
      'totalAmount',
      'totalTaxAmount',
      'totalAmountWithTax',
      'status'
    ];

    // 업데이트할 필드 검증
    const invalidFields = Object.keys(fields).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: '업데이트 불가능한 필드가 포함되어 있습니다.', fields: invalidFields },
        { status: 400 }
      );
    }

    // 업데이트 데이터 준비
    const updateData = {
      ...fields,
      updatedAt: new Date()
    };

    // 매출 번들 업데이트
    const [updatedSalesBundle] = await db
      .update(salesBundles)
      .set(updateData)
      .where(eq(salesBundles.id, id))
      .returning();

    return NextResponse.json({
      message: '매출 번들이 성공적으로 업데이트되었습니다.',
      data: updatedSalesBundle,
    });
  } catch (error) {
    console.error('매출 번들 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '매출 번들 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매출 번들 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매출 번들 ID입니다.' },
        { status: 400 }
      );
    }

    // 매출 번들 존재 여부 확인
    const existingSalesBundle = await db.query.salesBundles.findFirst({
      where: eq(salesBundles.id, id),
    });

    if (!existingSalesBundle) {
      return NextResponse.json(
        { error: '존재하지 않는 매출 번들입니다.' },
        { status: 404 }
      );
    }

    const existingSalesBundleItems = await db.query.salesBundleItems.findMany({
      where: eq(salesBundleItems.bundleId, id),
    });

    if (!existingSalesBundleItems || existingSalesBundleItems.length === 0) {
      return NextResponse.json(
        { error: '매출 번들에 관련 주문이 존재하지 않습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 관련 데이터 모두 삭제
    await db.transaction(async (tx) => {
      // 1. 매출 번들 조정 항목 삭제
      await tx
        .delete(salesBundleAdjustments)
        .where(eq(salesBundleAdjustments.bundleId, id));

      // 2. 매출 번들 항목 삭제
      await tx
        .delete(salesBundleItems)
        .where(eq(salesBundleItems.bundleId, id));

      // 3. 매출 번들 삭제
      await tx
        .delete(salesBundles)
        .where(eq(salesBundles.id, id));

      // 4. 관련된 모든 orderSales의 상태를 draft로 업데이트
      const uniqueOrderSalesIds = [
        ...new Set(existingSalesBundleItems.map((item) => item.orderSalesId)),
      ];

      for (const orderSalesId of uniqueOrderSalesIds) {
        await tx
          .update(orderSales)
          .set({ status: 'draft' })
          .where(eq(orderSales.id, orderSalesId));
      }
    });

    return NextResponse.json({
      message: '매출 번들이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('매출 번들 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '매출 번들 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 