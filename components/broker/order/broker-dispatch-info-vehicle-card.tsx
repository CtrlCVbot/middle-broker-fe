import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Phone, MessageSquare, Fuel, Eye, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { DriverHistory } from "./broker-driver-history";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { BrokerOrderDriverInfoEditForm as VehicleEditForm } from "./broker-dispatch-info-vehicle-form";

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
  onSaveDriverInfo?: (data: any) => void;
}

export function VehicleCard({ 
  vehicleInfo, 
  driverInfo, 
  onCall, 
  onMessage,
  onSaveDriverInfo
}: IVehicleCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [isDriverInfoOpen, setIsDriverInfoOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const toggleEditMode = () => {
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveDriverInfo = (data: any) => {
    if (onSaveDriverInfo) {
      onSaveDriverInfo(data);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-lg py-2 px-2 space-y-4">
      
      {/* 차량 정보 */}
      <div className="flex items-center justify-between mb-1 hover:cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-md"  onClick={toggleEditMode}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
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

        {/* 편집 버튼 */}
        <div className="flex gap-2">          
          {/* 편집 모드 전환 버튼 */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              toggleEditMode();
            }}
            className="h-7 px-2 text-gray-500"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />              
          </Button>
        </div>
      </div>
      
      {/* 연료 상태 - 주석 없애지마! */}
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
      <Separator className="my-1" />
      
      {/* 운전자 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 hover:cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-md"  onClick={toggleDriverInfo}>
          <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">👤</div>
          </div>
          <div className="flex items-center cursor-pointer">
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
        
        {/* 연락처 복사 및 메시지 버튼 */}
        <div className="flex gap-2 py-2 px-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 h-8 hover:cursor-pointer hover:bg-gray-100" 
            onClick={handleCall}
          >
            <Phone className="h-4 w-4 mr-1" />
            <span className="text-xs">{driverInfo.contact}</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="px-3 py-1 h-8 hover:cursor-pointer hover:bg-gray-600" 
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

      {/* 배차 정보 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>배차 정보 수정</DialogTitle>
          </DialogHeader>
          <VehicleEditForm
            initialData={{
              driver: {
                name: driverInfo.name || "",
                contact: driverInfo.contact || ""
              },
              vehicle: {
                type: vehicleInfo.type || "",
                weight: vehicleInfo.weight || "",
                licensePlate: vehicleInfo.licensePlate || ""
              },
              callCenter: vehicleInfo.connection || "24시",
              specialNotes: []
            }}
            onSave={handleSaveDriverInfo}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 