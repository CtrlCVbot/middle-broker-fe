'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';
import { ISmsRecipient, ISmsRecommendedRecipient } from '@/types/sms';

interface IRecipientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedRecipients: ISmsRecommendedRecipient[];
  onAddRecipient: (recipient: ISmsRecipient) => void;
  currentRecipients: ISmsRecipient[];
}

const roleLabels: Record<string, string> = {
  requester: '요청자',
  driver: '기사',
  shipper: '화주',
  load: '상차지',
  unload: '하차지',
  broker: '브로커',
};

export function RecipientDrawer({
  isOpen,
  onClose,
  recommendedRecipients,
  onAddRecipient,
  currentRecipients,
}: IRecipientDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');

  const filteredRecipients = recommendedRecipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.phone.includes(searchTerm)
  );

  const isAlreadyAdded = (phone: string) => {
    return currentRecipients.some((r) => r.phone === phone);
  };

  const handleAddRecommended = (recipient: ISmsRecommendedRecipient) => {
    if (!isAlreadyAdded(recipient.phone)) {
      onAddRecipient({
        name: recipient.name,
        phone: recipient.phone,
        role: recipient.roleType,
      });
    }
  };

  const handleAddManual = () => {
    if (manualName.trim() && manualPhone.trim()) {
      // 전화번호 형식 검증
      const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phoneRegex.test(manualPhone)) {
        alert('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
        return;
      }

      if (!isAlreadyAdded(manualPhone)) {
        onAddRecipient({
          name: manualName.trim(),
          phone: manualPhone.trim(),
          role: 'requester', // 기본값
        });
        setManualName('');
        setManualPhone('');
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>연락처 추가</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-6">
            {/* 추천 수신자 */}
            <div className="space-y-3">
              <Label>추천 수신자</Label>
              <div className="space-y-2">
                {recommendedRecipients.map((recipient) => (
                  <div
                    key={recipient.phone}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{recipient.name}</div>
                      <div className="text-sm text-gray-500">{recipient.phone}</div>
                      <Badge variant="secondary" className="mt-1">
                        {roleLabels[recipient.roleType]}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant={isAlreadyAdded(recipient.phone) ? "secondary" : "default"}
                      disabled={isAlreadyAdded(recipient.phone)}
                      onClick={() => handleAddRecommended(recipient)}
                    >
                      {isAlreadyAdded(recipient.phone) ? (
                        <>
                          <X className="mr-1 h-3 w-3" />
                          추가됨
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-3 w-3" />
                          추가
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* 수동 입력 */}
            <div className="space-y-3">
              <Label>수동 입력</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="manual-name">이름</Label>
                  <Input
                    id="manual-name"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-phone">전화번호</Label>
                  <Input
                    id="manual-phone"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>
                <Button
                  onClick={handleAddManual}
                  disabled={!manualName.trim() || !manualPhone.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  추가
                </Button>
              </div>
            </div>

            {/* 검색 */}
            <div className="space-y-3">
              <Label>검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름 또는 전화번호로 검색"
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <div className="space-y-2">
                  {filteredRecipients.map((recipient) => (
                    <div
                      key={recipient.phone}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{recipient.name}</div>
                        <div className="text-sm text-gray-500">{recipient.phone}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={isAlreadyAdded(recipient.phone) ? "secondary" : "default"}
                        disabled={isAlreadyAdded(recipient.phone)}
                        onClick={() => handleAddRecommended(recipient)}
                      >
                        {isAlreadyAdded(recipient.phone) ? "추가됨" : "추가"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 