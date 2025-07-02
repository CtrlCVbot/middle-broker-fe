import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNotNull, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { users } from '@/db/schema/users';
import { IAddress, AddressType } from '@/types/address';
import { IAddressSnapshot } from '@/types/order';
import { z } from 'zod';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// 요청 스키마 정의
const RecentAddressQuerySchema = z.object({
  type: z.enum(['pickup', 'delivery'], {
    required_error: 'type 파라미터는 필수입니다.',
    invalid_type_error: 'type은 pickup 또는 delivery여야 합니다.'
  }),
  limit: z.string().optional().transform((val) => {
    if (!val) return 10;
    const num = parseInt(val, 10);
    return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 20); // 1-20 범위로 제한
  })
});

// 응답 인터페이스
interface RecentAddressResponse {
  success: boolean;
  data: IAddress[];
  total: number;
  type: 'pickup' | 'delivery';
}

// 중복 제거 함수
function deduplicateAddresses(addresses: IAddress[]): IAddress[] {
  const seen = new Map<string, IAddress>();
  
  for (const address of addresses) {
    const key = `${address.roadAddress}_${address.contactName}_${address.contactPhone}`;
    
    // 동일 키가 없거나, 더 최근 데이터인 경우에만 저장
    if (!seen.has(key) || new Date(address.updatedAt) > new Date(seen.get(key)!.updatedAt)) {
      seen.set(key, address);
    }
  }
  
  return Array.from(seen.values());
}

// 상차지 주소 변환 함수
function transformPickupOrderToAddress(order: any): IAddress {
  const snapshot = order.pickupAddressSnapshot as IAddressSnapshot;
  
  return {
    id: `pickup_${order.id}`, // 임시 ID 생성
    name: order.pickupName || snapshot?.name || '장소명 없음',
    type: 'load' as AddressType,
    roadAddress: snapshot?.roadAddress || '',
    jibunAddress: snapshot?.jibunAddress || '',
    detailAddress: snapshot?.detailAddress || null,
    postalCode: snapshot?.postalCode || null,
    metadata: {
      lat: snapshot?.metadata?.lat,
      lng: snapshot?.metadata?.lng,
      originalInput: snapshot?.metadata?.originalInput,
      source: snapshot?.metadata?.source,
      buildingName: snapshot?.metadata?.buildingName,
      floor: snapshot?.metadata?.floor,
      tags: snapshot?.metadata?.tags,
    },
    contactName: order.pickupContactName || snapshot?.contactName || null,
    contactPhone: order.pickupContactPhone || snapshot?.contactPhone || null,
    memo: `최근 상차지 (${format(order.createdAt, 'yyyy-MM-dd')})`,
    isFrequent: false,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    createdBy: order.createdBy,
    updatedBy: order.updatedBy
  };
}

// 하차지 주소 변환 함수
function transformDeliveryOrderToAddress(order: any): IAddress {
  const snapshot = order.deliveryAddressSnapshot as IAddressSnapshot;
  
  return {
    id: `delivery_${order.id}`, // 임시 ID 생성
    name: order.deliveryName || snapshot?.name || '장소명 없음',
    type: 'drop' as AddressType,
    roadAddress: snapshot?.roadAddress || '',
    jibunAddress: snapshot?.jibunAddress || '',
    detailAddress: snapshot?.detailAddress || null,
    postalCode: snapshot?.postalCode || null,
    metadata: {
      lat: snapshot?.metadata?.lat,
      lng: snapshot?.metadata?.lng,
      originalInput: snapshot?.metadata?.originalInput,
      source: snapshot?.metadata?.source,
      buildingName: snapshot?.metadata?.buildingName,
      floor: snapshot?.metadata?.floor,
      tags: snapshot?.metadata?.tags,
    },
    contactName: order.deliveryContactName || snapshot?.contactName || null,
    contactPhone: order.deliveryContactPhone || snapshot?.contactPhone || null,
    memo: `최근 하차지 (${format(order.createdAt, 'yyyy-MM-dd')})`,
    isFrequent: false,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    createdBy: order.createdBy,
    updatedBy: order.updatedBy
  };
}

export async function GET(request: NextRequest) {
  try {
    // 인증된 사용자 ID 확인
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '인증이 필요합니다.',
          data: [],
          total: 0
        },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 검증
    const searchParams = request.nextUrl.searchParams;
    const queryResult = RecentAddressQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit')
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: queryResult.error.errors[0].message,
          data: [],
          total: 0
        },
        { status: 400 }
      );
    }

    const { type, limit } = queryResult.data;

    // 사용자의 회사 ID 조회
    const user = await db
      .select({ companyId: users.companyId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    if (!user || user.length === 0 || !user[0].companyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '사용자의 회사 정보를 찾을 수 없습니다.',
          data: [],
          total: 0
        },
        { status: 400 }
      );
    }

    const companyId = user[0].companyId;

    // 타입별 최근 주문 조회
    let orderQuery;
    let selectFields;

    if (type === 'pickup') {
      selectFields = {
        id: orders.id,
        pickupAddressSnapshot: orders.pickupAddressSnapshot,
        pickupName: orders.pickupName,
        pickupContactName: orders.pickupContactName,
        pickupContactPhone: orders.pickupContactPhone,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        createdBy: orders.createdBy,
        updatedBy: orders.updatedBy
      };
      
      orderQuery = db
        .select(selectFields)
        .from(orders)
        .where(
          and(
            eq(orders.companyId, companyId),
            isNotNull(orders.pickupAddressSnapshot),
            eq(orders.isCanceled, false) // 취소되지 않은 주문만
          )
        )
        .orderBy(desc(orders.createdAt))
        .limit(200); // 충분히 많은 수를 가져와서 중복 제거 후 limit 적용
    } else {
      selectFields = {
        id: orders.id,
        deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
        deliveryName: orders.deliveryName,
        deliveryContactName: orders.deliveryContactName,
        deliveryContactPhone: orders.deliveryContactPhone,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        createdBy: orders.createdBy,
        updatedBy: orders.updatedBy
      };
      
      orderQuery = db
        .select(selectFields)
        .from(orders)
        .where(
          and(
            eq(orders.companyId, companyId),
            isNotNull(orders.deliveryAddressSnapshot),
            eq(orders.isCanceled, false) // 취소되지 않은 주문만
          )
        )
        .orderBy(desc(orders.createdAt))
        .limit(200); // 충분히 많은 수를 가져와서 중복 제거 후 limit 적용
    }

    const recentOrders = await orderQuery.execute();

    // 주소 데이터 변환
    let addresses: IAddress[] = [];
    
    if (type === 'pickup') {
      addresses = recentOrders
        .filter(order => order.pickupAddressSnapshot) // null 체크
        .map(transformPickupOrderToAddress);
    } else {
      addresses = recentOrders
        .filter(order => order.deliveryAddressSnapshot) // null 체크
        .map(transformDeliveryOrderToAddress);
    }

    // 중복 제거
    const uniqueAddresses = deduplicateAddresses(addresses);

    // 최신순 정렬 및 limit 적용
    const finalAddresses = uniqueAddresses
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);

    const response: RecentAddressResponse = {
      success: true,
      data: finalAddresses,
      total: finalAddresses.length,
      type
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('최근 사용 주소 조회 중 오류 발생:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다.',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
} 