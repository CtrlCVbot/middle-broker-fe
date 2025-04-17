import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUser } from '@/types/user';
import { signAccessToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = await req.json();
    console.log("login route : " + email + " / " + password);

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', message: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일로 사용자 조회
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    console.log("login route2 : " + user?.id);

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '존재하지 않는 사용자입니다.' },
        { status: 401 }
      );
    }

    // 계정 상태 확인
    if (user.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'ACCOUNT_LOCKED', 
          message: '계정이 잠겨 있거나 비활성화되었습니다. 관리자에게 문의하세요.' 
        },
        { status: 423 }
      );
    }

    // 비밀번호 검증 (단순 문자열 비교)
    console.log('비밀번호 검증:', password === user.password ? '일치' : '불일치');
    
    if (password !== user.password) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 사용자 정보 변환 (스네이크 케이스 -> 카멜 케이스)
    const userData: IUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phone_number,
      companyId: user.company_id,
      systemAccessLevel: user.system_access_level,
      domains: user.domains as any,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    // JWT 토큰 생성
    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email
    });

    // 쿠키에 JWT 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15분 (초 단위)
    });

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      token: accessToken, // 클라이언트에도 토큰 전달 (스토어에 저장용)
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 