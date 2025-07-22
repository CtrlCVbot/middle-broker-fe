import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { 
  purchaseBundles, 
  purchaseBundleItems, 
  purchaseItemAdjustments 
} from '@/db/schema/purchaseBundles';
import { orderSales } from '@/db/schema/orderSales';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { orders } from '@/db/schema/orders';
import { companies } from '@/db/schema/companies';
import { IPurchaseBundleItemWithDetails } from '@/types/broker-charge-purchase';
import { orderPurchases } from '@/db/schema/orderPurchases';

/**
 * GET: 정산 그룹에 연결된 화물 목록 조회 (상세 정보 포함)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET: 정산 그룹에 연결된 화물 목록 조회 (상세 정보 포함)');
    const { id } = await params;

    // 정산 그룹 존재 확인
    const bundle = await db
      .select()
      .from(purchaseBundles)
      .where(eq(purchaseBundles.id, id))
      .limit(1);

    if (bundle.length === 0) {
      return NextResponse.json(
        { error: '정산 그룹을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 화물 목록 조회 (복잡한 조인을 통한 상세 정보 포함)
    const bundleItemsQuery = await db
      .select({
        // Bundle Item 정보
        id: purchaseBundleItems.id,
        bundleId: purchaseBundleItems.bundleId,
        orderPurchaseId: purchaseBundleItems.orderPurchaseId,
        baseAmount: purchaseBundleItems.baseAmount,
        createdAt: purchaseBundleItems.createdAt,
        updatedAt: purchaseBundleItems.updatedAt,
        
        // Order Sale 정보
        orderPurchaseAmount: orderPurchases.subtotalAmount,
        
        // Order 정보
        orderId: orders.id,
        pickupName: orders.pickupName,
        deliveryName: orders.deliveryName,
        pickupDate: orders.pickupDate,
        deliveryDate: orders.deliveryDate,
        pickupAddressSnapshot: orders.pickupAddressSnapshot,
        deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
        requestedVehicleWeight: orders.requestedVehicleWeight,
        requestedVehicleType: orders.requestedVehicleType,
        flowStatus: orders.flowStatus,
        
        // Company 정보 (발주사)
        companyName: companies.name,
        companyBusinessNumber: companies.businessNumber,
        companyCeo: companies.ceoName,
        
        // Dispatch 정보 (필요에 따라)
        dispatchAmount: orderPurchases.subtotalAmount,
        // dispatchDriverSnapshot: orderDispatches.driverSnapshot,
      })
      .from(purchaseBundleItems)
      .leftJoin(orderPurchases, eq(purchaseBundleItems.orderPurchaseId, orderPurchases.id))
      .leftJoin(orders, eq(orderPurchases.orderId, orders.id))
      .leftJoin(companies, eq(orderPurchases.companyId, companies.id))
      .leftJoin(orderDispatches, eq(orders.id, orderDispatches.orderId))
      .where(eq(purchaseBundleItems.bundleId, id))
      .orderBy(purchaseBundleItems.createdAt);

    // 각 화물별 개별 추가금 조회
    const bundleItemIds = bundleItemsQuery.map(item => item.id);
    
    let itemAdjustments: any[] = [];
    if (bundleItemIds.length > 0) {
      // 모든 번들 아이템의 추가금을 한 번에 조회
      itemAdjustments = await db
        .select()
        .from(purchaseItemAdjustments)
        .where(inArray(purchaseItemAdjustments.bundleItemId, bundleItemIds));
    }

    // 결과 데이터 구성
    const result: IPurchaseBundleItemWithDetails[] = bundleItemsQuery.map(item => ({
      // ISalesBundleItem 기본 정보
      id: item.id,
      bundleId: item.bundleId,
      orderPurchaseId: item.orderPurchaseId,
      baseAmount: parseFloat(item.baseAmount || '0'),
      createdAt: item.createdAt?.toISOString() || '',
      updatedAt: item.updatedAt?.toISOString() || '',
      
      // 화물 상세 정보
      orderDetails: {
        orderId: item.orderId || '',
        companyName: item.companyName || '',
        pickupName: item.pickupName || '',
        deliveryName: item.deliveryName || '',
        pickupDate: item.pickupDate?.toString().split('T')[0] || '',
        deliveryDate: item.deliveryDate?.toString().split('T')[0] || '',
        amount: parseFloat(item.orderPurchaseAmount?.toString() || '0'),
      },
      
      // 해당 화물의 개별 추가금 목록 (실제로는 화물별로 필터링 필요)
      adjustments: itemAdjustments
        .filter(adj => adj.bundleItemId === item.id)
        .map(adj => ({
          id: adj.id,
          bundleItemId: adj.bundleItemId,
          type: adj.type,
          description: adj.description,
          amount: parseFloat(adj.amount || '0'),
          taxAmount: parseFloat(adj.taxAmount || '0'),
          createdAt: adj.createdAt?.toISOString() || '',
          createdBy: adj.createdBy,
        }))
    })as any);

    return NextResponse.json({
      data: result,
      message: '화물 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('화물 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '화물 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
} 