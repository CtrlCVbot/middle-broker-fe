import React from "react";

import { Truck } from "lucide-react";

interface VehicleInfo {
  type: string;
  weight?: string;
  licensePlate?: string;
}

interface BrokerOrderVehicleInfoCardProps {
  vehicle: VehicleInfo;
}

export function BrokerOrderVehicleInfoCard({ vehicle }: BrokerOrderVehicleInfoCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        <h4 className="font-medium">차량 정보</h4>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-muted-foreground">차량 종류</div>
        <div className="col-span-2 font-medium">{vehicle.type || "정보 없음"}</div>
        
        {vehicle.weight && (
          <>
            <div className="text-muted-foreground">중량</div>
            <div className="col-span-2 font-medium">{vehicle.weight}</div>
          </>
        )}
        
        {vehicle.licensePlate && (
          <>
            <div className="text-muted-foreground">차량 번호</div>
            <div className="col-span-2 font-medium">{vehicle.licensePlate}</div>
          </>
        )}
      </div>
    </div>
  );
} 