import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel } from "lucide-react";
import Image from "next/image";

interface IVehicleCardProps {
  vehicleInfo: {
    model: string;
    year: string;
    id: string;
    isLive?: boolean;
    fuelLevel?: number;
  };
  driverInfo: {
    name: string;
    role: string;
    avatar?: string;
  };
  onCall?: (driverName: string) => void;
  onMessage?: (driverName: string) => void;
}

export function VehicleCard({ 
  vehicleInfo, 
  driverInfo, 
  onCall, 
  onMessage 
}: IVehicleCardProps) {
  const handleCall = () => {
    if (onCall) {
      onCall(driverInfo.name);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(driverInfo.name);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {/* 차량 이미지 */}
            <div className="text-2xl">🚚</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{vehicleInfo.year} {vehicleInfo.model}</h3>
              {vehicleInfo.isLive && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-2 px-2 py-0.5 text-xs rounded-full">
                  Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">#{vehicleInfo.id}</p>
          </div>
        </div>
      </div>
      
      {/* 연료 상태 */}
      {vehicleInfo.fuelLevel !== undefined && (
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Fuel className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm font-medium">연료</span>
          </div>
          <div className="flex items-center">
            <div className="flex-1 mr-2">
              <Progress 
                value={vehicleInfo.fuelLevel} 
                className="h-3" 
                //indicatorClassName="bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
            <span className="text-sm font-medium">{vehicleInfo.fuelLevel}%</span>
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
            <p className="text-sm font-medium">{driverInfo.name}</p>
            <p className="text-xs text-gray-500">{driverInfo.role}</p>
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