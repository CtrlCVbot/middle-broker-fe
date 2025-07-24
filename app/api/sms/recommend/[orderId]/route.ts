import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderParticipants } from '@/db/schema/smsMessages';
import { ISmsRecommendedRecipient } from '@/types/sms';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 주문별 참여자 정보 조회
    const participants = await db
      .select({
        name: orderParticipants.name,
        phone: orderParticipants.phone,
        roleType: orderParticipants.roleType,
      })
      .from(orderParticipants)
      .where(eq(orderParticipants.orderId, orderId));

    // 추천 수신자 형식으로 변환
    const recommendedRecipients: ISmsRecommendedRecipient[] = participants.map(
      (participant) => ({
        name: participant.name,
        phone: participant.phone,
        roleType: participant.roleType,
      })
    );

    // 기본 추천 수신자가 없는 경우 모의 데이터 제공
    if (recommendedRecipients.length === 0) {
      const mockRecipients: ISmsRecommendedRecipient[] = [
        {
          name: '김요청',
          phone: '010-1111-2222',
          roleType: 'requester',
        },
        {
          name: '홍기사',
          phone: '010-3333-4444',
          roleType: 'driver',
        },
        {
          name: '이상차',
          phone: '010-5555-6666',
          roleType: 'load',
        },
        {
          name: '박하차',
          phone: '010-7777-8888',
          roleType: 'unload',
        },
      ];

      return NextResponse.json(mockRecipients);
    }

    return NextResponse.json(recommendedRecipients);
  } catch (error) {
    console.error('SMS recommend error:', error);
    return NextResponse.json(
      { error: '추천 수신자 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 