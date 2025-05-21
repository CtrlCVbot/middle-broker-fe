import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderPurchases, paymentStatusEnum } from '@/db/schema/orderPurchases';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 매입 전표 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { purchaseId } = params;

    // 매입 전표 조회
    const purchase = await db.query.orderPurchases.findFirst({
      where: eq(orderPurchases.id, purchaseId),
      with: {
        
        order: true,
        company: true
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: '존재하지 않는 매입 전표입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: purchase });
  } catch (error) {
    console.error('매입 전표 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 전표 항목 수정 스키마
const UpdatePurchaseChargeItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1, '설명은 필수입니다.').optional(),
  amount: z.number().nonnegative('금액은 0 이상이어야 합니다.').optional(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
});

// 매입 전표 수정 스키마
const UpdateOrderPurchaseSchema = z.object({
  companyId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  paymentNumber: z.string().optional(),
  status: z.enum(paymentStatusEnum.enumValues).optional(),
  issueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  subtotalAmount: z.number().nonnegative().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number().nonnegative().optional(),
  financialSnapshot: z.any().optional(),
  memo: z.string().optional(),
  updateItems: z.array(UpdatePurchaseChargeItemSchema).optional(),
  removeItemIds: z.array(z.string().uuid()).optional(),
  addItems: z.array(z.object({
    description: z.string().min(1, '설명은 필수입니다.'),
    amount: z.number().nonnegative('금액은 0 이상이어야 합니다.'),
    taxRate: z.number().optional(),
    taxAmount: z.number().optional(),
    originalChargeLineId: z.string().uuid().optional()
  })).optional()
});

// 매입 전표 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { purchaseId } = params;
    const userId = session.user.id;
    const body = await request.json();
    
    // 매입 전표 존재 여부 확인
    const existingPurchase = await db.query.orderPurchases.findFirst({
      where: eq(orderPurchases.id, purchaseId)
    });

    if (!existingPurchase) {
      return NextResponse.json(
        { error: '존재하지 않는 매입 전표입니다.' },
        { status: 404 }
      );
    }

    // 이미 지급된 전표는 상태 변경 외에는 수정 불가
    if (existingPurchase.status === 'paid' && 
        (body.status === undefined || body.status === 'paid')) {
      return NextResponse.json(
        { error: '지급 완료된 전표는 항목을 수정할 수 없습니다. 상태만 변경 가능합니다.' },
        { status: 403 }
      );
    }
    
    // 요청 데이터 검증
    const validationResult = UpdateOrderPurchaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { updateItems, removeItemIds, addItems, ...purchaseData } = data;
    
    // 트랜잭션으로 전표 및 항목 수정
    const result = await db.transaction(async (tx) => {
      // 매입 전표 수정
      await tx.update(orderPurchases)
        .set({
          ...purchaseData,
          updatedBy: userId,
          updatedAt: new Date()
        }as any)
        .where(eq(orderPurchases.id, purchaseId));
      
      
      
      // 수정된 전표 조회
      return await tx.query.orderPurchases.findFirst({
        where: eq(orderPurchases.id, purchaseId)
      });
    });

    return NextResponse.json({
      message: '매입 전표가 수정되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('매입 전표 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매입 전표 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const { purchaseId } = params;
    
    // 매입 전표 존재 여부 확인
    const existingPurchase = await db.query.orderPurchases.findFirst({
      where: eq(orderPurchases.id, purchaseId)
    });

    if (!existingPurchase) {
      return NextResponse.json(
        { error: '존재하지 않는 매입 전표입니다.' },
        { status: 404 }
      );
    }

    // 지급 완료된 전표는 삭제 불가
    if (existingPurchase.status === 'paid') {
      return NextResponse.json(
        { error: '지급 완료된 전표는 삭제할 수 없습니다. 상태를 취소로 변경하세요.' },
        { status: 403 }
      );
    }
    
    // 트랜잭션으로 전표 및 항목 삭제
    await db.transaction(async (tx) => {
            
      // 전표 삭제
      await tx.delete(orderPurchases)
        .where(eq(orderPurchases.id, purchaseId));
    });

    return NextResponse.json({
      message: '매입 전표가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('매입 전표 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 