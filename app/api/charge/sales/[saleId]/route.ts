import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderSales, invoiceStatusEnum } from '@/db/schema/orderSales';
import { salesChargeItems } from '@/db/schema/orderSales';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 매출 인보이스 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const { saleId } = params;

    // 매출 인보이스 조회
    const sale = await db.query.orderSales.findFirst({
      where: eq(orderSales.id, saleId),
      with: {
        chargeItems: true,
        order: true,
        company: true
      }
    });

    if (!sale) {
      return NextResponse.json(
        { error: '존재하지 않는 매출 인보이스입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: sale });
  } catch (error) {
    console.error('매출 인보이스 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인보이스 항목 수정 스키마
const UpdateSalesChargeItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1, '설명은 필수입니다.').optional(),
  amount: z.number().nonnegative('금액은 0 이상이어야 합니다.').optional(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
});

// 매출 인보이스 수정 스키마
const UpdateOrderSaleSchema = z.object({
  invoiceNumber: z.string().optional(),
  status: z.enum(invoiceStatusEnum.enumValues).optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  subtotalAmount: z.number().nonnegative().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number().nonnegative().optional(),
  financialSnapshot: z.any().optional(),
  memo: z.string().optional(),
  updateItems: z.array(UpdateSalesChargeItemSchema).optional(),
  removeItemIds: z.array(z.string().uuid()).optional(),
  addItems: z.array(z.object({
    description: z.string().min(1, '설명은 필수입니다.'),
    amount: z.number().nonnegative('금액은 0 이상이어야 합니다.'),
    taxRate: z.number().optional(),
    taxAmount: z.number().optional(),
    originalChargeLineId: z.string().uuid().optional()
  })).optional()
});

// 매출 인보이스 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { saleId } = params;
    const userId = session.user.id;
    const body = await request.json();
    
    // 매출 인보이스 존재 여부 확인
    const existingSale = await db.query.orderSales.findFirst({
      where: eq(orderSales.id, saleId),
      with: {
        chargeItems: true
      }
    });

    if (!existingSale) {
      return NextResponse.json(
        { error: '존재하지 않는 매출 인보이스입니다.' },
        { status: 404 }
      );
    }

    // 이미 발행된 인보이스는 상태 변경 외에는 수정 불가
    if (existingSale.status !== 'draft' && 
        (body.status === undefined || body.status === existingSale.status)) {
      return NextResponse.json(
        { error: '발행된 인보이스는 항목을 수정할 수 없습니다. 상태만 변경 가능합니다.' },
        { status: 403 }
      );
    }
    
    // 요청 데이터 검증
    const validationResult = UpdateOrderSaleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { updateItems, removeItemIds, addItems, ...saleData } = data;
    
    // 트랜잭션으로 인보이스 및 항목 수정
    const result = await db.transaction(async (tx) => {
      // 매출 인보이스 수정
      await tx.update(orderSales)
        .set({
          ...saleData,
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(eq(orderSales.id, saleId));
      
      // 항목 수정
      if (updateItems && updateItems.length > 0) {
        for (const item of updateItems) {
          const { id, ...itemData } = item;
          await tx.update(salesChargeItems)
            .set(itemData)
            .where(eq(salesChargeItems.id, id));
        }
      }
      
      // 항목 삭제
      if (removeItemIds && removeItemIds.length > 0) {
        for (const itemId of removeItemIds) {
          await tx.delete(salesChargeItems)
            .where(eq(salesChargeItems.id, itemId));
        }
      }
      
      // 항목 추가
      if (addItems && addItems.length > 0) {
        for (const item of addItems) {
          await tx.insert(salesChargeItems).values({
            ...item,
            orderSaleId: saleId
          });
        }
      }
      
      // 수정된 인보이스 조회
      return await tx.query.orderSales.findFirst({
        where: eq(orderSales.id, saleId),
        with: {
          chargeItems: true
        }
      });
    });

    return NextResponse.json({
      message: '매출 인보이스가 수정되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('매출 인보이스 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매출 인보이스 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { saleId } = params;
    
    // 매출 인보이스 존재 여부 확인
    const existingSale = await db.query.orderSales.findFirst({
      where: eq(orderSales.id, saleId)
    });

    if (!existingSale) {
      return NextResponse.json(
        { error: '존재하지 않는 매출 인보이스입니다.' },
        { status: 404 }
      );
    }

    // 발행된 인보이스는 삭제 불가
    if (existingSale.status !== 'draft') {
      return NextResponse.json(
        { error: '발행된 인보이스는 삭제할 수 없습니다. 상태를 취소로 변경하세요.' },
        { status: 403 }
      );
    }
    
    // 트랜잭션으로 인보이스 및 항목 삭제
    await db.transaction(async (tx) => {
      // 인보이스 항목 삭제
      await tx.delete(salesChargeItems)
        .where(eq(salesChargeItems.orderSaleId, saleId));
      
      // 인보이스 삭제
      await tx.delete(orderSales)
        .where(eq(orderSales.id, saleId));
    });

    return NextResponse.json({
      message: '매출 인보이스가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('매출 인보이스 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 