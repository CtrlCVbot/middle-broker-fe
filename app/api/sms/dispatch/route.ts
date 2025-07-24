import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { smsMessages, smsRecipients } from '@/db/schema/smsMessages';
import { ISmsDispatchRequest, ISmsDispatchResponse, SmsRoleType, SmsDeliveryStatus, SmsRequestStatus } from '@/types/sms';
import { eq } from 'drizzle-orm';

/**
 * 외부 SMS API 호출 (모의 구현)
 */
async function callExternalSmsApi(recipients: any[], messageBody: string) {
  // 실제 구현에서는 Twilio, KT Bizm 등의 외부 API 호출
  const results = recipients.map((recipient) => {
    // 모의 응답 - 실제로는 외부 API 응답을 받아야 함
    const isSuccess = true; //Math.random() > 0.1; // 90% 성공률
    return {
      phone: recipient.phone,
      status: isSuccess ? 'success' : 'failed',
      errorMessage: isSuccess ? undefined : 'Invalid phone number',
      apiMessageId: isSuccess ? `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : undefined,
    };
  });

  return {
    status: 'dispatched',
    results,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ISmsDispatchRequest = await request.json();
    
    // 유효성 검사
    if (!body.orderId || !body.senderId || !body.messageBody || !body.recipients?.length) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    const invalidRecipients = body.recipients.filter(
      (recipient) => !phoneRegex.test(recipient.phone)
    );
    
    if (invalidRecipients.length > 0) {
      return NextResponse.json(
        { error: '잘못된 전화번호 형식이 포함되어 있습니다' },
        { status: 400 }
      );
    }

    console.log('body', body);
    // 1. sms_messages 테이블에 발송 요청 생성
    const [smsMessage] = await db
      .insert(smsMessages)
      .values({
        orderId: body.orderId,
        senderId: body.senderId,
        messageBody: body.messageBody,
        messageType: body.messageType,
        requestStatus: 'pending',
      })
      .returning();

    // 2. sms_recipients 테이블에 수신자 정보 생성
    const recipientValues = body.recipients.map((recipient) => ({
      smsMessageId: smsMessage.id,
      recipientName: recipient.name,
      recipientPhone: recipient.phone,
      roleType: recipient.role as SmsRoleType,
      deliveryStatus: 'pending' as const,
    }));

    await db.insert(smsRecipients).values(recipientValues);

    // 3. 외부 SMS API 호출 - 아직 구현안됨
    const externalResult = await callExternalSmsApi(body.recipients, body.messageBody);
    //const externalResult = {
    //  status: 'dispatched',
    //  results: [],
    //};

    // 4. 수신자별 전송 결과 업데이트
    for (const result of externalResult.results) {
      await db
        .update(smsRecipients)
        .set({
          deliveryStatus: result.status as SmsDeliveryStatus,
          errorMessage: result.errorMessage,
          apiMessageId: result.apiMessageId,
          sentAt: result.status === 'success' ? new Date() : null,
        })
        .where(eq(smsRecipients.recipientPhone, result.phone));
    }

    // 5. 메시지 상태 업데이트
    await db
      .update(smsMessages)
      .set({
        requestStatus: externalResult.status as SmsRequestStatus,
        dispatchedAt: new Date(),
      })
      .where(eq(smsMessages.id, smsMessage.id));

    // 6. 응답 생성
    const successCount = externalResult.results.filter(r => r.status === 'success').length;
    const failureCount = externalResult.results.filter(r => r.status === 'failed').length;

    const response: ISmsDispatchResponse = {
      messageId: smsMessage.id,
      status: externalResult.status as SmsRequestStatus,
      successCount,
      failureCount,
      results: externalResult.results.map(result => ({
        phone: result.phone,
        status: result.status as SmsDeliveryStatus,
        errorMessage: result.errorMessage,
        apiMessageId: result.apiMessageId,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('SMS dispatch error:', error);
    return NextResponse.json(
      { error: '문자 발송 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 