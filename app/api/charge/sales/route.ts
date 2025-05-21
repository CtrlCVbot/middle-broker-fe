import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { orderSales, invoiceStatusEnum } from '@/db/schema/orderSales';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 매출 인보이스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const orderId = searchParams.get('orderId');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (orderId) {
      conditions.push(eq(orderSales.orderId, orderId));
    }

    if (companyId) {
      conditions.push(eq(orderSales.companyId, companyId));
    }

    if (status && invoiceStatusEnum.enumValues.includes(status as any)) {
      conditions.push(eq(orderSales.status, status as any));
    }

    if (startDate) {
      conditions.push(sql`${orderSales.issueDate} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${orderSales.issueDate} <= ${endDate}`);
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(orderSales.createdAt) : asc(orderSales.createdAt)
      : sortOrder === 'desc' ? desc(orderSales.issueDate) : asc(orderSales.issueDate);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(orderSales)
        .where(query)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orderSales)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);
    
    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('매출 인보이스 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 매출 인보이스 아이템 스키마
const SalesChargeItemSchema = z.object({
  description: z.string().min(1, '설명은 필수입니다.'),
  amount: z.number().nonnegative('금액은 0 이상이어야 합니다.'),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
  originalChargeLineId: z.string().uuid().optional()
});

// 매출 인보이스 생성 스키마
const CreateOrderSaleSchema = z.object({
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
  items: z.array(SalesChargeItemSchema).min(1, '최소 1개 이상의 항목이 필요합니다.')
});

// 매출 인보이스 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreateOrderSaleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { items, ...saleData } = data;
    
    // 트랜잭션으로 인보이스 및 항목 생성
    const result = await db.transaction(async (tx) => {
      // 매출 인보이스 생성
      const newSale = await tx.insert(orderSales).values({
        ...saleData,
        createdBy: userId,
        updatedBy: userId
      }as any).returning();
      
      const saleId = newSale[0].id;      
      
      
      // 생성된 인보이스 항목과 함께 조회
      return await tx.query.orderSales.findFirst({
        where: eq(orderSales.id, saleId)
      });
    });

    return NextResponse.json(
      { message: '매출 인보이스가 생성되었습니다.', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('매출 인보이스 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 