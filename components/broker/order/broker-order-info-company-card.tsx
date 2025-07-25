import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel, AlertTriangle, MessageSquareOff, Copy } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { fetchWarnings } from '@/services/broker-company-warning-service';
import { ICompanyWarning } from "@/types/company-warning";
import { MessageDrawer } from "@/components/sms/message-drawer";
import { ISmsRecipient, SmsMessageType, SmsRoleType } from "@/types/sms";

import { safeFormatDate } from "@/utils/format";

// 업체 주의사항 인터페이스
// interface ICompanyWarning {
//   id: string;
//   date: string;
//   content: string;
//   severity: 'low' | 'medium' | 'high';
// }

interface ICompanyCardProps {
  orderId: string;  
  companyInfo: {
    id?: string;
    name: string;    
  };
  managerInfo: {
    name: string;
    contact: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onCall?: (driverName: string) => void;
  onMessage?: (driverName: string) => void;
}

export function CompanyCard({ 
  orderId,
  //companyId,
  companyInfo, 
  managerInfo, 
  onCall, 
  onMessage 
}: ICompanyCardProps) {

  console.log('orderId123456', orderId);
  const [isWarningsVisible, setIsWarningsVisible] = useState(false);
  const [companyWarnings, setCompanyWarnings] = useState<ICompanyWarning[]>([]);
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(false);
  
  // SMS Drawer 상태 관리
  const [isSmsDrawerOpen, setIsSmsDrawerOpen] = useState(false);
  const [smsDefaultValues, setSmsDefaultValues] = useState({
    messageType: 'complete' as SmsMessageType,
    recipient: {name: '', phone: '', role: 'shipper' as SmsRoleType} as ISmsRecipient,
    role: 'shipper' as SmsRoleType
  });

  useEffect(() => {
    console.log('companyInfo.id', companyInfo.id);
    const companyId = companyInfo.id || "";
    if (!companyId) {
      setCompanyWarnings([]);
      return;
    }
    setIsLoadingWarnings(true);
    fetchWarnings(companyId)
      .then((data) => setCompanyWarnings(data))
      .catch(() => setCompanyWarnings([]))
      .finally(() => setIsLoadingWarnings(false));
  }, [companyInfo.id]);

  // 문자 메시지 핸들러 수정
  const handleCancelMessage = () => {
    setSmsDefaultValues({
      messageType: 'cancel',
      recipient: {name: managerInfo.name, phone: managerInfo.contact, role: 'shipper' as SmsRoleType} as ISmsRecipient,
      role: 'shipper'
    });
    setIsSmsDrawerOpen(true);
  };

  const handleCompleteMessage = () => {
    setSmsDefaultValues({
      messageType: 'complete',
      recipient: {name: managerInfo.name, phone: managerInfo.contact, role: 'shipper' as SmsRoleType} as ISmsRecipient,
      role: 'requester'
    });
    setIsSmsDrawerOpen(true);
  };

  const handleCall = () => {
    if (onCall) {
      onCall(managerInfo.name);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(managerInfo.name);
    }
  };

  // 목업 데이터 - 회사 주의사항
  // const companyWarnings = companyInfo.warnings || [
  //   { id: '1', date: '2023-05-15', content: '결제 지연 이력 있음', severity: 'medium' },
  //   { id: '2', date: '2023-06-20', content: '화물 취소 이력', severity: 'low' },
  // ];

  return (
    <div className="bg-white px-4 py-4 rounded-t-lg ">

      {/* 오더 정보 */}
      {/* <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">          
          <div>
            <p className="text-xs text-gray-900 truncate">화물 번호:</p>
            <p className="text-sm font-medium truncate">#{orderId}</p>                        
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6" 
            onClick={handleCall}
          >
            <Copy className="h-2 w-2" />
          </Button>          
        </div>
      </div> */}

      {/* 업체 정보 */}      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">🏢</div>
          </div>
          <div>
            <p className="text-base font-semibold">{companyInfo.name}</p>            
            <p className="text-xs text-gray-500">요청 업체</p>
          </div>
        </div>
        
        {/* 주의사항 버튼 */}
        <div className="flex gap-2">          
          <Button
            variant="outline" 
            size="sm"
            className="px-3 py-1 h-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsWarningsVisible(!isWarningsVisible);
            }}
          >
            <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs">주의사항</span>
          </Button>
        </div>
      </div>
      
      {/* 주의사항 섹션 - 확장 시 표시 */}
      {isWarningsVisible && (
        <>
          <Separator className="my-3" />
          <div className="mb-3 space-y-2 bg-muted/10 rounded-md p-2">
            <h5 className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              업체 주의사항
            </h5>
            
            {isLoadingWarnings ? (
              <p className="text-sm text-muted-foreground">주의사항을 불러오는 중입니다...</p>
            ) : companyWarnings.length > 0 ? (
              <ul className="space-y-2">
                {companyWarnings.map((warning) => (
                  <li key={warning.id} className="flex items-start gap-2 text-sm">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${//warning.severity === 'high' ? 'bg-red-50 text-red-700' : 
                          //warning.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                          'bg-amber-50 text-amber-700'}
                      `}
                    >
                      {safeFormatDate(warning.createdAt, "yy-MM-dd")}
                    </Badge>
                    <span>{warning.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">주의사항이 없습니다.</p>
            )}
          </div>
        </>
      )}
      
      {/* 담당자 정보 */}
      <div className="flex items-center justify-between rounded-md border-2 border-gray-100 p-1 px-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-lg">👤</div>
          </div>
          <div>
            <p className="text-sm font-medium">{managerInfo.name}</p>            
            <p className="text-xs text-gray-500 truncate">{managerInfo.contact}</p>
            <p className="text-xs text-gray-500 truncate">{managerInfo.email}</p>
          </div>
        </div>
        
        {/* 메시지 발송 버튼 */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 h-8" 
            onClick={handleCancelMessage}
          >
            <MessageSquareOff className="h-4 w-4 mr-1" />
            <span className="text-sm">취소</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="px-3 py-1 h-8 bg-gray-800" 
            onClick={handleCompleteMessage}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="text-sm">완료</span>
          </Button>
        </div>
      </div>

      {/* SMS Drawer */}
      <MessageDrawer
        orderId={orderId}
        defaultMessageType={smsDefaultValues.messageType}
        defaultRecipient={smsDefaultValues.recipient}
        defaultRole={smsDefaultValues.role}
        showButtons={false}
        isOpen={isSmsDrawerOpen}
        onOpenChange={setIsSmsDrawerOpen}
      />

    </div>
  );
} 