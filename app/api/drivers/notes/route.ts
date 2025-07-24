import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { driverNotes, drivers } from '@/db/schema/drivers';
import { users } from '@/db/schema/users';
import { z } from 'zod';
import { logDriverChange } from '@/utils/driver-change-logger';

// 차주 특이사항 조회 API (GET /api/drivers/notes?driverId=xxx)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const driverId = searchParams.get('driverId');
    
    if (!driverId) {
      return NextResponse.json(
        { error: '차주 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // UUID 형식 검증
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(driverId)) {
      return NextResponse.json(
        { error: '잘못된 차주 ID 형식입니다.' },
        { status: 400 }
      );
    }

    // 차주 존재 여부 확인
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1)
      .execute();
      
    if (!driver) {
      return NextResponse.json(
        { error: '차주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 조회
    const notes = await db
      .select()
      .from(driverNotes)
      .where(eq(driverNotes.driverId, driverId))
      .orderBy(desc(driverNotes.date))
      .execute();
      
    // 응답 데이터 변환
    const formattedNotes = notes.map(note => ({
      id: note.id,
      driverId: note.driverId,
      content: note.content,
      date: note.date?.toISOString() || '',
      createdAt: note.createdAt?.toISOString() || '',
      updatedAt: note.updatedAt?.toISOString() || ''
    }));

    return NextResponse.json({
      data: formattedNotes
    });
  } catch (error) {
    console.error('차주 특이사항 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 특이사항 생성 요청 스키마
const CreateNoteSchema = z.object({
  driverId: z.string().uuid('올바른 UUID 형식이 아닙니다.'),
  content: z.string().min(1, '특이사항 내용을 입력해주세요.').max(500, '특이사항은 최대 500자까지 입력 가능합니다.')
});

// 특이사항 추가 API (POST /api/drivers/notes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 요청 데이터 검증
    const validationResult = CreateNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { driverId, content } = validationResult.data;
    const requestUserId = request.headers.get('x-user-id') || '';

    // 사용자 ID가 UUID 형식인지 확인
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestUserId)) {
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

    // 차주 존재 여부 확인
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1)
      .execute();

    if (!driver) {
      return NextResponse.json(
        { error: '차주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 특이사항 추가
    const [createdNote] = await db
      .insert(driverNotes)
      .values({
        driverId,
        content,
        date: new Date(),
        createdBy: requestUserId,
        updatedBy: requestUserId,
      })
      .returning();

    // 차주 변경 이력 기록
    await logDriverChange({
      driverId,
      changedBy: requestUser.id,
      changedByName: requestUser.name || '',
      changedByEmail: requestUser.email || '',
      changedByAccessLevel: requestUser.system_access_level || 'user',
      changeType: 'note_add',
      oldData: null,
      newData: {
        id: createdNote.id,
        driverId: createdNote.driverId,
        content: createdNote.content,
        date: createdNote.date?.toISOString()
      },
      reason: '차주 특이사항 추가'
    });

    // 응답 데이터 변환
    const responseData = {
      id: createdNote.id,
      driverId: createdNote.driverId,
      content: createdNote.content,
      date: createdNote.date?.toISOString() || '',
      createdAt: createdNote.createdAt?.toISOString() || '',
      updatedAt: createdNote.updatedAt?.toISOString() || ''
    };

    return NextResponse.json({
      message: '특이사항이 성공적으로 추가되었습니다.',
      data: responseData
    });
  } catch (error) {
    console.error('특이사항 추가 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 