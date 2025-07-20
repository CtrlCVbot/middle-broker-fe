import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql, gte, lte, inArray, ilike, or } from 'drizzle-orm';
import { db } from '@/db';
//import { salesBundles, salesBundleStatusEnum } from '@/db/schema/salesBundles';
//import { salesBundleItems } from '@/db/schema/salesBundles';
import { 
    //salesBundleAdjustments, 
    bundleAdjTypeEnum } from '@/db/schema/salesBundles';
import { purchaseBundles, purchaseBundleStatusEnum } from '@/db/schema/purchaseBundles';
import { purchaseBundleItems } from '@/db/schema/purchaseBundles';
import { purchaseBundleAdjustments } from '@/db/schema/purchaseBundles';

import { orderSales } from '@/db/schema/orderSales';
import { z } from 'zod';

import { companies } from '@/db/schema/companies';
import { users } from '@/db/schema/users';
import { orderPurchases } from '@/db/schema/orderPurchases';

// 매출 번들 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const companyId = searchParams.get('companyId');
    const shipperName = searchParams.get('shipperName');
    const shipperBusinessNumber = searchParams.get('shipperBusinessNumber');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];
    

    if (companyId) {
      conditions.push(eq(purchaseBundles.companyId, companyId));
    }

    if (shipperName) {
      conditions.push(ilike(purchaseBundles.companyName, `%${shipperName}%`));
    }
    if (shipperBusinessNumber) {
      conditions.push(ilike(purchaseBundles.companyBusinessNumber, `%${shipperBusinessNumber}%`));
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

    if (search) {
      conditions.push(
        or(
          ilike(purchaseBundles.companyName, `%${search}%`),
          ilike(purchaseBundles.companyBusinessNumber, `%${search}%`)
        )
      );
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(purchaseBundles.createdAt) : asc(purchaseBundles.createdAt)
      : sortOrder === 'desc' ? desc(purchaseBundles.periodFrom) : asc(purchaseBundles.periodFrom);

    // 데이터 조회 및 총 개수 카운트
    const [salesBundlesResult, total] = await Promise.all([
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


    // // 2단계: 해당 salesBundles들의 bundleId 추출
    // const bundleIds = salesBundlesResult.map(bundle => bundle.id);

    // // 3단계: 각 bundleId에 해당하는 salesBundleItems 조회
    // const items = await db
    //   .select()
    //   .from(salesBundleItems)
    //   .where(inArray(salesBundleItems.bundleId, bundleIds))
    //   .orderBy(orderBy) // 필요시 item 정렬 방식 지정
    //   .execute();

    // // 최종 결과 조립
    // const result = {
    //   bundles: salesBundlesResult,
    //   items,
    //   total,
    // };
    
    return NextResponse.json({
      data: salesBundlesResult,      
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('매출 통합 목록 조회 중 오류 발생:', error);
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

// 매출 번들 생성 스키마
const CreateSalesBundleSchema = z.object({
  companyId: z.string().uuid(),
  managerId: z.string().uuid(),
  periodFrom: z.string().optional(),
  periodTo: z.string().optional(),
  invoiceNo: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  totalTaxAmount: z.number().nonnegative(),
  totalAmountWithTax: z.number().nonnegative(),
  status: z.enum(purchaseBundleStatusEnum.enumValues).default('draft'),
  items: z.array(PurchaseBundleItemSchema).min(1, '최소 1개 이상의 항목이 필요합니다.'),
  adjustments: z.array(PurchaseBundleAdjustmentSchema).optional(),
  memo: z.string().optional(),
  settledAt: z.string().optional(),
  bankCode: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountHolder: z.string().optional(),  
  periodType: z.string().default('departure'),
  orderCount: z.number().nonnegative(),
  invoiceIssuedAt: z.string().optional().nullable(),
  depositReceivedAt: z.string().optional().nullable(),
});

// 매출 번들 생성
export async function POST(request: NextRequest) {
  try {

    console.log("매출 번들 생성 시작!");
    const userId = request.headers.get('x-user-id') || '';
    
    console.log("userId:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다. x-user-id 헤더가 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("body:", body);
    // 요청 데이터 검증
    const validationResult = CreateSalesBundleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { items, adjustments, ...bundleData } = data;
    
    // 모든 인보이스가 동일한 회사에 속하는지 확인
    const orderPurchaseIds = items.map(item => item.orderPurchaseId);
    const purchaseRecords = await db
      .select()
      .from(orderPurchases)
      .where(sql`${orderPurchases.id} IN ${orderPurchaseIds}`);

    //청구 업체 조회
    const selectedCompany = await db.query.companies.findFirst({
      where: eq(companies.id, data.companyId)
    });

    if (!selectedCompany) {
      return NextResponse.json(
        { error: '회사 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    //청구 업체 담당자 조회
    const selectedManager = await db.query.users.findFirst({
      where: eq(users.id, data.managerId)
    });

    if (!selectedManager) {
      return NextResponse.json(
        { error: '관리자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    // const allSameCompany = salesRecords.every(record => record.companyId === data.companyId);
    // if (!allSameCompany) {
    //   return NextResponse.json(
    //     { error: '모든 매출 인보이스는 동일한 회사에 속해야 합니다.' },
    //     { status: 400 }
    //   );
    // }
    console.log("bundleData!!!:", bundleData);

    // 트랜잭션으로 번들 및 항목 생성
    const result = await db.transaction(async (tx) => {
      // 매출 번들 생성
      const newBundle = await tx.insert(purchaseBundles).values({
        ...bundleData,
        settlementMemo: bundleData.memo,
        companyName: selectedCompany.name,
        companyBusinessNumber: selectedCompany.businessNumber,
        companySnapshot: {
          name: selectedCompany.name,
          businessNumber: selectedCompany.businessNumber,
          ceoName: selectedCompany.ceoName,
        },
        managerSnapshot: {
          name: selectedManager.name,
          email: selectedManager.email,
          mobile: selectedManager.phone_number,
        },
        createdBy: userId,
        updatedBy: userId
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

      //orderSales 상태 변경
      const orderSalesPromises = orderPurchaseIds.map(id => {
        return tx.update(orderPurchases).set({
          status: 'issued'
        }).where(eq(orderPurchases.id, id));
      });
      await Promise.all(orderSalesPromises);
      
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
          adjustments: true
        }
      });
    });

    return NextResponse.json(
      { message: '매출 통합 정산이 생성되었습니다.', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('매출 통합 정산 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 