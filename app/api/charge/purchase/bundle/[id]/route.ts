import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { purchaseBundles } from '@/db/schema/purchaseBundles';
import { purchaseBundleItems } from '@/db/schema/purchaseBundles';
import { purchaseBundleAdjustments } from '@/db/schema/purchaseBundles';
import { z } from 'zod';
import { validate as isValidUUID } from 'uuid';
import { orderPurchases } from '@/db/schema/orderPurchases';

// 필드 업데이트 스키마
const UpdatePurchaseBundleFieldsSchema = z.object({
  fields: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

// 개별 매입 번들 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매입 번들 ID입니다.' },
        { status: 400 }
      );
    }

    // 매입 번들 조회
    const purchaseBundle = await db.query.purchaseBundles.findFirst({
      where: eq(purchaseBundles.id, id),
      with: {
        items: {
          with: {
            orderPurchase: true
          }
        },
        adjustments: true
      }
    });

    if (!purchaseBundle) {
      return NextResponse.json(
        { error: '매입 번들을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('purchaseBundle', purchaseBundle);

    return NextResponse.json({
      data: purchaseBundle
    });
  } catch (error) {
    console.error('매입 번들 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매입 번들 필드 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('id', id);
    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매입 번들 ID입니다.', id: id },
        { status: 400 }
      );
    }

    const requestUserId = request.headers.get('x-user-id');
    if (!requestUserId) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.', details: 'x-user-id 헤더가 없습니다.' },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const result = UpdatePurchaseBundleFieldsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 요청 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fields, reason } = result.data;

    // 매출 번들 존재 여부 확인
    const existingSalesBundle = await db.query.purchaseBundles.findFirst({
      where: eq(purchaseBundles.id, id),
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
      'itemExtraAmount',
      'bundleExtraAmount',
      'status',      
      'invoiceIssuedAt',
      'depositReceivedAt',
      'driverId',
      'driverSnapshot',
      'driverName',
      'driverBusinessNumber',
      
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
    console.log('fields', fields);

    // 업데이트 데이터 준비
    const updateData = {
      ...fields,
      updatedAt: new Date(),
      //companyName: fields.companySnapshot?.name || '',
      //businessNumber: fields.companySnapshot?.businessNumber || '',
    };

    // 매출 번들 업데이트
    const [updatedPurchaseBundle] = await db
      .update(purchaseBundles)
      .set(updateData)
      .where(eq(purchaseBundles.id, id))
      .returning();

    return NextResponse.json({
      message: '매입 번들이 성공적으로 업데이트되었습니다.',
      data: updatedPurchaseBundle,
    });
  } catch (error) {
    console.error('매입 번들 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '매입 번들 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매출 번들 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 매입 번들 ID입니다.' },
        { status: 400 }
      );
    }

    // 매출 번들 존재 여부 확인
    const existingPurchaseBundle = await db.query.purchaseBundles.findFirst({
      where: eq(purchaseBundles.id, id),
    });

    if (!existingPurchaseBundle) {
      return NextResponse.json(
        { error: '존재하지 않는 매입 번들입니다.' },
        { status: 404 }
      );
    }

    const existingPurchaseBundleItems = await db.query.purchaseBundleItems.findMany({
      where: eq(purchaseBundleItems.bundleId, id),
    });

    if (!existingPurchaseBundleItems || existingPurchaseBundleItems.length === 0) {
      return NextResponse.json(
        { error: '매입 번들에 관련 주문이 존재하지 않습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 관련 데이터 모두 삭제
    await db.transaction(async (tx) => {
      // 1. 매출 번들 조정 항목 삭제
      await tx
        .delete(purchaseBundleAdjustments)
        .where(eq(purchaseBundleAdjustments.bundleId, id));

      // 2. 매출 번들 항목 삭제
      await tx
        .delete(purchaseBundleItems)
        .where(eq(purchaseBundleItems.bundleId, id));

      // 3. 매출 번들 삭제
      await tx
        .delete(purchaseBundles)
        .where(eq(purchaseBundles.id, id));

      // 4. 관련된 모든 orderPurchase의 상태를 draft로 업데이트
      const uniqueOrderPurchaseIds = [
        ...new Set(existingPurchaseBundleItems.map((item) => item.orderPurchaseId)),
      ];

      for (const orderPurchaseId of uniqueOrderPurchaseIds) {
        await tx
          .update(orderPurchases)
          .set({ status: 'draft' })
          .where(eq(orderPurchases.id, orderPurchaseId));
      }
    });

    return NextResponse.json({
      message: '매입 번들이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('매입 번들 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '매입 번들 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 