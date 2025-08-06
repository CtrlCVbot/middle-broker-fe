import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { chargeLines, chargeSideEnum } from '@/db/schema/chargeLines';
import { chargeGroups } from '@/db/schema/chargeGroups';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { logOrderChange } from '@/utils/order-change-logger';

// 사용자 역할 결정 함수
const getUserRole = (systemAccessLevel?: string): 'shipper' | 'broker' | 'admin' => {
  if (!systemAccessLevel) return 'broker';
  
  switch (systemAccessLevel) {
    case 'platform_admin':
    case 'broker_admin':
    case 'shipper_admin':
      return 'admin';
    case 'broker_member':
      return 'broker';
    case 'shipper_member':
      return 'shipper';
    default:
      return 'broker';
  }
};

// 운임 변경 타입 감지 함수
const detectPriceChangeType = (oldData: any, newData: any): 'updatePrice' | 'updatePriceSales' | 'updatePricePurchase' => {
  const salesChanged = oldData.salesAmount !== newData.salesAmount;
  const purchaseChanged = oldData.purchaseAmount !== newData.purchaseAmount;
  
  if (salesChanged && purchaseChanged) {
    return 'updatePrice';
  } else if (salesChanged) {
    return 'updatePriceSales';
  } else if (purchaseChanged) {
    return 'updatePricePurchase';
  } else {
    return 'updatePrice'; // 기본값
  }
};

// 주문의 기존 운임 정보 조회 함수
const getOrderChargeData = async (orderId: string) => {
  try {
    // 해당 주문의 모든 운임 그룹과 라인 조회
    const groups = await db
      .select()
      .from(chargeGroups)
      .where(eq(chargeGroups.orderId, orderId))
      .execute();

    let salesAmount = 0;
    let purchaseAmount = 0;

    // 각 그룹의 라인들을 조회하여 합계 계산
    for (const group of groups) {
      const lines = await db
        .select()
        .from(chargeLines)
        .where(eq(chargeLines.groupId, group.id))
        .execute();

      for (const line of lines) {
        if (line.side === 'sales') {
          salesAmount += Number(line.amount) || 0;
        } else if (line.side === 'purchase') {
          purchaseAmount += Number(line.amount) || 0;
        }
      }
    }

    return {
      salesAmount,
      purchaseAmount
    };
  } catch (error) {
    console.error('기존 운임 데이터 조회 중 오류:', error);
    return {
      salesAmount: 0,
      purchaseAmount: 0
    };
  }
};

// 운임 라인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;
    
    // 필터 파라미터
    const groupId = searchParams.get('groupId');
    const side = searchParams.get('side');
    
    // 정렬 파라미터
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 검색 조건 구성
    let conditions = [];

    if (groupId) {
      conditions.push(eq(chargeLines.groupId, groupId));
    }

    if (side && chargeSideEnum.enumValues.includes(side as any)) {
      conditions.push(eq(chargeLines.side, side as any));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    // 정렬 설정
    const orderBy = sortBy === 'createdAt' 
      ? sortOrder === 'desc' ? desc(chargeLines.createdAt) : asc(chargeLines.createdAt)
      : sortOrder === 'desc' ? desc(chargeLines.updatedAt) : asc(chargeLines.updatedAt);

    // 데이터 조회 및 총 개수 카운트
    const [result, total] = await Promise.all([
      db
        .select()
        .from(chargeLines)
        .where(query)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(chargeLines)
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
    console.error('운임 라인 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 운임 라인 생성 스키마
const CreateChargeLineSchema = z.object({
  groupId: z.string().uuid(),
  side: z.enum(chargeSideEnum.enumValues),
  amount: z.number(),
  memo: z.string().optional(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional()
});

// 운임 라인 생성
export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    //const userId = session.user.id;
    const userId = request.headers.get('x-user-id') || '';
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreateChargeLineSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // 그룹 존재 여부 및 잠금 상태 확인
    const chargeGroup = await db.query.chargeGroups.findFirst({
      where: eq(chargeGroups.id, data.groupId)
    });
    
    if (!chargeGroup) {
      return NextResponse.json(
        { error: '존재하지 않는 운임 그룹입니다.' },
        { status: 404 }
      );
    }
    
    if (chargeGroup.isLocked) {
      return NextResponse.json(
        { error: '잠긴 운임 그룹에는 라인을 추가할 수 없습니다.' },
        { status: 403 }
      );
    }

    // orderId 확인 (이력 기록용)
    const orderId = chargeGroup.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: '주문 정보가 없는 운임 그룹입니다.' },
        { status: 400 }
      );
    }

    // 운임 변경 이력 기록을 위한 기존 데이터 조회
    const oldChargeData = await getOrderChargeData(orderId);

    // 사용자 정보 조회 (이력 기록용)
    const requestUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!requestUser) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 세금 자동 계산 (taxAmount가 제공되지 않은 경우)
    if (data.taxRate && !data.taxAmount) {
      data.taxAmount = Number((data.amount * (data.taxRate / 100)).toFixed(2));
    }
    
    // 운임 라인 생성
    const newChargeLine = await db.insert(chargeLines).values({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    }as any).returning();

    // 운임 라인 생성 후 새로운 운임 데이터 조회
    const newChargeData = await getOrderChargeData(orderId);

    // 운임 변경이 있는 경우 이력 기록
    if (oldChargeData.salesAmount !== newChargeData.salesAmount || 
        oldChargeData.purchaseAmount !== newChargeData.purchaseAmount) {
      
      try {
        console.log('!!운임 정보 변경 로그!!');
        // 변경 타입 자동 감지
        const changeType = detectPriceChangeType(oldChargeData, newChargeData);
        
        // 변경 사유 생성
        let changeReason = `운임 정보 변경: ${data.side === 'sales' ? '청구금' : '배차금'} `;
        if (data.memo) {
          changeReason += `(${data.memo})`;
        } else {
          changeReason += `${Number(data.amount).toLocaleString()}원 추가`;
        }

        // 이력 기록
        await logOrderChange({
          orderId,
          changedBy: userId,
          changedByRole: getUserRole(requestUser.system_access_level),
          changedByName: requestUser.name,
          changedByEmail: requestUser.email,
          changedByAccessLevel: requestUser.system_access_level,
          changeType,
          oldData: oldChargeData,
          newData: newChargeData,
          reason: changeReason
        });
        console.log('!!운임 정보 변경 로그 기록 완료!!');
      } catch (logError) {
        // 이력 기록 실패는 운임 라인 생성에 영향을 주지 않도록 로그만 남김
        console.error('운임 변경 이력 기록 중 오류 발생:', logError);
      }
    }

    return NextResponse.json(
      { message: '운임 라인이 생성되었습니다.', data: newChargeLine[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('운임 라인 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 