import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { driverNotes, drivers } from '@/db/schema/drivers';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { logDriverChange } from '@/utils/driver-change-logger';

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 특이사항 수정 요청 스키마
const UpdateNoteSchema = z.object({
  content: z.string().min(1, '특이사항 내용을 입력해주세요.').max(500, '특이사항은 최대 500자까지 입력 가능합니다.')
});

// 특이사항 상세 조회 API (GET /api/drivers/notes/[noteId])
export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params;

    // UUID 형식 검증
    if (!isValidUUID(noteId)) {
      return NextResponse.json(
        { error: '잘못된 특이사항 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 특이사항 조회
    const [note] = await db
      .select()
      .from(driverNotes)
      .where(eq(driverNotes.id, noteId))
      .limit(1)
      .execute();

    if (!note) {
      return NextResponse.json(
        { error: '특이사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 응답 데이터 변환
    const responseData = {
      id: note.id,
      driverId: note.driverId,
      content: note.content,
      date: note.date?.toISOString() || '',
      createdAt: note.createdAt?.toISOString() || '',
      updatedAt: note.updatedAt?.toISOString() || ''
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('특이사항 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 특이사항 수정 API (PUT /api/drivers/notes/[noteId])
export async function PUT(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params;

    // UUID 형식 검증
    if (!isValidUUID(noteId)) {
      return NextResponse.json(
        { error: '잘못된 특이사항 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = UpdateNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 사용자 ID가 UUID 형식인지 확인
    if (!isValidUUID(requestUserId)) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 존재 여부 확인
    const [existingNote] = await db
      .select()
      .from(driverNotes)
      .where(eq(driverNotes.id, noteId))
      .limit(1)
      .execute();

    if (!existingNote) {
      return NextResponse.json(
        { error: '특이사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 수정
    const [updatedNote] = await db
      .update(driverNotes)
      .set({
        content,
        date: new Date(), // 수정 시 날짜도 업데이트
        updatedBy: requestUserId,
        updatedAt: new Date()
      })
      .where(eq(driverNotes.id, noteId))
      .returning();

    // 차주 변경 이력 기록
    await logDriverChange({
      driverId: updatedNote.driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level || 'user',
      changeType: 'note_update',
      oldData: {
        id: existingNote.id,
        content: existingNote.content,
        date: existingNote.date?.toISOString()
      },
      newData: {
        id: updatedNote.id,
        content: updatedNote.content,
        date: updatedNote.date?.toISOString()
      },
      reason: '차주 특이사항 수정'
    });

    // 응답 데이터 변환
    const responseData = {
      id: updatedNote.id,
      driverId: updatedNote.driverId,
      content: updatedNote.content,
      date: updatedNote.date?.toISOString() || '',
      createdAt: updatedNote.createdAt?.toISOString() || '',
      updatedAt: updatedNote.updatedAt?.toISOString() || ''
    };

    return NextResponse.json({
      message: '특이사항이 성공적으로 수정되었습니다.',
      data: responseData
    });
  } catch (error) {
    console.error('특이사항 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 특이사항 삭제 API (DELETE /api/drivers/notes/[noteId])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params;

    // UUID 형식 검증
    if (!isValidUUID(noteId)) {
      return NextResponse.json(
        { error: '잘못된 특이사항 ID 형식입니다.' },
        { status: 400 }
      );
    }

    const requestUserId = request.headers.get('x-user-id') || '';

    // 사용자 ID가 UUID 형식인지 확인
    if (!isValidUUID(requestUserId)) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 요청 사용자 정보 조회
    const [requestUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestUserId))
      .limit(1)
      .execute();

    if (!requestUser) {
      return NextResponse.json(
        { error: '요청 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 존재 여부 확인
    const [existingNote] = await db
      .select()
      .from(driverNotes)
      .where(eq(driverNotes.id, noteId))
      .limit(1)
      .execute();

    if (!existingNote) {
      return NextResponse.json(
        { error: '특이사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 삭제
    await db
      .delete(driverNotes)
      .where(eq(driverNotes.id, noteId))
      .execute();

    // 차주 변경 이력 기록
    await logDriverChange({
      driverId: existingNote.driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level || 'user',
      changeType: 'note_delete',
      oldData: {
        id: existingNote.id,
        content: existingNote.content,
        date: existingNote.date?.toISOString()
      },
      newData: null,
      reason: '차주 특이사항 삭제'
    });

    return NextResponse.json({
      message: '특이사항이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('특이사항 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 