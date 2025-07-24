import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { smsTemplates } from '@/db/schema/smsMessages';
import { ISmsTemplate } from '@/types/sms';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleType = searchParams.get('roleType');
    const messageType = searchParams.get('messageType');

    // 기본 템플릿 데이터 (실제로는 DB에서 관리)
    const defaultTemplates: ISmsTemplate[] = [
      // {
      //   id: 'tmpl-001',
      //   roleType: 'driver',
      //   messageType: 'complete',
      //   templateBody: '[화물번호:{{order_id}}] 배차가 완료되었습니다. 차량: {{vehicle_number}}, 기사: {{driver_name}} {{driver_phone}}',
      //   isActive: true,
      // },
      // {
      //   id: 'tmpl-002',
      //   roleType: 'requester',
      //   messageType: 'complete',
      //   templateBody: '[화물번호:{{order_id}}] 배차가 완료되었습니다. 차량: {{vehicle_number}}, 기사: {{driver_name}}',
      //   isActive: true,
      // },
      {
        id: 'tmpl-003',
        roleType: 'shipper',
        messageType: 'complete',
        templateBody: '[화물번호:{{order_id}}] 상차가 오늘 예정입니다. 기사: {{driver_name}} {{driver_phone}}',
        isActive: true,
      },
      {
        id: 'tmpl-004',
        roleType: 'load',
        messageType: 'complete',
        templateBody: '[화물번호:{{order_id}}] 상차가 오늘 예정입니다. 기사: {{driver_name}} {{driver_phone}}',
        isActive: true,
      },
      {
        id: 'tmpl-005',
        roleType: 'unload',
        messageType: 'complete',
        templateBody: '[화물번호:{{order_id}}] 하차가 오늘 예정입니다. 기사: {{driver_name}} {{driver_phone}}',
        isActive: true,
      },
      {
        id: 'tmpl-006',
        roleType: 'driver',
        messageType: 'update',
        templateBody: '[화물번호:{{order_id}}] 배차 정보가 변경되었습니다. 상차지: {{pickup_address}}, 하차지: {{delivery_address}}',
        isActive: true,
      },
      {
        id: 'tmpl-007',
        roleType: 'shipper',
        messageType: 'cancel',
        templateBody: '[화물번호:{{order_id}}] 배차가 취소되었습니다.',
        isActive: true,
      },
    ];

    // 필터링 적용
    let filteredTemplates = defaultTemplates;

    if (roleType) {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.roleType === roleType
      );
    }

    if (messageType) {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.messageType === messageType
      );
    }

    // 활성화된 템플릿만 반환
    filteredTemplates = filteredTemplates.filter(
      (template) => template.isActive
    );

    return NextResponse.json(filteredTemplates);
  } catch (error) {
    console.error('SMS templates error:', error);
    return NextResponse.json(
      { error: '템플릿 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 