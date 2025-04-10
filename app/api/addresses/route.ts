import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { desc, eq, ilike, and, or, sql } from 'drizzle-orm';
import { IAddressSearchParams } from '@/types/address';

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
    const body = await req.json();

    // 필수 필드 검증
    if (!body.name || !body.roadAddress || !body.jibunAddress || !body.type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 주소 생성
    const [newAddress] = await db
      .insert(addresses)
      .values({
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('주소 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



