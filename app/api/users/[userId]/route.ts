import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUser } from '@/types/user';

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