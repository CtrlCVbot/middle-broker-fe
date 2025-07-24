'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useSmsStore } from '@/store/sms-store';
import { sendSms } from '@/services/sms-service';
import { useToast } from '@/components/ui/use-toast';

interface ISmsSendButtonProps {
  orderId: string;
  isValid: boolean;
}

export function SmsSendButton({ orderId, isValid }: ISmsSendButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { recipients, message, messageType, setLoading, setError, reset } = useSmsStore();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!isValid) return;

    try {
      setIsLoading(true);
      setLoading(true);
      setError(null);

      const response = await sendSms({
        orderId,
        senderId: 'user-123', // 실제로는 현재 사용자 ID
        messageType,
        messageBody: message,
        recipients,
      });

      // 성공 처리
      toast({
        title: '전송 완료',
        description: `${response.successCount}명에게 성공적으로 전송되었습니다.`,
      });

      // 실패한 수신자가 있는 경우
      if (response.failureCount > 0) {
        toast({
          title: '일부 전송 실패',
          description: `${response.failureCount}명에게 전송에 실패했습니다.`,
          variant: 'destructive',
        });
      }

      // 폼 초기화
      reset();
    } catch (error) {
      console.error('문자 발송 실패:', error);
      
      toast({
        title: '전송 실패',
        description: '문자 발송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      
      setError('문자 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSend}
      disabled={!isValid || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          전송 중...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          문자 보내기 ({recipients.length}명)
        </>
      )}
    </Button>
  );
} 