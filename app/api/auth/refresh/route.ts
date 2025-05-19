import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { eq, and, gt } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { userTokens } from '@/db/schema/user-tokens';
import { 
  verifyRefreshToken, 
  signAccessToken,
  getRefreshTokenFromCookies 
} from '@/utils/jwt';
import { IUser } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'REFRESH_TOKEN_REQUIRED', message: '리프레시 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    // 리프레시 토큰 검증
    const refreshTokenPayload = await verifyRefreshToken(refreshToken);
    
    if (!refreshTokenPayload || !refreshTokenPayload.tokenId) {
      return NextResponse.json(
        { error: 'INVALID_REFRESH_TOKEN', message: '유효하지 않은 리프레시 토큰입니다.' },
        { status: 401 }
      );
    }

    // 데이터베이스에서 토큰 검증
    const tokenRecord = await db.query.userTokens.findFirst({
      where: and(
        eq(userTokens.id, refreshTokenPayload.tokenId),
        eq(userTokens.refreshToken, refreshToken),
        eq(userTokens.isRevoked, false),
        gt(userTokens.expiresAt, new Date())
      )
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'INVALID_REFRESH_TOKEN', message: '유효하지 않거나 만료된 리프레시 토큰입니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const user = await db.query.users.findFirst({
      where: eq(users.id, tokenRecord.userId)
    });

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없거나 비활성화되었습니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 변환 (스네이크 케이스 -> 카멜 케이스)
    const userData: IUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phone_number || '',
      companyId: user.company_id || '',
      systemAccessLevel: user.system_access_level,
      domains: user.domains as any,
      status: user.status,
      department: user.department || '',
      position: user.position || '',
      rank: user.rank || '',
      createdAt: user.created_at || '',
      updatedAt: user.updated_at || '',
    };

    // 새 액세스 토큰 발급
    const newAccessToken = await signAccessToken({
      id: user.id,
      email: user.email
    });

    // 쿠키에 새 액세스 토큰 설정
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'access_token',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15분
    });

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      token: newAccessToken,
      user: userData
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (클라이언트에서 POST로 요청할 수 있도록)
export async function POST(req: NextRequest) {
  return GET(req);
} 