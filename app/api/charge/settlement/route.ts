import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { invoiceStatusEnum, orderSales } from '@/db/schema/orderSales';
import { orderPurchases, paymentStatusEnum } from '@/db/schema/orderPurchases';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 매입 전표 항목 스키마
const PurchaseChargeItemSchema = z.object({
    description: z.string().min(1, '설명은 필수입니다.'),
    amount: z.number().nonnegative('금액은 0 이상이어야 합니다.'),
    taxRate: z.number().optional(),
    taxAmount: z.number().optional(),
    originalChargeLineId: z.string().uuid().optional()
  });

// 통합 정산 생성 스키마
const CreateSettlementSchema = z.object({
  
  sales: z.object({
    orderId: z.string().uuid(),  
    companyId: z.string().uuid(),
    invoiceNumber: z.string().optional(),
    status: z.enum(invoiceStatusEnum.enumValues).default('draft'),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    subtotalAmount: z.number().nonnegative(),
    taxAmount: z.number().optional(),
    totalAmount: z.number().nonnegative(),
    financialSnapshot: z.any().optional(),
    memo: z.string().optional(),
  }),
  purchase: z.object({    
    orderId: z.string().uuid(),  
    companyId: z.string().uuid(),
    driverId: z.string().uuid().optional(),
    paymentNumber: z.string().optional(),
    status: z.enum(paymentStatusEnum.enumValues).default('draft'),
    issueDate: z.string().optional(),
    paymentDate: z.string().optional(),
    subtotalAmount: z.number().nonnegative(),
    taxAmount: z.number().optional(),
    totalAmount: z.number().nonnegative(),
    financialSnapshot: z.any().optional(),
    memo: z.string().optional(),
    //items: z.array(PurchaseChargeItemSchema).min(1, '최소 1개 이상의 항목이 필요합니다.')
  }).refine(data => data.companyId || data.driverId, {
    message: '운송사 또는 기사 중 하나는 필수입니다.',
    path: ['companyId']
  }),
}).refine(data => data.sales && data.purchase, {
  message: '매출, 매입 둘 다 필수입니다.',
  path: ['sales', 'purchase']
});

export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    // const userId = session.user.id;
    const userId = request.headers.get('x-user-id') || '';
    console.log("userId:", userId);
    const body = await request.json();
    console.log("body:", body);

    // const userId = session.user.id;
    // const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreateSettlementSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { purchase, sales } = data;
    const { ...salesData } = sales;
    //const { items: purchaseItems, ...purchaseData } = purchase;
    const { ...purchaseData } = purchase;
    
    // 트랜잭션으로 매출/매입 정산 병렬 생성
    const result = await db.transaction(async (tx) => {
      const promises: Promise<any>[] = [];
      
      // 매출 정산 생성 (있는 경우)
      if (data.sales) {
        const salesPromise = tx.insert(orderSales).values({
          ...salesData,
          subtotalAmount: String(salesData.subtotalAmount),
          taxAmount: salesData.taxAmount !== undefined ? String(salesData.taxAmount) : undefined,
          totalAmount: String(salesData.totalAmount),
          createdBy: userId,
          updatedBy: userId,
        }).returning();
        promises.push(salesPromise);
      }
      
      // 매입 정산 생성 (있는 경우)
      if (data.purchase) {
        const purchasePromise = tx.insert(orderPurchases).values({
          ...purchaseData,
          subtotalAmount: String(purchaseData.subtotalAmount),
          taxAmount: purchaseData.taxAmount !== undefined ? String(purchaseData.taxAmount) : undefined,
          totalAmount: String(purchaseData.totalAmount),
          createdBy: userId,
          updatedBy: userId,
        }).returning();
        promises.push(purchasePromise);
      }
      
      // 병렬로 실행
      const results = await Promise.all(promises);
      
      return {
        sales: data.sales ? results[0]?.[0] : null,
        purchase: data.purchase ? results[1]?.[0] || results[0]?.[0] : null,
      };
    });

    return NextResponse.json(
      { 
        message: '정산이 성공적으로 생성되었습니다.', 
        data: result 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('정산 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 