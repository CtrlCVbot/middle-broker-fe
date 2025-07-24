//react
import React, { useState, useEffect } from "react";

//ui
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

//components
import { BrokerStatusDropdown } from "./broker-status-dropdown";
import { MessageDrawer } from "@/components/sms/message-drawer";
import { SmsMessageType, SmsRoleType, ISmsRecipient } from "@/types/sms";

//utils
import { validate as isValidUUID, version as getUUIDVersion } from 'uuid';

interface IBrokerOrderStatusCardProps {
  status: string;
  dispatchId?: string; // 선택적으로 변경
  from: {
    address: string;
    name: string;
    state: string;
    zipCode: string;
    country: string;
    contactName: string;
    contactPhone: string;
  };
  to: {
    address: string;
    name: string;
    state: string;
    zipCode: string;
    country: string;
    contactName: string;
    contactPhone: string;
  };
  onStatusChange?: (newStatus: string) => void;
  isSaleClosed?: boolean; // 매출 정산 마감 여부 추가
}

// UUID 검증을 위한 유틸리티 함수
// function isValidUUID(uuid: string | undefined): boolean {
//   if (!uuid) return false;
//   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//   return uuidRegex.test(uuid);
// }

export function BrokerOrderStatusCard({ 
  status, 
  dispatchId, 
  from, 
  to,
  onStatusChange,
  isSaleClosed = false // 기본값 false
}: IBrokerOrderStatusCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);  
  const [isDispatchIdValid, setIsDispatchIdValid] = useState(false);
  
  // SMS Drawer 상태 관리
  const [isSmsDrawerOpen, setIsSmsDrawerOpen] = useState(false);
  const [smsDefaultValues, setSmsDefaultValues] = useState({
    messageType: 'update' as SmsMessageType,
    recipient: {name: '', phone: '', role: 'shipper' as SmsRoleType} as ISmsRecipient,
    role: 'shipper' as SmsRoleType
  });
  
  console.log('status', status);
  // dispatchId 검증
  useEffect(() => {
    console.log("StatusCard dispatchId : ", dispatchId);
    //const valid = isValidUUID(dispatchId);
    const valid = isValidUUID(dispatchId as string);
    console.log("StatusCard valid : ", valid);
    setIsDispatchIdValid(valid);
    
    if (!valid && dispatchId !== undefined) {
      console.warn("유효하지 않은 배차 ID:", dispatchId);
    }
  }, [dispatchId]);
  
  // 문자 메시지 핸들러 추가
  const handleLoadContactMessage = () => {
    setSmsDefaultValues({
      messageType: 'update',
      recipient: {name: from.contactName, phone: from.contactPhone, role: 'load' as SmsRoleType} as ISmsRecipient,
      role: 'shipper'
    });
    setIsSmsDrawerOpen(true);
  };

  const handleUnloadContactMessage = () => {
    setSmsDefaultValues({
      messageType: 'update',
      recipient: {name: to.contactName, phone: to.contactPhone, role: 'unload' as SmsRoleType} as ISmsRecipient,
      role: 'unload'
    });
    setIsSmsDrawerOpen(true);
  };
  
  // 상태 변경 핸들러
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="bg-white px-4 py-4 rounded-t-lg ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-700">배송 상태</h3>
        {isDispatchIdValid && !isSaleClosed ? (
          <BrokerStatusDropdown 
            currentStatus={currentStatus}
            dispatchId={dispatchId as string}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
            <Button 
              variant="outline"
              size="sm"
              disabled
              className="px-3 py-1 text-sm text-gray-500"
            >
              {currentStatus}
            </Button>
          </div>
        )}
      </div>
      {!isDispatchIdValid && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            유효한 배차 ID가 없어 상태를 변경할 수 없습니다. 배차 정보를 확인해주세요.
          </span>
        </div>
      )}
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <p className="text-sm text-gray-500 mb-1">상차</p>
          <p className="text-md font-semibold">{from.name}</p>
          <p className="text-sm">{from.address}, {from.state} {from.zipCode}</p>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          <div className="bg-gray-100 rounded-full p-2">
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="col-span-2">
          <p className="text-sm text-gray-500 mb-1">하차</p>
          <p className="text-md font-semibold">{to.name}</p>
          <p className="text-sm">{to.address}, {to.state} {to.zipCode}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">          
          <div className="flex items-center">
            <p className="text-sm text-gray-500">{from.contactName}</p>
            <Button
              variant="outline"            
              className="h-5 text-xs ml-2"            
              onClick={handleLoadContactMessage}
            >
              <MessageSquare className="h-2 w-2" />                          
            </Button>
          </div>
          <p className="text-sm text-gray-500">{from.contactPhone}</p>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          
        </div>
        
        <div className="col-span-2">
          <div className="flex items-center">
            <p className="text-sm text-gray-500">{to.contactName}</p>
            <Button
              variant="outline"            
              className="h-5 text-xs ml-2"            
              onClick={handleUnloadContactMessage}
            >
              <MessageSquare className="h-2 w-2" />                          
            </Button>
          </div>
          <p className="text-sm text-gray-500">{to.contactPhone}</p>
        </div>
      </div>

      {/* SMS Drawer */}
      <MessageDrawer
        orderId={dispatchId || ''}
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