import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel, Eye, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { DriverHistory } from "./broker-driver-history";

interface IVehicleCardProps {
  vehicleInfo: {
    type: string;
    weight?: string;
    licensePlate?: string;
    connection?: string;
  };
  driverInfo: {
    name: string;
    contact?: string;
    role?: string;
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
  const [editMode, setEditMode] = useState(false);
  const [isDriverInfoOpen, setIsDriverInfoOpen] = useState(false);

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

  const toggleDriverInfo = () => {
    setIsDriverInfoOpen(!isDriverInfoOpen);
  };

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      {/* 차량 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-2xl">🚚</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{vehicleInfo.licensePlate && <span> #{vehicleInfo.licensePlate}</span>}</h3>
              {vehicleInfo.connection && (
                <Badge variant="outline" className={`${
                  vehicleInfo.connection === '화물맨' 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                } ml-2 px-2 py-0.5 text-xs rounded-full`}>
                  {vehicleInfo.connection}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 text-sm text-gray-500">
              {vehicleInfo.weight && <span>{vehicleInfo.weight} | {vehicleInfo.type}</span>}
              
            </div>
          </div>
        </div>

        {/* 주의사항 버튼 */}
        <div className="flex gap-2">          
          {/* 편집 모드 전환 버튼 */}
          {editMode ? (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setEditMode(false)}
              className="h-7 px-2"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              보기
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setEditMode(true)}
              className="h-7 px-2"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              편집
            </Button>
          )}
        </div>
      </div>
      
      {/* 연료 상태 */}
      {/* {vehicleInfo.licensePlate !== undefined && (
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Fuel className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm font-medium">연료</span>
          </div>
          <div className="flex items-center">
            <div className="flex-1 mr-2">
              <Progress 
                value={80} 
                className="h-3" 
                //indicatorClassName="bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
            <span className="text-sm font-medium">80%</span>
          </div>
        </div>
      )} */}
      <Separator className="my-3" />
      
      {/* 운전자 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">👤</div>
          </div>
          <div className="flex items-center cursor-pointer" onClick={toggleDriverInfo}>
            <p className="text-sm font-medium">{driverInfo.name}</p>
            <div className="ml-2">
              {isDriverInfoOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
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
            <span className="text-xs">{driverInfo.contact}</span>
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

      {/* 운전자 정보가 열려있을 때 배차 이력과 특이사항 표시 */}
      {isDriverInfoOpen && (
        <div className="mt-3">
          <DriverHistory />
        </div>
      )}
    </div>
  );
} 