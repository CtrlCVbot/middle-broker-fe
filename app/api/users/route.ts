import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUserFilter, SystemAccessLevel, UserStatus, UserDomain, USER_DOMAINS, IUser } from '@/types/user';
import { z } from 'zod';
import { hash } from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

// 사용자 생성 요청 스키마
const CreateUserSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phone_number: z.string().min(10, '올바른 전화번호 형식이 아닙니다.'),
  company_id: z.string().uuid().optional(),
  system_access_level: z.enum(['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest']),
  domains: z.array(z.enum(USER_DOMAINS)),
  department: z.string().optional(),
  position: z.string().optional(),
  rank: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: '인증되지 않은 사용자입니다.' }),
        { status: 401 }
      );
    }

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

    const { password, ...userData } = validationResult.data;

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
    const hashedPassword = await hash(password, 10);

    // 트랜잭션으로 사용자 생성 및 이력 기록
    const newUser = await db.transaction(async (tx) => {
      // 사용자 생성
      const [createdUser] = await tx
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
          status: 'active' as const,
          created_by: session.user.id,
          updated_by: session.user.id,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      // 변경 이력 기록
      await logUserChange({
        user_id: createdUser.id,
        changed_by: session.user.id,
        changed_by_name: session.user.name || '',
        changed_by_email: session.user.email || '',
        changed_by_access_level: session.user.system_access_level,
        change_type: 'create',
        newData: createdUser as unknown as IUser,
        reason: '신규 사용자 생성'
      });

      return createdUser;
    });

    // 비밀번호 필드 제외하고 응답
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 