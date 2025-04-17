import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import bcrypt from 'bcryptjs';
import { IUser } from '@/types/user';

export async function POST(req: Request) {
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
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

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

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // 로그인 실패 로그 기록 (옵션)
      // await db.insert(userLoginLogs).values({
      //   user_id: user.id,
      //   success: false,
      //   fail_reason: 'INVALID_CREDENTIALS',
      //   ip_address: req.headers.get('x-forwarded-for') || '',
      //   user_agent: req.headers.get('user-agent') || ''
      // });

      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 로그인 성공 로그 기록 (옵션)
    // await db.insert(userLoginLogs).values({
    //   user_id: user.id,
    //   success: true,
    //   ip_address: req.headers.get('x-forwarded-for') || '',
    //   user_agent: req.headers.get('user-agent') || ''
    // });

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

    // 성공 응답 반환 (토큰은 mock 문자열로 대체)
    return NextResponse.json({
      success: true,
      token: 'mock-access-token-' + Date.now(),
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