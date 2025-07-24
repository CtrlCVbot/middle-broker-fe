'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SmsTemplateSelect } from '@/components/sms/sms-template-select';
import { SmsSendButton } from '@/components/sms/sms-send-button';
import { useSmsStore } from '@/store/sms-store';
import { fetchTemplates } from '@/services/sms-service';
import { ISmsTemplate } from '@/types/sms';

interface ISmsMessageFormProps {
  orderId: string;
}

export function SmsMessageForm({ orderId }: ISmsMessageFormProps) {
  const [templates, setTemplates] = useState<ISmsTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  console.log('orderId123', orderId);
  const { 
    message, 
    messageType, 
    recipients,
    setMessage, 
    setMessageType 
  } = useSmsStore();

  // 템플릿 로드
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateChange = (template: ISmsTemplate) => {
    setMessageType(template.messageType);
    
    // 템플릿 내용을 화물 정보로 치환
    let templateBody = template.templateBody;
    templateBody = templateBody.replace(/{{order_id}}/g, orderId);
    templateBody = templateBody.replace(/{{vehicle_number}}/g, '82가1234'); // 실제로는 화물 정보에서 가져와야 함
    templateBody = templateBody.replace(/{{driver_name}}/g, '김기사');
    templateBody = templateBody.replace(/{{driver_phone}}/g, '010-****-56781');
    templateBody = templateBody.replace(/{{pickup_address}}/g, '서울 OO');
    templateBody = templateBody.replace(/{{delivery_address}}/g, '부산 XX');
    
    
    setMessage(templateBody);
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
  };

  const isValid = recipients.length > 0 && message.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* 템플릿 선택 */}
      <div className="space-y-2">
        <Label htmlFor="template">메시지 유형</Label>
        <SmsTemplateSelect
          templates={templates}
          isLoading={isLoadingTemplates}
          selectedType={messageType}
          onTemplateChange={handleTemplateChange}
        />
      </div>

      {/* 메시지 입력 */}
      <div className="space-y-2">
        <Label htmlFor="message">메시지 내용</Label>
        <Textarea
          id="message"
          placeholder="메시지를 입력해주세요..."
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{message.length}/160자</span>
          <span>
            {recipients.length}명에게 발송
          </span>
        </div>
      </div>

      {/* 전송 버튼 */}
      <SmsSendButton 
        orderId={orderId}
        isValid={isValid}
      />
    </div>
  );
} 