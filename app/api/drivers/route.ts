import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ilike, or, sql, desc } from 'drizzle-orm';
import { db } from '@/db';
import { drivers, drivercompanyTypeEnum } from '@/db/schema/drivers';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { vehicleTypeEnum, vehicleWeightEnum } from '@/db/schema/orders';
import { logDriverChange } from '@/utils/driver-change-logger';

// 차주 목록 조회 API (GET /api/drivers)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;

    // 필터 파라미터
    const searchTerm = searchParams.get('searchTerm') || '';
    const vehicleType = searchParams.get('vehicleType') || '';
    const vehicleWeight = searchParams.get('vehicleWeight') || '';
    const isActive = searchParams.get('isActive') === 'true';
    const companyType = searchParams.get('companyType') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 검색 조건 구성
    let conditions = [];

    if (searchTerm) {
      conditions.push(
        or(
          ilike(drivers.name, `%${searchTerm}%`),
          ilike(drivers.phoneNumber, `%${searchTerm}%`),
          ilike(drivers.vehicleNumber, `%${searchTerm}%`),
          ilike(drivers.businessNumber, `%${searchTerm}%`)
        )
      );
    }

    if (vehicleType) {
      conditions.push(eq(drivers.vehicleType, vehicleType as any));
    }

    if (vehicleWeight) {
      conditions.push(eq(drivers.vehicleWeight, vehicleWeight as any));
    }

    if (searchParams.has('isActive')) {
      conditions.push(eq(drivers.isActive, isActive));
    }

    if (companyType) {
      conditions.push(eq(drivers.companyType, companyType as any));
    }

    if (startDate) {
      conditions.push(sql`${drivers.createdAt} >= ${new Date(startDate)}`);
    }

    if (endDate) {
      conditions.push(sql`${drivers.createdAt} <= ${new Date(endDate)}`);
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, total] = await Promise.all([
      db
        .select()
        .from(drivers)
        .where(query)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(drivers.updatedAt))
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(drivers)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);

    // 응답 데이터 변환
    const formattedResult = result.map(driver => ({
      id: driver.id,
      name: driver.name,
      phoneNumber: driver.phoneNumber,
      vehicleNumber: driver.vehicleNumber,
      vehicleType: driver.vehicleType,
      vehicleWeight: driver.vehicleWeight,
      address: driver.addressSnapshot,
      companyType: driver.companyType,
      companyId: driver.companyId,
      businessNumber: driver.businessNumber,
      manufactureYear: driver.manufactureYear || '',
      isActive: driver.isActive,
      inactiveReason: driver.inactiveReason || '',
      lastDispatchedAt: driver.lastDispatchedAt?.toISOString() || null,
      createdAt: driver.createdAt?.toISOString() || '',
      updatedAt: driver.updatedAt?.toISOString() || '',
      bankCode: driver.bankCode,
      bankAccountNumber: driver.bankAccountNumber,
      bankAccountHolder: driver.bankAccountHolder
    }));

    return NextResponse.json({
      data: formattedResult,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('차주 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 차주 생성 요청 스키마
const CreateDriverSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phoneNumber: z.string().min(10, '올바른 전화번호 형식이 아닙니다.'),
  vehicleNumber: z.string().min(4, '올바른 차량번호 형식이 아닙니다.'),
  vehicleType: z.enum(['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러']),
  vehicleWeight: z.enum(['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '8톤', '11톤', '18톤', '25톤']),
  address: z.object({
    roadAddress: z.string(),
    jibunAddress: z.string().optional(),
    postalCode: z.string(),
    detailAddress: z.string().optional(),
    sido: z.string(),
    sigungu: z.string(),
    bname: z.string(),
    roadname: z.string(),
    lng: z.number().optional(),
    lat: z.number().optional()
  }),
  companyType: z.enum(['개인', '소속']).default('개인'),
  companyId: z.string().uuid().optional(),
  businessNumber: z.string().min(10, '올바른 사업자번호 형식이 아닙니다.'),
  manufactureYear: z.string().optional(),
  isActive: z.boolean().default(true),
  inactiveReason: z.string().optional(),
  // 은행 정보 필드 추가
  bankCode: z.string().optional().nullable(),
  bankAccountNumber: z.string().min(10, '올바른 계좌번호 형식이 아닙니다.').max(20, '올바른 계좌번호 형식이 아닙니다.').optional().nullable(),
  bankAccountHolder: z.string().optional().nullable()
});

// 차주 등록 API (POST /api/drivers)
export async function POST(request: NextRequest) {
  try {
    console.log('차주 등록 API 호출됨');
    
    const requestBody = await request.text();
    console.log('요청 원본 데이터:', requestBody);
    
    let body;
    try {
      body = JSON.parse(requestBody);
      console.log('파싱된 요청 데이터:', body);
    } catch (parseError) {
      console.error('요청 본문 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '유효하지 않은 JSON 데이터입니다.' },
        { status: 400 }
      );
    }

    // 요청 데이터 검증
    console.log('데이터 유효성 검증 시작...');
    const validationResult = CreateDriverSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('유효성 검증 실패:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    console.log('데이터 유효성 검증 성공');

    const driverData = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';
    console.log('요청 사용자 ID:', requestUserId);

    // 사용자 ID가 UUID 형식인지 확인
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestUserId);
    
    if (!isValidUUID) {
      console.error('유효하지 않은 UUID 형식의 사용자 ID:', requestUserId);
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 사용자 정보 조회
    console.log('사용자 정보 조회 시작...');
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      console.error('요청 사용자를 찾을 수 없음:', requestUserId);
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    console.log('조회된 사용자 정보:', { id: requestUser.id, name: requestUser.name, email: requestUser.email });

    // 차량번호 중복 검사
    console.log('차량번호 중복 검사 시작...', driverData.vehicleNumber);
    const [existingDriver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.vehicleNumber, driverData.vehicleNumber))
      .limit(1)
      .execute();

    if (existingDriver) {
      console.error('중복된 차량번호 발견:', driverData.vehicleNumber);
      return NextResponse.json(
        { error: '이미 등록된 차량번호입니다.' },
        { status: 400 }
      );
    }
    console.log('차량번호 중복 검사 통과');

    // 사용자 스냅샷 생성
    const userSnapshot = {
      ...requestUser
    };
    console.log('사용자 스냅샷 생성 완료');

    // 차주 등록
    console.log('차주 DB 등록 시작...');
    console.log('등록할 차주 데이터:', {
      name: driverData.name,
      phoneNumber: driverData.phoneNumber,
      vehicleNumber: driverData.vehicleNumber,
      vehicleType: driverData.vehicleType,
      vehicleWeight: driverData.vehicleWeight,
      companyType: driverData.companyType,
      businessNumber: driverData.businessNumber
    });
    
    try {
      const [createdDriver] = await db
        .insert(drivers)
        .values({
          name: driverData.name,
          phoneNumber: driverData.phoneNumber,
          vehicleNumber: driverData.vehicleNumber,
          vehicleType: driverData.vehicleType,
          vehicleWeight: driverData.vehicleWeight,
          addressSnapshot: driverData.address,
          companyType: driverData.companyType,
          companyId: driverData.companyId,
          businessNumber: driverData.businessNumber,
          manufactureYear: driverData.manufactureYear,
          isActive: driverData.isActive,
          inactiveReason: driverData.inactiveReason,
          createdBy: requestUser.id,
          createdBySnapshot: userSnapshot,
          updatedBy: requestUser.id,
          updatedBySnapshot: userSnapshot,
          // 은행 정보 추가
          bankCode: driverData.bankCode,
          bankAccountNumber: driverData.bankAccountNumber,
          bankAccountHolder: driverData.bankAccountHolder
        }as any)
        .returning();
      
      console.log('차주 DB 등록 성공:', createdDriver);

      // 변경 이력 기록
      console.log('차주 변경 이력 기록 시작...');
      await logDriverChange({
        driverId: createdDriver.id,
        changedBy: requestUser.id,
        changedByName: requestUser.name || '',
        changedByEmail: requestUser.email || '',
        changedByAccessLevel: requestUser.system_access_level || 'user',
        changeType: 'create',
        oldData: null,
        newData: {
          ...createdDriver,
          createdAt: createdDriver.createdAt?.toISOString(),
          updatedAt: createdDriver.updatedAt?.toISOString()
        },
        reason: '차주 등록'
      });
      console.log('차주 변경 이력 기록 완료');

      console.log('차주 등록 API 완료 - 응답 데이터:', createdDriver);
      return NextResponse.json({
        message: '차주가 성공적으로 등록되었습니다.',
        data: createdDriver
      });
    } catch (dbError) {
      console.error('차주 DB 등록 오류:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('차주 등록 중 오류 발생:', error);
    console.error('오류 세부 정보:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 