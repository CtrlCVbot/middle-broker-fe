import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema/orders';
import { z } from 'zod';

// 화물 데이터 검증 스키마
const OrderValidationSchema = z.object({
  // 화물 정보
  cargoName: z.string().min(2, '화물명은 최소 2자 이상이어야 합니다.'),
  requestedVehicleType: z.enum(['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러']),
  requestedVehicleWeight: z.enum(['1톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤']),
  memo: z.string().optional(),
  
  // 상차지 정보
  pickupAddressId: z.string().uuid().optional(),
  pickupAddressSnapshot: z.any().optional(), // JSON 타입은 any로 처리
  pickupAddressDetail: z.string().optional(),
  pickupName: z.string(),
  pickupContactName: z.string(),
  pickupContactPhone: z.string(),
  pickupDate: z.string(), // 날짜 형식 추가 검증 필요
  pickupTime: z.string(), // 시간 형식 추가 검증 필요
  
  // 하차지 정보
  deliveryAddressId: z.string().uuid().optional(),
  deliveryAddressSnapshot: z.any().optional(), // JSON 타입은 any로 처리
  deliveryAddressDetail: z.string().optional(),
  deliveryName: z.string(),
  deliveryContactName: z.string(),
  deliveryContactPhone: z.string(),
  deliveryDate: z.string(), // 날짜 형식 추가 검증 필요
  deliveryTime: z.string(), // 시간 형식 추가 검증 필요
  
  // 운송 옵션
  transportOptions: z.any().optional(), // JSON 타입은 any로 처리
  
  // 가격 정보
  estimatedDistance: z.number().optional(),
  estimatedPriceAmount: z.number().optional(),
  priceType: z.enum(['기본', '계약']).default('기본'),
  taxType: z.enum(['비과세', '과세']).default('과세'),
  
  // 화주 회사 정보
  companyId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const result = OrderValidationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: '유효하지 않은 화물 데이터입니다.', details: result.error.format() },
        { status: 400 }
      );
    }

    // 필요한 경우 추가 검증 로직 구현
    // 예: 상차일이 하차일보다 이전인지 검증
    const pickupDate = new Date(result.data.pickupDate);
    const deliveryDate = new Date(result.data.deliveryDate);

    if (pickupDate > deliveryDate) {
      return NextResponse.json(
        { error: '상차일은 하차일보다 이전이어야 합니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: '화물 데이터가 유효합니다.',
      data: result.data,
    });
  } catch (error) {
    console.error('화물 데이터 검증 중 오류 발생:', error);
    return NextResponse.json(
      { error: '화물 데이터 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 