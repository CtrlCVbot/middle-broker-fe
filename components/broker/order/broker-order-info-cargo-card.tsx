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

interface ICargoCardProps {
  orderId: string;
  cargoInfo: {
    name: string;
    vehicleType: string;
    weight: string;
    options: string[];
    remark: string;
    paymentMethod: string;
  };
}

export function CargoCard({ 
  orderId,
  cargoInfo 
}: ICargoCardProps) {
  const [isWarningsVisible, setIsWarningsVisible] = useState(false);

  return (
    <div className="bg-white rounded-b-lg p-4">

      {/* 오더 정보 */}
      {/* <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">          
          <div>
            <p className="text-xs text-gray-900">화물 번호:</p>
            <p className="text-sm font-medium truncate">#{orderId}</p>                        
          </div>
        </div>        
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6" 
            //onClick={handleCall}
          >
            <Copy className="h-2 w-2" />
          </Button>          
        </div>
      </div> */}

      {/* 업체 정보 */}      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          
          <div>
            
            <p className="text-xs text-gray-900">품목:</p>
          </div>
        </div>
      </div>
      
      
      
      {/* 화물 정보 */}
      <div className="flex items-center justify-between rounded-md border-2 border-gray-100 p-1 px-2">
        <div className="flex items-center gap-3">
          
          <div>
            <p className="text-sm font-medium">{cargoInfo.name}</p>            
            <p className="text-xs text-gray-500 truncate">{cargoInfo.remark}</p>
          </div>
        </div>
        
        {/*  */}
        <div className="flex gap-2">
          <Badge 
            variant="outline" 

            className="px-3 py-1 h-8" 
            //onClick={handleCall}
          >
            <MessageSquareOff className="h-4 w-4 mr-1" />
            <span className="text-sm">{cargoInfo.paymentMethod}</span>
          </Badge>
          
        </div>
        
      </div>
      <div className=" mt-2">
        <div className="flex items-center gap-2">
        <div className="flex items-left gap-1"> 
            {cargoInfo.vehicleType && (
              <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                {cargoInfo.vehicleType}
              </span>
            )}
            {cargoInfo.weight && (
              <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                {cargoInfo.weight}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {cargoInfo.options && cargoInfo.options.length > 0 && cargoInfo.options.map((option, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
          
        </div>
      </div>

    </div>
  );
} 