import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { addresses } from "@/db/schema/addresses";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, params.id),
        eq(orders.companyId, session.user.companyId)
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 기존 화물 조회
    const existingOrder = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, params.id),
        eq(orders.companyId, session.user.companyId)
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
    const validatedData = orderUpdateSchema.parse(body);

    // 4. 주소 정보 업데이트
    await Promise.all([
      // 출발지 주소 업데이트
      db.update(addresses)
        .set({
          address: validatedData.departure.address,
          detailedAddress: validatedData.departure.detailedAddress,
          latitude: validatedData.departure.latitude,
          longitude: validatedData.departure.longitude,
          contactName: validatedData.departure.name,
          contactCompany: validatedData.departure.company,
          contactPhone: validatedData.departure.contact,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingOrder.pickupAddressId)),

      // 도착지 주소 업데이트
      db.update(addresses)
        .set({
          address: validatedData.destination.address,
          detailedAddress: validatedData.destination.detailedAddress,
          latitude: validatedData.destination.latitude,
          longitude: validatedData.destination.longitude,
          contactName: validatedData.destination.name,
          contactCompany: validatedData.destination.company,
          contactPhone: validatedData.destination.contact,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingOrder.deliveryAddressId)),
    ]);

    // 5. 화물 정보 업데이트
    const updatedOrder = await db
      .update(orders)
      .set({
        // 화물 정보
        cargoName: validatedData.cargoType,
        vehicleType: validatedData.vehicleType,
        memo: validatedData.remark,

        // 주소 스냅샷 업데이트
        pickupSnapshot: {
          address: validatedData.departure.address,
          detailedAddress: validatedData.departure.detailedAddress,
          contactName: validatedData.departure.name,
          contactCompany: validatedData.departure.company,
          contactPhone: validatedData.departure.contact,
          latitude: validatedData.departure.latitude,
          longitude: validatedData.departure.longitude,
        },
        deliverySnapshot: {
          address: validatedData.destination.address,
          detailedAddress: validatedData.destination.detailedAddress,
          contactName: validatedData.destination.name,
          contactCompany: validatedData.destination.company,
          contactPhone: validatedData.destination.contact,
          latitude: validatedData.destination.latitude,
          longitude: validatedData.destination.longitude,
        },

        // 일정 정보
        pickupDate: new Date(validatedData.departure.date),
        deliveryDate: new Date(validatedData.destination.date),

        // 가격 정보 (수정 가능한 경우에만)
        ...(existingOrder.flowStatus === "등록" && {
          priceAmount: validatedData.estimatedAmount || existingOrder.priceAmount,
        }),

        // 수정 정보
        updatedBy: session.user.id,
        updatedAt: new Date(),
        updatedBySnapshot: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone,
        },
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 화물 상태를 '취소'로 변경
    const updatedOrder = await db
      .update(orders)
      .set({
        flowStatus: "취소",
        updatedBy: session.user.id,
        updatedAt: new Date(),
        updatedBySnapshot: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone,
        },
      })
      .where(
        and(
          eq(orders.id, params.id),
          eq(orders.companyId, session.user.companyId),
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