'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, User, Phone, MessageSquare } from 'lucide-react';
import { fetchSmsHistory } from '@/services/sms-service';
import { ISmsHistoryItem } from '@/types/sms';

interface ISmsHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const messageTypeLabels: Record<string, string> = {
  complete: '배차 완료 안내',
  update: '차량 변경 안내',
  cancel: '배차 취소 안내',
  custom: '커스텀 입력',
};

const statusLabels: Record<string, string> = {
  success: '성공',
  failed: '실패',
  pending: '대기중',
};

const roleLabels: Record<string, string> = {
  requester: '요청자',
  driver: '기사',
  shipper: '화주',
  load: '상차지',
  unload: '하차지',
  broker: '브로커',
};

export function SmsHistoryPanel({ isOpen, onClose, orderId }: ISmsHistoryPanelProps) {
  const [history, setHistory] = useState<ISmsHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadHistory();
    }
  }, [isOpen, orderId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSmsHistory(orderId);
      setHistory(data);
    } catch (error) {
      console.error('이력 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>문자 발송 이력</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">이력 로딩 중...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>발송된 문자 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.messageId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {messageTypeLabels[item.messageType]}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 메시지 내용 */}
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm">{item.messageBody}</p>
                      </div>
                      
                      {/* 수신자 목록 */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">수신자</h4>
                        {item.recipients.map((recipient, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{recipient.name}</span>
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{recipient.phone}</span>
                              <Badge variant="outline" className="text-xs">
                                {roleLabels[recipient.role]}
                              </Badge>
                            </div>
                            <Badge
                              variant={
                                recipient.status === 'success' ? 'default' : 
                                recipient.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {statusLabels[recipient.status]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      {/* 전체 상태 */}
                      <div className="flex justify-end">
                        <Badge
                          variant={
                            item.requestStatus === 'dispatched' ? 'default' : 
                            item.requestStatus === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {item.requestStatus === 'dispatched' ? '전송 완료' : 
                           item.requestStatus === 'failed' ? '전송 실패' : '대기중'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 