import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface IBrokerOrderStatusCardProps {
  status: string;
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
}

export function BrokerOrderStatusCard({ status, from, to }: IBrokerOrderStatusCardProps) {
  
  // 상태에 따른 배지 색상 지정
  const getStatusColor = (status: string) => {
    switch (status) {
      case "배차대기":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "배차완료":
        return "bg-green-50 text-green-600 border-green-200";
      case "배차취소":
        return "bg-red-50 text-red-600 border-red-200";
      case "운송중":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "운송완료":
        return "bg-green-50 text-green-600 border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // 상태에 따른 한글 텍스트 매핑
  const getStatusText = (status: string) => {
    switch (status) {
      case "배차대기":
        return "배차 대기";
      case "배차완료":
        return "배차 완료";
      case "배차취소":
        return "배송 취소";
      case "운송중":
        return "배송 중";
      case "운송완료":
        return "배송 완료";
      default:
        return status;
    }
  };

  // 주소 포맷팅
  const formatAddress = (addressObj: any) => {
    return `${addressObj.address}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}, ${addressObj.country}`;
  };

  return (
    <div className="bg-white px-4 py-4 rounded-t-lg ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-700">배송 상태</h3>
        <Button 
          variant="outline"
          size="sm"          
          className={` px-3 py-1 text-sm ${getStatusColor(status)}`}
        >
          {getStatusText(status)}
        </Button>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <p className="text-sm text-gray-500 mb-1">상차</p>
          <p className="text-md font-semibold">{from.name}</p>
          <p className="text-sm">{from.address}, {from.state} {from.zipCode}</p>
          
          {/* <p className="text-sm text-gray-500">{from.contactName}</p>
          <p className="text-sm text-gray-500">{from.contactPhone}</p> */}
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

          {/* <p className="text-sm text-gray-500">{to.contactName}</p>
          <p className="text-sm text-gray-500">{to.contactPhone}</p> */}
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">          
          <div className="flex items-center">
            <p className="text-sm text-gray-500">{from.contactName}</p>
            <Badge
              variant="outline"            
              className="h-5 text-xs ml-2"            
            >
              <MessageSquare className="h-2 w-2" />                          
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{from.contactPhone}</p>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          
        </div>
        
        <div className="col-span-2">
          
        <div className="flex items-center">
            <p className="text-sm text-gray-500">{to.contactName}</p>
            <Badge
              variant="outline"            
              className="h-5 text-xs ml-2"            
            >
              <MessageSquare className="h-2 w-2" />                          
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{to.contactPhone}</p>
        </div>
      </div>
    </div>
    
  );
} 