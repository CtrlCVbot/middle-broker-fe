import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql, gte, lte, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { purchaseBundles, purchaseBundleStatusEnum } from '@/db/schema/purchaseBundles';
import { purchaseBundleItems } from '@/db/schema/purchaseBundles';
import { purchaseBundleAdjustments } from '@/db/schema/purchaseBundles';
import { bundleAdjTypeEnum } from '@/db/schema/salesBundles';
import { orderPurchases } from '@/db/schema/orderPurchases';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 매입 번들 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const companyId = searchParams.get('companyId');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (companyId) {
      conditions.push(eq(purchaseBundles.companyId, companyId));
    }

    if (driverId) {
      conditions.push(eq(purchaseBundles.driverId, driverId));
    }

    if (status && purchaseBundleStatusEnum.enumValues.includes(status as any)) {
      conditions.push(eq(purchaseBundles.status, status as any));
    }

    if (startDate) {
      conditions.push(gte(purchaseBundles.periodFrom, startDate));
    }

    if (endDate) {
      conditions.push(lte(purchaseBundles.periodTo, endDate));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(purchaseBundles.createdAt) : asc(purchaseBundles.createdAt)
      : sortOrder === 'desc' ? desc(purchaseBundles.periodFrom) : asc(purchaseBundles.periodFrom);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(purchaseBundles)
        .where(query)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(purchaseBundles)
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
    console.error('매입 통합 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 번들 항목 스키마
const PurchaseBundleItemSchema = z.object({
  orderPurchaseId: z.string().uuid(),
  baseAmount: z.number().nonnegative()
});

// 번들 조정 스키마
const PurchaseBundleAdjustmentSchema = z.object({
  type: z.enum(bundleAdjTypeEnum.enumValues),
  description: z.string().optional(),
  amount: z.number()
});

// 매입 번들 생성 스키마
const CreatePurchaseBundleSchema = z.object({
  companyId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  periodFrom: z.string().optional(),
  periodTo: z.string().optional(),
  paymentNo: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  status: z.enum(purchaseBundleStatusEnum.enumValues).default('draft'),
  items: z.array(PurchaseBundleItemSchema).min(1, '최소 1개 이상의 항목이 필요합니다.'),
  adjustments: z.array(PurchaseBundleAdjustmentSchema).optional()
}).refine(data => data.companyId || data.driverId, {
  message: '운송사 또는 기사 중 하나는 필수입니다.',
  path: ['companyId', 'driverId']
});

// 매입 번들 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreatePurchaseBundleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { items, adjustments, ...bundleData } = data;
    
    // 모든 전표가 동일한 대상(운송사 또는 기사)에 속하는지 확인
    const orderPurchaseIds = items.map(item => item.orderPurchaseId);
    const purchaseRecords = await db
      .select()
      .from(orderPurchases)
      .where(sql`${orderPurchases.id} IN ${orderPurchaseIds}`);
    
    // 운송사 체크 (운송사ID가 제공된 경우)
    if (data.companyId) {
      const allSameCompany = purchaseRecords.every(record => 
        record.companyId === data.companyId);
      
      if (!allSameCompany) {
        return NextResponse.json(
          { error: '모든 매입 전표는 동일한 운송사에 속해야 합니다.' },
          { status: 400 }
        );
      }
    }
    
    // 기사 체크 (기사ID가 제공된 경우)
    if (data.driverId) {
      const allSameDriver = purchaseRecords.every(record => 
        record.driverId === data.driverId);
      
      if (!allSameDriver) {
        return NextResponse.json(
          { error: '모든 매입 전표는 동일한 기사에 속해야 합니다.' },
          { status: 400 }
        );
      }
    }
    
    // 트랜잭션으로 번들 및 항목 생성
    const result = await db.transaction(async (tx) => {
      // 매입 번들 생성
      const newBundle = await tx.insert(purchaseBundles).values({
        ...bundleData
      }as any).returning();
      
      const bundleId = newBundle[0].id;
      
      // 번들 항목 생성
      const itemPromises = items.map(item => {
        return tx.insert(purchaseBundleItems).values({
          ...item,
          bundleId
        }as any);
      });
      
      await Promise.all(itemPromises);
      
      // 번들 조정 생성
      if (adjustments && adjustments.length > 0) {
        const adjPromises = adjustments.map(adj => {
          return tx.insert(purchaseBundleAdjustments).values({
            ...adj,
            bundleId
          }as any);
        });
        
        await Promise.all(adjPromises);
      }
      
      // 생성된 번들 항목과 함께 조회
      return await tx.query.purchaseBundles.findFirst({
        where: eq(purchaseBundles.id, bundleId),
        with: {
          items: {
            with: {
              orderPurchase: true
            }
          },
          adjustments: true,
          company: data.companyId ? true : false
        }
      }as any);
    });

    return NextResponse.json(
      { message: '매입 통합 정산이 생성되었습니다.', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('매입 통합 정산 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 