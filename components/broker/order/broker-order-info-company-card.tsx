import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel, AlertTriangle, MessageSquareOff, Copy } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

// 업체 주의사항 인터페이스
interface ICompanyWarning {
  id: string;
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

interface ICompanyCardProps {
  orderId: string;
  companyInfo: {
    name: string;
    year: string;
    id: string;
    isLive?: boolean;
    fuelLevel?: number;
    warnings?: ICompanyWarning[];
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
  companyInfo, 
  managerInfo, 
  onCall, 
  onMessage 
}: ICompanyCardProps) {
  const [isWarningsVisible, setIsWarningsVisible] = useState(false);
  
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
  const companyWarnings = companyInfo.warnings || [
    { id: '1', date: '2023-05-15', content: '결제 지연 이력 있음', severity: 'medium' },
    { id: '2', date: '2023-06-20', content: '화물 취소 이력', severity: 'low' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4 shadow-sm">

      {/* 오더 정보 */}
      <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">          
          <div>
            <p className="text-xs text-gray-900 truncate">화물 번호:</p>
            <p className="text-sm font-medium truncate">#{orderId}</p>                        
          </div>
        </div>

        
        
        {/* 통화 및 메시지 버튼 */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6" 
            onClick={handleCall}
          >
            <Copy className="h-2 w-2 mr-1" />
          </Button>          
        </div>
      </div>

      {/* 업체 정보 */}      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">🏢</div>
          </div>
          <div>
            <p className="text-base font-semibold">{companyInfo.name}</p>            
            <p className="text-sm text-gray-500">#{companyInfo.id}</p>
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
            주의사항 
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
            
            {companyWarnings.length > 0 ? (
              <ul className="space-y-2">
                {companyWarnings.map((warning) => (
                  <li key={warning.id} className="flex items-start gap-2 text-sm">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${warning.severity === 'high' ? 'bg-red-50 text-red-700' : 
                          warning.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                          'bg-blue-50 text-blue-700'}
                      `}
                    >
                      {warning.date}
                    </Badge>
                    <span>{warning.content}</span>
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
        
        {/* 통화 및 메시지 버튼 */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 h-8" 
            onClick={handleCall}
          >
            <MessageSquareOff className="h-4 w-4 mr-1" />
            <span className="text-sm">취소</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="px-3 py-1 h-8 bg-gray-800" 
            onClick={handleMessage}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="text-sm">완료</span>
          </Button>
        </div>
      </div>

    </div>
  );
} 