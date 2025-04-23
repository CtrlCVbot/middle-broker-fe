import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { desc, eq, ilike, and, or, sql } from 'drizzle-orm';
import { IAddressSearchParams, AddressType, IAddress } from '@/types/address';
import { logAddressChange } from '@/utils/address-change-logger';

// 주소 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          ilike(addresses.name, `%${search}%`),
          ilike(addresses.roadAddress, `%${search}%`),
          ilike(addresses.jibunAddress, `%${search}%`),
          ilike(addresses.contactName, `%${search}%`)
        ),
        and(
          eq(addresses.isFrequent, true)
        )
      );
    }
    if (type) {
      whereConditions.push(eq(addresses.type, type));
    }

    // 전체 개수 조회
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(addresses)
      .where(and(...whereConditions))
      .execute();

    // 데이터 조회
    const items = await db.query.addresses.findMany({
      where: and(...whereConditions),
      orderBy: [desc(addresses.updatedAt)],
      offset,
      limit,
    });

    return NextResponse.json({
      data: items,
      pagination: {
        total: totalCount[0].count,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('주소 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새로운 주소 생성
export async function POST(req: NextRequest) {
  try {
    // Content-Type 헤더 확인
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // 필수 필드 검증
    if (!body.name || !body.roadAddress || !body.jibunAddress || !body.type) {
      return NextResponse.json(
        { 
          error: 'Required fields missing',
          required: ['name', 'roadAddress', 'jibunAddress', 'type']
        },
        { status: 400 }
      );
    }

    // type 필드 검증
    if (!['load', 'drop', 'any'].includes(body.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid type value',
          allowedValues: ['load', 'drop', 'any']
        },
        { status: 400 }
      );
    }

    // metadata가 있는 경우 유효한 JSON인지 확인
    if (body.metadata && typeof body.metadata === 'string') {
      try {
        body.metadata = JSON.parse(body.metadata);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid metadata JSON format' },
          { status: 400 }
        );
      }
    }

    // 주소 생성
    const [newAddress] = await db.insert(addresses).values({
      name: body.name,
      type: body.type as AddressType,
      roadAddress: body.roadAddress,
      jibunAddress: body.jibunAddress,
      detailAddress: body.detailAddress || null,
      postalCode: body.postalCode || null,
      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      memo: body.memo || null,
      isFrequent: body.isFrequent ?? false,
      metadata: body.metadata || {},
    }).returning();

    // 변경 이력 기록
    await logAddressChange({
      addressId: newAddress.id,
      changedBy: req.headers.get('x-user-id') || 'system',
      changedByName: req.headers.get('x-user-name') || 'system',
      changedByEmail: req.headers.get('x-user-email') || 'system',
      changedByAccessLevel: req.headers.get('x-user-access-level') || 'system',
      changeType: 'create',
      newData: { 
        ...newAddress, 
        type: newAddress.type as AddressType,
        metadata: newAddress.metadata as IAddress['metadata']
      },
      reason: '신규 주소 등록'
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('주소 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



