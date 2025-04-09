import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUserFilter, SystemAccessLevel, UserStatus } from '@/types/user';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;

    // 필터 파라미터
    const searchTerm = searchParams.get('searchTerm') || '';
    const status = searchParams.get('status') as UserStatus | '';
    const systemAccessLevel = searchParams.get('systemAccessLevel') as SystemAccessLevel | '';
    const domains = searchParams.get('domains')?.split(',') || [];
    const companyId = searchParams.get('companyId');

    // 검색 조건 구성
    let conditions = [];

    if (searchTerm) {
      conditions.push(
        or(
          ilike(users.name, `%${searchTerm}%`),
          ilike(users.email, `%${searchTerm}%`),
          ilike(users.phone_number, `%${searchTerm}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(users.status, status));
    }

    if (systemAccessLevel) {
      conditions.push(eq(users.system_access_level, systemAccessLevel));
    }

    if (companyId) {
      conditions.push(eq(users.company_id, companyId));
    }

    // 데이터베이스 쿼리
    const query = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, total] = await Promise.all([
      db
        .select()
        .from(users)
        .where(query)
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(query)
        .execute()
        .then(res => Number(res[0].count))
    ]);

    // 비밀번호 필드 제외
    const usersWithoutPassword = result.map(({ password, ...user }) => user);

    return NextResponse.json({
      data: usersWithoutPassword,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('사용자 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = ['email', 'password', 'name', 'phone_number', 'system_access_level', 'domains'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `다음 필드가 필요합니다: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .execute();

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 이메일입니다.' },
        { status: 400 }
      );
    }

    // 사용자 생성
    const newUser = {
      ...body,
      status: 'active' as const,
      created_at: new Date(),
      updated_at: new Date(),
      // TODO: 실제 구현 시 인증된 사용자 ID로 대체
      created_by: 'system',
      updated_by: 'system'
    };

    const result = await db
      .insert(users)
      .values(newUser)
      .returning()
      .execute();

    // 비밀번호 필드 제외하고 응답
    const { password, ...userWithoutPassword } = result[0];

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 