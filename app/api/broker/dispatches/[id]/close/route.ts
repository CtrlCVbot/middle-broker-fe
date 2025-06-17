import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderDispatches } from '@/db/schema/orderDispatches';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

/**
 * 디스패치 마감 처리 API
 * PATCH /api/broker/dispatches/[id]/close
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '인증되지 않은 요청입니다.' },
    //     { status: 401 }
    //   );
    // }

    const id = (await params).id;

    const dispatchId = id;
    const userId = request.headers.get('x-user-id') || '';

    // 디스패치 정보 조회
    const dispatch = await db.query.orderDispatches.findFirst({
      where: eq(orderDispatches.id, dispatchId)
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: '해당 디스패치 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 마감된 경우
    if (dispatch.isClosed) {
      return NextResponse.json(
        { data: dispatch, message: '이미 마감된 디스패치입니다.' },
        { status: 200 }
      );
    }

    // 디스패치 마감 처리 (isClosed = true)
    const updatedDispatch = await db
      .update(orderDispatches)
      .set({
        isClosed: true,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(orderDispatches.id, dispatchId))
      .returning();

    if (!updatedDispatch || updatedDispatch.length === 0) {
      return NextResponse.json(
        { error: '디스패치 마감 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: updatedDispatch[0],
        message: '디스패치가 성공적으로 마감 처리되었습니다.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('디스패치 마감 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '디스패치 마감 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 