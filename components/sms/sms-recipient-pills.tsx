'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { ISmsRecipient } from '@/types/sms';

interface ISmsRecipientPillsProps {
  recipients: ISmsRecipient[];
  onRemove: (phone: string) => void;
  isLoading?: boolean;
}

const roleLabels: Record<string, string> = {
  requester: '요청자',
  driver: '기사',
  shipper: '화주',
  load: '상차지',
  unload: '하차지',
  broker: '브로커',
};

export function SmsRecipientPills({ 
  recipients, 
  onRemove, 
  isLoading = false 
}: ISmsRecipientPillsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">수신자 로딩 중...</span>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="p-3 border rounded-md bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          수신자를 추가해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
      {recipients.map((recipient) => (
        <Badge
          key={recipient.phone}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="text-xs">
            {recipient.name} ({recipient.phone})
          </span>
          <span className="text-xs text-gray-500">
            {roleLabels[recipient.role] || recipient.role}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemove(recipient.phone)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
} 