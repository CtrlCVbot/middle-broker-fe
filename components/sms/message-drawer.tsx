'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { SmsMessageForm } from '@/components/sms/sms-message-form';
import { SmsRecipientPills } from '@/components/sms/sms-recipient-pills';
import { RecipientSidebar } from '@/components/sms/recipient-sidebar';
import { SmsHistoryPanel } from '@/components/sms/sms-history-panel';
import { useSmsStore } from '@/store/sms-store';
import { fetchRecommendedRecipients } from '@/services/sms-service';
import { ISmsRecommendedRecipient, SmsMessageType, SmsRoleType } from '@/types/sms';
import { useToast } from '@/components/ui/use-toast';

interface IMessageDrawerProps {
  orderId: string;
  defaultMessageType?: SmsMessageType;
  defaultRecipient?: string;
  defaultRole?: SmsRoleType;
  showButtons?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MessageDrawer({ 
  orderId, 
  defaultMessageType,
  defaultRecipient,
  defaultRole,
  showButtons = true,
  isOpen: controlledIsOpen,
  onOpenChange
}: IMessageDrawerProps) {
  // 제어형/비제어형 상태 관리
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalIsOpen;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recommendedRecipients, setRecommendedRecipients] = useState<ISmsRecommendedRecipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  
  const { 
    recipients, 
    setRecipients, 
    addRecipient, 
    removeRecipient,
    setMessageType,
    reset 
  } = useSmsStore();
  
  const { toast } = useToast();

  // 기본값 설정
  useEffect(() => {
    if (defaultMessageType) {
      setMessageType(defaultMessageType);
    }
  }, [defaultMessageType, setMessageType]);

  // 추천 수신자 로드
  useEffect(() => {
    if (isOpen && orderId) {
      loadRecommendedRecipients();
    }
  }, [isOpen, orderId]);

  const loadRecommendedRecipients = async () => {
    try {
      setIsLoadingRecipients(true);
      const data = await fetchRecommendedRecipients(orderId);
      setRecommendedRecipients(data);
      
      // 기본 수신자 설정
      let defaultRecipients = data.filter(
        (recipient) => ['requester', 'driver'].includes(recipient.roleType)
      );
      
      // 특정 수신자가 지정된 경우
      if (defaultRecipient && defaultRole) {
        const specificRecipient = data.find(
          (recipient) => recipient.phone === defaultRecipient && recipient.roleType === defaultRole
        );
        if (specificRecipient) {
          defaultRecipients = [specificRecipient];
        }
      }
      
      if (defaultRecipients.length > 0) {
        setRecipients(defaultRecipients.map(recipient => ({
          name: recipient.name,
          phone: recipient.phone,
          role: recipient.roleType,
        })));
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '추천 수신자를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleHistoryClose = () => {
    setIsHistoryOpen(false);
  };

  const handleDrawerClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <>
      {showButtons && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setIsOpen(true)}>
            문자 메시지 보내기
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsHistoryOpen(true)}
          >
            문자 이력 보기
          </Button>
        </div>
      )}

      {/* 메인 문자 발송 시트 */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>문자 메시지 보내기</DrawerTitle>
            </DrawerHeader>
            
            <div className="p-4 space-y-4">
              {/* 수신자 영역 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">수신자</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    연락처 추가
                  </Button>
                </div>
                
                <SmsRecipientPills 
                  recipients={recipients}
                  onRemove={removeRecipient}
                  isLoading={isLoadingRecipients}
                />
              </div>

              {/* 메시지 폼 */}
              <SmsMessageForm orderId={orderId} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 수신자 추가 사이드바 */}
      <RecipientSidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        recommendedRecipients={recommendedRecipients}
        onAddRecipient={addRecipient}
        currentRecipients={recipients}
      />

      {/* 문자 이력 패널 */}
      <SmsHistoryPanel
        isOpen={isHistoryOpen}
        onClose={handleHistoryClose}
        orderId={orderId}
      />
    </>
  );
} 