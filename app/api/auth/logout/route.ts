import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // 액세스 토큰 쿠키 만료 처리
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'access_token',
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