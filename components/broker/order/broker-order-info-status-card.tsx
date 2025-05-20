import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BrokerStatusDropdown } from "./broker-status-dropdown";

interface IBrokerOrderStatusCardProps {
  status: string;
  dispatchId: string;
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
}

export function BrokerOrderStatusCard({ 
  status, 
  dispatchId, 
  from, 
  to,
  onStatusChange 
}: IBrokerOrderStatusCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  
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
        <BrokerStatusDropdown 
          currentStatus={currentStatus}
          dispatchId={dispatchId}
          onStatusChange={handleStatusChange}
        />
      </div>
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