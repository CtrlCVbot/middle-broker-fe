import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel } from "lucide-react";
import Image from "next/image";

interface ICompanyCardProps {
  companyInfo: {
    name: string;
    year: string;
    id: string;
    isLive?: boolean;
    fuelLevel?: number;
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
  companyInfo, 
  managerInfo, 
  onCall, 
  onMessage 
}: ICompanyCardProps) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {/* 차량 이미지 */}
            <div className="text-2xl">🏢</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{companyInfo.name}</h3>
              {companyInfo.isLive && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-2 px-2 py-0.5 text-xs rounded-full">
                  Live
                </Badge>
              )}
              
            </div>
            <p className="text-sm text-gray-500">#{companyInfo.id}</p>
          </div>
        </div>
      </div>
      
      {/* 연료 상태 */}
      {companyInfo.fuelLevel !== undefined && (
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Fuel className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm font-medium">연료</span>
          </div>
          <div className="flex items-center">
            <div className="flex-1 mr-2">
              <Progress 
                value={companyInfo.fuelLevel} 
                className="h-3" 
                //indicatorClassName="bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
            <span className="text-sm font-medium">{companyInfo.fuelLevel}%</span>
          </div>
        </div>
      )}
      
      {/* 운전자 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">👤</div>
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
            <Phone className="h-4 w-4 mr-1" />
            <span className="text-sm">통화</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="px-3 py-1 h-8 bg-gray-800" 
            onClick={handleMessage}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="text-sm">메시지</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 