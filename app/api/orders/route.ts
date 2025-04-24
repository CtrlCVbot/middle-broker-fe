import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq } from "drizzle-orm";
import { decodeBase64String } from "@/utils/format";



// GET: 화물 목록 조회
export async function GET(request: Request) {
  try {
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    const companyId = request.headers.get('x-user-company-id');
    if(!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 401 });
    }

    const ordersList = await db.query.orders.findMany({
      where: eq(orders.companyId, companyId),
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
export async function POST(request: NextRequest) {
  try {

    // Content-Type 헤더 확인
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');
    if(!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }
    const encodedName = decodeBase64String(request.headers.get('x-user-name') || '');
    const userEmail = request.headers.get('x-user-email') || '';
    const userPhone = request.headers.get('x-user-phone') || '';
    
    const userCompanyId = request.headers.get('x-user-company-id');
    if(!userCompanyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 401 });
    }

    // 2. 요청 데이터 파싱 및 검증
    const body = await request.json();
    

    // 3. 화물 정보 저장
    const [newOrder] = await db
    .insert(orders)
    .values({      
      // 화물 주문자 정보
      companyId: userCompanyId,
      orderContactId: userId,
      orderContactSnapshot: {
        name: encodedName,
        email: userEmail,
        mobile: userPhone,
      },
      //상태
      flowStatus: body.flowStatus,

      // 화물 정보
      cargoName: body.cargoName,
      cargoWeight: body.cargoWeight,
      cargoUnit: body.cargoUnit,
      cargoQuantity: body.cargoQuantity,
      packagingType: body.packagingType,

      // 차량 정보
      vehicleType: body.vehicleType,
      vehicleCount: body.vehicleCount,

      // 가격 정보
      priceAmount: body.priceAmount,
      priceType: body.priceType,
      taxType: body.taxType,

      // 주소 정보
      pickupAddressId: body.pickupAddressId,
      deliveryAddressId: body.deliveryAddressId,
      pickupSnapshot: body.pickupSnapshot,
      deliverySnapshot: body.deliverySnapshot,

      // 일정 정보
      pickupDate: body.pickupDate,
      deliveryDate: body.deliveryDate,

      // 생성/수정 정보
      createdBy: userId,
      createdBySnapshot: {
        name: encodedName,
        email: userEmail,
        mobile: userPhone,
      },
      updatedBy: userId,
      updatedBySnapshot: {
        name: encodedName,
        email: userEmail,
        mobile: userPhone,
      },
    }).returning();

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("화물 등록 중 오류 발생:", error);
    
    return NextResponse.json(
      { error: "화물 등록에 실패했습니다." },
      { status: 500 }
    );
  }
} 