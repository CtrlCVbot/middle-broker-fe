/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회
 *     description: 페이지네이션과 필터링을 지원하는 사용자 목록 조회 API
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: 이름, 이메일, 전화번호 검색어
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, locked]
 *         description: 사용자 상태 필터
 *       - in: query
 *         name: systemAccessLevel
 *         schema:
 *           type: string
 *           enum: [admin, manager, user]
 *         description: 시스템 접근 레벨 필터
 *       - in: query
 *         name: domains
 *         schema:
 *           type: string
 *         description: 도메인 필터 (콤마로 구분)
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 회사 ID 필터
 *     responses:
 *       200:
 *         description: 성공적으로 사용자 목록을 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: 전체 사용자 수
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지 번호
 *                 pageSize:
 *                   type: integer
 *                   description: 페이지당 항목 수
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *       500:
 *         description: 서버 오류
 */
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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새로운 사용자 생성
 *     description: 새로운 사용자를 생성하는 API
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - phone_number
 *               - system_access_level
 *               - domains
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               system_access_level:
 *                 type: string
 *                 enum: [admin, manager, user]
 *               domains:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 사용자가 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락 또는 중복된 이메일)
 *       500:
 *         description: 서버 오류
 */
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