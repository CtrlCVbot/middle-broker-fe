import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface IDeliveryStatusCardProps {
  status: "Ongoing" | "Completed" | "Canceled" | "Pending";
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

export function DeliveryStatusCard({ status, from, to }: IDeliveryStatusCardProps) {
  // 상태에 따른 배지 색상 지정
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "Canceled":
        return "bg-red-50 text-red-600 border-red-200";
      case "Pending":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // 상태에 따른 한글 텍스트 매핑
  const getStatusText = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "배송 중";
      case "Completed":
        return "배송 완료";
      case "Canceled":
        return "배송 취소";
      case "Pending":
        return "배송 대기";
      default:
        return "상태 미정";
    }
  };

  // 주소 포맷팅
  const formatAddress = (addressObj: any) => {
    return `${addressObj.address}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}, ${addressObj.country}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-700">배송 상태</h3>
        <button 
          className={`rounded-full px-3 py-1 text-sm ${getStatusColor(status)}`}
        >
          {getStatusText(status)}
        </button>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <p className="text-sm text-gray-500 mb-1">상차</p>
          <p className="text-sm font-medium">{from.name}</p>
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
          <p className="text-sm font-medium">{to.name}</p>
          <p className="text-sm">{to.address}, {to.state} {to.zipCode}</p>

          {/* <p className="text-sm text-gray-500">{to.contactName}</p>
          <p className="text-sm text-gray-500">{to.contactPhone}</p> */}
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          
          
          <p className="text-sm text-gray-500">{from.contactName}</p>
          <p className="text-sm text-gray-500">{from.contactPhone}</p>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          
        </div>
        
        <div className="col-span-2">
          
          <p className="text-sm text-gray-500">{to.contactName}</p>
          <p className="text-sm text-gray-500">{to.contactPhone}</p>
        </div>
      </div>
    </div>
    
  );
} 