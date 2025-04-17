import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { userTokens } from '@/db/schema/user-tokens';
import { verifyRefreshToken, getRefreshTokenFromCookies } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = await getRefreshTokenFromCookies();
    
    // 리프레시 토큰이 있는 경우 DB에서 취소 처리
    if (refreshToken) {
      try {
        // 토큰 검증 및 정보 추출
        const payload = await verifyRefreshToken(refreshToken);
        
        if (payload && payload.tokenId) {
          // 데이터베이스에서 토큰 취소 상태로 변경
          await db.update(userTokens)
            .set({ isRevoked: true })
            .where(eq(userTokens.id, payload.tokenId));
        }
      } catch (error) {
        console.error('Refresh token validation error during logout:', error);
        // 오류가 발생해도 로그아웃은 계속 진행
      }
    }

    // 액세스 토큰 쿠키 만료 처리
    cookieStore.set({
      name: 'access_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // 즉시 만료
    });
    
    // 리프레시 토큰 쿠키 만료 처리
    cookieStore.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // 즉시 만료
    });

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET 요청도 지원 (URL을 통한 로그아웃)
export async function GET(req: NextRequest) {
  return POST(req);
} 