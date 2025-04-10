import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { eq } from 'drizzle-orm';

// 개별 주소 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, params.id),
    });

    if (!address) {
      return NextResponse.json({ error: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('주소 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주소 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // 필수 필드 검증
    if (!body.name || !body.roadAddress || !body.jibunAddress || !body.type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const [updatedAddress] = await db
      .update(addresses)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, params.id))
      .returning();

    if (!updatedAddress) {
      return NextResponse.json({ error: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('주소 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주소 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedAddress] = await db
      .delete(addresses)
      .where(eq(addresses.id, params.id))
      .returning();

    if (!deletedAddress) {
      return NextResponse.json({ error: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '주소가 삭제되었습니다.' });
  } catch (error) {
    console.error('주소 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 