import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { IUser } from '@/types/user';

// swagger 문서 작성
/**
 * @swagger 
 * /api/users/{userId}:
 *   get:
 *     summary: 사용자 조회
 *     description: 특정 사용자의 정보를 조회합니다.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 사용자 정보
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *       400:
 *         description: 잘못된 사용자 ID 형식
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 * 
 */

// UUID 형식 검증을 위한 정규식
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    // userId 파라미터 검증
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: '잘못된 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 조회
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    const user = result[0];

    // 사용자가 없는 경우
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 필드 제외하고 응답
    const { password, ...userWithoutPassword } = user;

    // 성공 응답
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('사용자 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 