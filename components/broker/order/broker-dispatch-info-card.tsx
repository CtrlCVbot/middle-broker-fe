"use client";

//react
import React, { useState } from "react";

//ui
import { toast } from "@/components/ui/use-toast";

//types
import { BrokerOrderStatusType } from "@/types/broker-order";

//component
import { VehicleCard } from "./broker-dispatch-info-vehicle-card-ver01";


interface VehicleInfo {
  id?: string;
  type: string;
  weight?: string;
  licensePlate?: string;
  connection?: string;
  driver?: {
    name: string;
    contact: string;
  };
}

interface DriverInfo {
  name: string;
  contact?: string;
  company?: string;
  carModel?: string;
}

interface BrokerOrderDriverInfoCardProps {
  dispatchId: string;
  vehicle: VehicleInfo;
  status: BrokerOrderStatusType;
  amount: string;
  driver: DriverInfo;
  onSendMessage: () => void;
  onSaveDriverInfo?: (data: any) => void;
  isSaleClosed?: boolean; // 추가
}

// 목업 데이터 - 위치 정보
const locationData = {
  departure: { name: "서울시 중구 을지로 123" },
  destination: { name: "대구시 중구 동성로 456" },
  current: { name: "경기도 용인시 처인구" }
};

export function BrokerOrderDriverInfoCard({ 
  dispatchId,
  vehicle, 
  status, 
  amount, 
  driver, 
  onSendMessage,
  onSaveDriverInfo,
  isSaleClosed = false // 기본값 false
}: BrokerOrderDriverInfoCardProps) {
  const [isMapVisible, setIsMapVisible] = useState(false);

  const dispatchVehicleInfo = {    
    id: vehicle?.id || "",
    vehicleInfo: {
      type: vehicle?.type || "",
      weight: vehicle?.weight || "",
      licensePlate: vehicle?.licensePlate || "",
      connection: vehicle?.connection || ""
    },
    driverInfo: {
      name: driver?.name || "",
      contact: driver?.contact || "",
      role: "",//orderData?.vehicle?.driver?.role,
      avatar: "/images/driver-placeholder.png"//orderData?.vehicle?.driver?.avatar,
    }
  }
  console.log("dispatchVehicleInfo:", dispatchVehicleInfo);
  
  // 배차 전 상태인지 확인 (배차대기 상태이고 차주 정보가 없는 경우)
  //const isBeforeAssignment = status === '배차대기' || !vehicle.driver;
  const isBeforeAssignment = !vehicle.driver;
  
  // 배차 알림 전송 함수
  const handleSendAlert = () => {
    alert("배차 알림이 전송되었습니다.");
  };
  
  // 배차 진행 함수
  const handleAssignment = () => {
    alert("배차 진행 페이지로 이동합니다.");
  };
  
  // 지도 토글 함수
  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };
  
  // 문자열 금액을 숫자로 변환 (콤마 제거)
  const amountNumber = parseInt(amount.replace(/,/g, ''), 10) || 0;

  // 배차 정보 저장 핸들러
  const handleSaveDriverInfo = (data: any) => {
    if (onSaveDriverInfo) {
      onSaveDriverInfo(data);
    } else {
      toast({
        title: "배차 정보 수정",
        description: "배차 정보가 성공적으로 수정되었습니다.",
      });
    }
  };
  console.log("isBeforeAssignment:", isBeforeAssignment);
  
  return (
    <div className="space-y-4">
      {/* {isBeforeAssignment ? (
        // 배차 전 상태 UI
        
          // <div className="p-4">
          //   <div className="flex items-center gap-2 text-amber-500 mb-3">
          //     <AlertTriangle className="h-5 w-5" />
          //     <h4 className="font-medium">아직 배차가 완료되지 않았습니다.</h4>
          //   </div>
            
          //   <div className="space-y-4">
              
          //     <Button 
          //       className="w-full" 
          //       onClick={handleAssignment}
          //     >
          //       배차 진행하기
          //     </Button>
          //   </div>
          // </div>

          <div className="flex flex-col items-center justify-center py-8 border-4 border-dashed border-gray-500 rounded-md bg-gray-200">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">아직 배차되지 않았습니다.</p>
            <div className="flex gap-2">                            
              <Button 
                type="button" 
                onClick={handleAssignment}
              >
                <Truck className="h-4 w-4 mr-2" />
                배차 정보 입력하기
              </Button>
            </div>
          </div>
        
      ) : (
        // 배차 후 상태 UI
        <>
          
        </>
      )} */}
      {/* 차주 및 차량 정보 */}          
      <div className="space-y-2 rounded-lg border border-gray-100 shadow-sm">
            {/* 차주 정보 */}
            <VehicleCard
              dispatchId={dispatchId}
              vehicleInfo={{
                id: dispatchVehicleInfo.id, // id 필드 추가
                ...dispatchVehicleInfo.vehicleInfo
              }}
              driverInfo={dispatchVehicleInfo.driverInfo}
              onMessage={onSendMessage}
              onSaveDriverInfo={handleSaveDriverInfo}
              isSaleClosed={isSaleClosed} // 전달
            />
          </div>
    </div>
  );
} 