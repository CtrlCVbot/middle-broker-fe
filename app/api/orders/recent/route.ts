import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNotNull, desc } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { ICargo } from '@/types/order';
import { z } from 'zod';
import { format } from 'date-fns';

// 요청 스키마 정의
const RecentCargoQuerySchema = z.object({
  companyId: z.string({
    required_error: 'companyId 파라미터는 필수입니다.',
  }),
  limit: z.string().optional().transform((val) => {
    if (!val) return 5;
    const num = parseInt(val, 10);
    return isNaN(num) ? 5 : Math.min(Math.max(num, 1), 20); // 1-20 범위로 제한
  }),
});

// 응답 인터페이스
interface RecentCargoResponse {
  success: boolean;
  data: ICargo[];
  total: number;
}

// 중복 제거 함수
function deduplicateCargos(cargos: ICargo[]): ICargo[] {
  const seen = new Map<string, ICargo>();
  
  for (const cargo of cargos) {
    const key = `${cargo.cargoName}_${cargo.requestedVehicleWeight}_${cargo.requestedVehicleType}`;
    
    // 동일 키가 없거나, 더 최근 데이터인 경우에만 저장
    if (!seen.has(key) || new Date(cargo.updatedAt) > new Date(seen.get(key)!.updatedAt)) {
      seen.set(key, cargo);
    }
  }
  
  return Array.from(seen.values());
}

// 주문 데이터를 화물 정보로 변환하는 함수
function transformOrderToCargo(order: any): ICargo {
  return {
    id: order.id,
    cargoName: order.cargoName || '화물명 없음',
    requestedVehicleWeight: order.requestedVehicleWeight || '',
    requestedVehicleType: order.requestedVehicleType || '',
    memo: order.memo || '',
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
    const queryResult = RecentCargoQuerySchema.safeParse({
      companyId: searchParams.get('companyId'),
      limit: searchParams.get('limit'),
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

    const { companyId, limit } = queryResult.data;

    // 최근 주문 조회 및 화물 데이터 변환
    const recentOrders = await db
      .select({
        id: orders.id,
        cargoName: orders.cargoName,
        requestedVehicleWeight: orders.requestedVehicleWeight,
        requestedVehicleType: orders.requestedVehicleType,
        memo: orders.memo,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        createdBy: orders.createdBy,
        updatedBy: orders.updatedBy
      })
      .from(orders)
      .where(
        and(
          eq(orders.companyId, companyId),
          isNotNull(orders.cargoName),
          eq(orders.isCanceled, false) // 취소되지 않은 주문만
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(200) // 충분히 많은 수를 가져와서 중복 제거 후 limit 적용
      .execute();

    // 화물 데이터 변환
    const cargos = recentOrders
      .filter(order => order.cargoName) // cargoName이 있는 경우만
      .map(transformOrderToCargo);

    // 중복 제거
    const uniqueCargos = deduplicateCargos(cargos);

    // 최신순 정렬 및 limit 적용
    const finalCargos = uniqueCargos
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);

    const response: RecentCargoResponse = {
      success: true,
      data: finalCargos,
      total: finalCargos.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('최근 화물 조회 중 오류 발생:', error);
    
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