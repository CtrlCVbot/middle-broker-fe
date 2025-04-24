import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { addresses } from "@/db/schema/addresses";
//import { auth } from "@/lib/auth";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { decodeBase64String } from "@/utils/format";

// 화물 수정 요청 데이터 검증 스키마
const orderUpdateSchema = z.object({
  // 차량 정보
  vehicleType: z.string().min(1, "차량 종류를 선택해주세요"),
  weightType: z.string().min(1, "중량을 선택해주세요"),
  cargoType: z.string().min(1, "화물 종류를 입력해주세요"),
  remark: z.string().optional(),
  
  // 출발지 정보
  departure: z.object({
    address: z.string().min(1, "주소를 입력해주세요"),
    detailedAddress: z.string().optional(),
    name: z.string().min(1, "담당자명을 입력해주세요"),
    company: z.string().min(1, "업체명을 입력해주세요"),
    contact: z.string().min(1, "연락처를 입력해주세요"),
    date: z.string().min(1, "날짜를 선택해주세요"),
    time: z.string().min(1, "시간을 선택해주세요"),
    latitude: z.number(),
    longitude: z.number(),
  }),
  
  // 도착지 정보
  destination: z.object({
    address: z.string().min(1, "주소를 입력해주세요"),
    detailedAddress: z.string().optional(),
    name: z.string().min(1, "담당자명을 입력해주세요"),
    company: z.string().min(1, "업체명을 입력해주세요"),
    contact: z.string().min(1, "연락처를 입력해주세요"),
    date: z.string().min(1, "날짜를 선택해주세요"),
    time: z.string().min(1, "시간을 선택해주세요"),
    latitude: z.number(),
    longitude: z.number(),
  }),
  
  // 운송 옵션
  selectedOptions: z.array(z.string()),
  estimatedAmount: z.number().optional(),
});

// GET: 특정 화물 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-user-company-id');
    if(!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 401 });
    }

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, params.id),
        eq(orders.companyId, companyId)
      ),
    });

    if (!order) {
      return NextResponse.json(
        { error: "화물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("화물 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "화물 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 화물 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 인증 확인
    const userId = request.headers.get('x-user-id');
    if(!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }
    const encodedName = decodeBase64String(request.headers.get('x-user-name') || '');
    const userEmail = request.headers.get('x-user-email') || '';
    const userPhone = request.headers.get('x-user-phone') || '';
    
    const companyId = request.headers.get('x-user-company-id');
    if(!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 401 });
    }

    // 2. 기존 화물 조회
    const existingOrder = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, params.id),
        eq(orders.companyId, companyId)
      ),
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "화물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 3. 요청 데이터 파싱 및 검증
    const body = await request.json();
        

    // 4. 화물 정보 업데이트
    const updatedOrder = await db
      .update(orders)
      .set({
        //상태
        flowStatus: body.flowStatus,

        //화물 정보
        cargoName: body.cargo.name,
        cargoWeight: body.cargo.weight,
        cargoUnit: body.cargo.unit,
        cargoQuantity: body.cargo.quantity,
        packagingType: body.cargo.packagingType,

        //차량 정보
        vehicleType: body.vehicle.type,
        vehicleCount: body.vehicle.count,

        //가격 정보
        priceAmount: body.price.amount,
        priceType: body.price.type,
        taxType: body.price.taxType,

        //주소 정보
        pickupAddressId: body.route.pickupAddressId,
        deliveryAddressId: body.route.deliveryAddressId,
        pickupSnapshot: body.route.pickupSnapshot,
        deliverySnapshot: body.route.deliverySnapshot,

        //일정 정보
        pickupDate: body.route.pickupDate,
        deliveryDate: body.route.deliveryDate,

        //상태 및 메모
        isCanceled: body.isCanceled,
        memo: body.memo,

        //생성/수정 정보
        updatedBy: userId,
        updatedAt: new Date(),
        updatedBySnapshot: body.updatedBySnapshot,
      })
      .where(eq(orders.id, params.id))
      .returning();

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error("화물 수정 중 오류 발생:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력 데이터가 유효하지 않습니다.", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "화물 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 화물 삭제 (또는 취소)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if(!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }
    const encodedName = decodeBase64String(request.headers.get('x-user-name') || '');
    const userEmail = request.headers.get('x-user-email') || '';
    const userPhone = request.headers.get('x-user-phone') || '';
    
    const companyId = request.headers.get('x-user-company-id');
    if(!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 401 });
    }

    // 화물 상태를 '취소'로 변경
    const updatedOrder = await db
      .update(orders)
      .set({
        flowStatus: "취소",
        updatedBy: userId,
        updatedAt: new Date(),
        updatedBySnapshot: {
          name: encodedName,
          email: userEmail,
          mobile: userPhone,
        },
      })
      .where(
        and(
          eq(orders.id, params.id),
          eq(orders.companyId, companyId),
          eq(orders.flowStatus, "등록") // 등록 상태인 경우에만 취소 가능
        )
      )
      .returning();

    if (!updatedOrder.length) {
      return NextResponse.json(
        { error: "취소할 수 없는 화물입니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error("화물 취소 중 오류 발생:", error);
    return NextResponse.json(
      { error: "화물 취소에 실패했습니다." },
      { status: 500 }
    );
  }
} 