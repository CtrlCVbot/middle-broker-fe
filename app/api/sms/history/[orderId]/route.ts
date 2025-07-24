import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { smsMessages, smsRecipients } from '@/db/schema/smsMessages';
import { ISmsHistoryItem, SmsDeliveryStatus, SmsRequestStatus } from '@/types/sms';
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

    // 주문별 문자 발송 이력 조회
    const messages = await db
      .select({
        id: smsMessages.id,
        messageBody: smsMessages.messageBody,
        messageType: smsMessages.messageType,
        requestStatus: smsMessages.requestStatus,
        createdAt: smsMessages.createdAt,
      })
      .from(smsMessages)
      .where(eq(smsMessages.orderId, orderId))
      .orderBy(smsMessages.createdAt);

    // 각 메시지의 수신자 정보 조회
    const historyItems: ISmsHistoryItem[] = [];

    for (const message of messages) {
      const recipients = await db
        .select({
          recipientName: smsRecipients.recipientName,
          recipientPhone: smsRecipients.recipientPhone,
          roleType: smsRecipients.roleType,
          deliveryStatus: smsRecipients.deliveryStatus,
          errorMessage: smsRecipients.errorMessage,
        })
        .from(smsRecipients)
        .where(eq(smsRecipients.smsMessageId, message.id));

      historyItems.push({
        messageId: message.id,
        createdAt: message.createdAt?.toISOString() || '',
        messageType: message.messageType,
        messageBody: message.messageBody,
        requestStatus: message.requestStatus as SmsRequestStatus,
        recipients: recipients.map((recipient) => ({
          name: recipient.recipientName,
          phone: recipient.recipientPhone,
          role: recipient.roleType,
          status: recipient.deliveryStatus as SmsDeliveryStatus,
          errorMessage: recipient.errorMessage || undefined,
        })),
      });
    }

    return NextResponse.json(historyItems);
  } catch (error) {
    console.error('SMS history error:', error);
    return NextResponse.json(
      { error: '문자 이력 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 