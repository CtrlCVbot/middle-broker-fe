import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { eq } from 'drizzle-orm';
import { logAddressChange } from '@/utils/address-change-logger';
import { AddressType, IAddress } from '@/types/address';
import { decodeBase64String } from '@/utils/format';

// UUID 검증
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 개별 주소 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 주소 ID입니다.' },
        { status: 400 }
      );
    }

    // 주소 조회
    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });

    if (!address) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('주소 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주소 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 주소 ID입니다.' },
        { status: 400 }
      );
    }

    // 기존 주소 조회
    const existingAddress = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();

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

    const requestUserId = request.headers.get('x-user-id');
    const requestUserName = request.headers.get('x-user-name');
    const decodedName = requestUserName ? decodeBase64String(requestUserName) : '';

    // 주소 업데이트
    const [updatedAddress] = await db
      .update(addresses)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, id))
      .returning();

    // 변경 이력 기록
    await logAddressChange({
      addressId: id,
      changedBy: request.headers.get('x-user-id') || 'system',
      changedByName: decodedName || 'system',
      changedByEmail: request.headers.get('x-user-email') || 'system',
      changedByAccessLevel: request.headers.get('x-user-access-level') || 'system',
      changeType: 'update',
      oldData: { 
        ...existingAddress, 
        type: existingAddress.type as AddressType,
        metadata: existingAddress.metadata as IAddress['metadata']
      },
      newData: { 
        ...updatedAddress, 
        type: updatedAddress.type as AddressType,
        metadata: updatedAddress.metadata as IAddress['metadata']
      },
      reason: '주소 정보 수정'
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('주소 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주소 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID 검증
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 주소 ID입니다.' },
        { status: 400 }
      );
    }

    // 기존 주소 조회
    const existingAddress = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주소 삭제
    await db.delete(addresses).where(eq(addresses.id, id));

    // 변경 이력 기록
    await logAddressChange({
      addressId: id,
      changedBy: request.headers.get('x-user-id') || 'system',
      changedByName: request.headers.get('x-user-name') || 'system',
      changedByEmail: request.headers.get('x-user-email') || 'system',
      changedByAccessLevel: request.headers.get('x-user-access-level') || 'system',
      changeType: 'delete',
      oldData: {
        ...existingAddress,
        type: existingAddress.type as AddressType,
        metadata: existingAddress.metadata as IAddress['metadata']
      },
      reason: '주소 삭제'
    });

    return NextResponse.json({ message: '주소가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('주소 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 