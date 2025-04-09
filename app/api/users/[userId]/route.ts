import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUser } from '@/types/user';

// UUID 형식 검증을 위한 정규식
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    // userId 파라미터 검증
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 조회
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    const user = result[0];

    // 사용자가 없는 경우
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 필드 제외하고 응답
    const { password, ...userWithoutPassword } = user;

    // 성공 응답
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('사용자 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();

    // UUID 형식 검증
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이메일 중복 확인 (이메일이 변경된 경우에만)
    if (body.email && body.email !== existingUser[0].email) {
      const emailExists = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .execute();

      if (emailExists.length > 0) {
        return NextResponse.json(
          { error: '이미 존재하는 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    // 수정할 데이터 준비
    const updateData = {
      ...body,
      updated_at: new Date(),
      // TODO: 실제 구현 시 인증된 사용자 ID로 대체
      updated_by: 'system'
    };

    // 비밀번호가 없는 경우 제외
    if (!updateData.password) {
      delete updateData.password;
    }

    // 사용자 정보 수정
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()
      .execute();

    // 비밀번호 필드 제외하고 응답
    const { password, ...userWithoutPassword } = result[0];

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('사용자 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // UUID 형식 검증
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 삭제
    await db
      .delete(users)
      .where(eq(users.id, userId))
      .execute();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('사용자 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 