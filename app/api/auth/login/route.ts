import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { userTokens } from '@/db/schema/user-tokens';
import { IUser } from '@/types/user';
import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { companies } from '@/db/schema/companies';

// 리프레시 토큰 유효기간 (7일)
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7일 (밀리초)

export async function POST(req: NextRequest) {
  try {
    // 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = await req.json();

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', message: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일로 사용자 조회
    // const user = await db.query.users.findFirst({
    //   where: eq(users.email, email),
    //   with: {
    //     company: true
    //   }
    // });
    const result = await db.select()
    .from(users)
    .leftJoin(companies, eq(users.company_id, companies.id))
    .where(eq(users.email, email))
    .limit(1);
    console.log('user', result);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '존재하지 않는 사용자입니다.' },
        { status: 401 }
      );
    }

    const user = result[0];

    const loginUser = {
      ...result[0].users,
      company: result[0].companies,
    };
    console.log('loginUser', loginUser);

    // 사용자가 존재하지 않는 경우
    if (!result[0]) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '존재하지 않는 사용자입니다.' },
        { status: 401 }
      );
    }

    // 계정 상태 확인
    if (loginUser.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'ACCOUNT_LOCKED', 
          message: '계정이 잠겨 있거나 비활성화되었습니다. 관리자에게 문의하세요.' 
        },
        { status: 423 }
      );
    }

    // 비밀번호 검증 (단순 문자열 비교)
    if (password !== loginUser.password) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 사용자 정보 변환 (스네이크 케이스 -> 카멜 케이스)
    const userData: IUser = {
      id: loginUser.id,
      email: loginUser.email,
      name: loginUser.name,
      phoneNumber: loginUser.phone_number || '',
      companyId: loginUser.company_id || '',
      systemAccessLevel: loginUser.system_access_level,
      domains: loginUser.domains as any,
      status: loginUser.status,
      createdAt: loginUser.created_at,
      updatedAt: loginUser.updated_at,
      companyType: loginUser.company?.type || '',
    };

    // 토큰 ID 생성
    const tokenId = uuidv4();
    
    // 리프레시 토큰 만료일 계산
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);
    
    // JWT 토큰 생성
    const accessToken = await signAccessToken({
      id: loginUser.id,
      email: loginUser.email
    });

    // 리프레시 토큰 생성
    const refreshToken = await signRefreshToken({
      id: loginUser.id,
      email: loginUser.email,
      tokenId: tokenId
    }, '7d');
    
    // 클라이언트 정보 가져오기
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      '127.0.0.1';
    
    // 리프레시 토큰을 데이터베이스에 저장
    await db.insert(userTokens).values({
      id: tokenId,
      userId: loginUser.id,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      userAgent: userAgent,
      ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
    });

    // 쿠키에 JWT 토큰 저장
    const cookieStore = await cookies();
    
    // 액세스 토큰 쿠키 설정
    cookieStore.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일 (초 단위)
    });
    
    // 리프레시 토큰 쿠키 설정 (HTTP 요청에서만 사용 가능)
    cookieStore.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일 (초 단위)
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