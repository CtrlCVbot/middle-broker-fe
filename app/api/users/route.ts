import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUserFilter, SystemAccessLevel, UserStatus, UserDomain, USER_DOMAINS, IUser, SYSTEM_ACCESS_LEVELS } from '@/types/user';
import { z } from 'zod';
import { hash } from 'bcrypt';
import { logUserChange } from '@/utils/user-change-logger';

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

    // 비밀번호 필드 제외 - 나중에 추후개발에 추가
    //const usersWithoutPassword = result.map(({ password, ...user }) => user);

    return NextResponse.json({
      //data: usersWithoutPassword,
      data: result,
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

// 사용자 생성 요청 스키마
const CreateUserSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  phone_number: z.string(),
  company_id: z.string().uuid(),
  system_access_level: z.enum(SYSTEM_ACCESS_LEVELS),
  domains: z.array(z.enum(USER_DOMAINS)),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  rank: z.string().optional().nullable(),
  //requestUserId: z.string().uuid('잘못된 요청 사용자 ID 형식입니다.')
});

// 필드 값 검증을 위한 Zod 스키마
// const FieldCreateSchema = z.object({
//   fields: z.record(z.string(), z.any()),
//   reason: z.string().optional(),
// });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    

    // 요청 데이터 검증
    const validationResult = CreateUserSchema.safeParse(body);  
    
    if (!validationResult.success) {
      
      return new Response(
        JSON.stringify({
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        }),
        { status: 400 }
      );
    }

    const { ...userData } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 요청 사용자 정보 조회
    const requestUser = await db.query.users.findFirst({
      where: eq(users.id, requestUserId)
    });

    if (!requestUser) {
      return new Response(
        JSON.stringify({ error: '요청 사용자를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }

    // 이메일 중복 검사
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userData.email)
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: '이미 등록된 이메일입니다.' }),
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    //const hashedPassword = await hash(password, 10);

    // 현재 시간
    const now = new Date();

    // 사용자 생성
    const [createdUser] = await db
      .insert(users)
      .values({
        ...userData,
        //password: hashedPassword,
        status: 'active' as const,
        created_by: requestUserId,
        updated_by: requestUserId,
        created_at: now,
        updated_at: now
      })
      .returning();

    // 변경 이력 기록
    await logUserChange({
      userId: createdUser.id,
      changedBy: requestUserId,
      changedByName: requestUser.name,
      changedByEmail: requestUser.email,
      changedByAccessLevel: requestUser.system_access_level,
      changeType: 'create',
      newData: createdUser as unknown as IUser,
      reason: '신규 사용자 생성'
    });

    // 비밀번호 필드 제외하고 응답
    const { password: _, ...userWithoutPassword } = createdUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 