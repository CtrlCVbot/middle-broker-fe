import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { addresses } from "@/db/schema/addresses";
import { auth } from "@/utils/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

// 화물 등록 요청 데이터 검증 스키마
const orderRegisterSchema = z.object({
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

// GET: 화물 목록 조회
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ordersList = await db.query.orders.findMany({
      where: eq(orders.companyId, session.user.companyId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return NextResponse.json(ordersList);
  } catch (error) {
    console.error("화물 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "화물 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 화물 등록
export async function POST(request: Request) {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validatedData = orderRegisterSchema.parse(body);

    // 3. 주소 정보 저장
    const [pickupAddress, deliveryAddress] = await Promise.all([
      // 출발지 주소 저장
      db.insert(addresses).values({
        address: validatedData.departure.address,
        detailedAddress: validatedData.departure.detailedAddress,
        latitude: validatedData.departure.latitude,
        longitude: validatedData.departure.longitude,
        contactName: validatedData.departure.name,
        contactCompany: validatedData.departure.company,
        contactPhone: validatedData.departure.contact,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      }).returning(),

      // 도착지 주소 저장
      db.insert(addresses).values({
        address: validatedData.destination.address,
        detailedAddress: validatedData.destination.detailedAddress,
        latitude: validatedData.destination.latitude,
        longitude: validatedData.destination.longitude,
        contactName: validatedData.destination.name,
        contactCompany: validatedData.destination.company,
        contactPhone: validatedData.destination.contact,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      }).returning(),
    ]);

    // 4. 화물 정보 저장
    const newOrder = await db.insert(orders).values({
      // 화주 정보
      companyId: session.user.companyId,
      orderContactId: session.user.id,
      orderContactSnapshot: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
      },

      // 화물 정보
      cargoName: validatedData.cargoType,
      vehicleType: validatedData.vehicleType,
      vehicleCount: 1,
      memo: validatedData.remark,

      // 주소 정보
      pickupAddressId: pickupAddress[0].id,
      deliveryAddressId: deliveryAddress[0].id,
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

      // 가격 정보
      priceAmount: validatedData.estimatedAmount || 0,
      priceType: "정액제",
      taxType: "부가세별도",

      // 생성/수정 정보
      createdBy: session.user.id,
      updatedBy: session.user.id,
      createdBySnapshot: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
      },
      updatedBySnapshot: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
      },
    }).returning();

    return NextResponse.json(newOrder[0]);
  } catch (error) {
    console.error("화물 등록 중 오류 발생:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력 데이터가 유효하지 않습니다.", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "화물 등록에 실패했습니다." },
      { status: 500 }
    );
  }
} 