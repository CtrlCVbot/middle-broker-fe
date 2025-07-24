'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ISmsTemplate, SmsMessageType } from '@/types/sms';

interface ISmsTemplateSelectProps {
  templates: ISmsTemplate[];
  isLoading: boolean;
  selectedType: SmsMessageType;
  onTemplateChange: (template: ISmsTemplate) => void;
}

const messageTypeLabels: Record<SmsMessageType, string> = {
  complete: '배차 완료 안내',
  update: '배차 변경 안내',
  cancel: '배차 취소 안내',
  custom: '커스텀 입력',
};

const roleLabels: Record<string, string> = {
  requester: '요청자',
  driver: '기사',
  shipper: '화주',
  load: '상차지',
  unload: '하차지',
  broker: '브로커',
};

export function SmsTemplateSelect({
  templates,
  isLoading,
  selectedType,
  onTemplateChange,
}: ISmsTemplateSelectProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">템플릿 로딩 중...</span>
      </div>
    );
  }

  const handleValueChange = (value: string) => {
    const template = templates.find(t => t.id === value);
    if (template) {
      onTemplateChange(template);
    }
  };

  return (
    <Select value={selectedType} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="메시지 유형을 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <div className="flex flex-col">
              <span className="font-medium">
                {messageTypeLabels[template.messageType]}
              </span>
              <span className="text-xs text-gray-500">
                {roleLabels[template.roleType]} 대상
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 