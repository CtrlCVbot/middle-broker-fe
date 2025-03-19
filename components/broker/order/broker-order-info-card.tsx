import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ArrowRight, Package, User, ChevronDown, ChevronUp, Factory } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LocationInfo {
  address: string;
  name?: string;
  contact?: string;
  dateTime: string;
}

interface CargoInfo {
  type: string;
  options?: string[];
  weight?: string;
  remark?: string;
  vehicleType?: string;
}

interface ShipperInfo {
  name: string;
  manager: string;
  contact: string;
  email: string;
}

interface BrokerOrderInfoCardProps {
  departure: {
    address: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  destination: {
    address: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  cargo: CargoInfo;
  shipper: ShipperInfo;
}

export function BrokerOrderInfoCard({ departure, destination, cargo, shipper }: BrokerOrderInfoCardProps) {
  const [isShipperInfoOpen, setIsShipperInfoOpen] = useState(true);

  // 날짜와 시간을 합쳐서 dateTime 형식으로 변환
  const departureDateTime = `${departure.date} ${departure.time}`;
  const destinationDateTime = `${destination.date} ${destination.time}`;

  return (
    <div className="space-y-4">


      {/* 화주 정보 */}
      <div>        
            <button 
            className="flex items-center justify-between w-full"
            onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
          >
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              <h4 className="font-medium">화주 정보</h4>
            </div>
            {isShipperInfoOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {isShipperInfoOpen && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">화주명</div>
              <div className="col-span-2 font-medium">{shipper.name}</div>
              
              <div className="text-muted-foreground">담당자</div>
              <div className="col-span-2 font-medium">{shipper.manager} / {shipper.contact}</div>
              <div className="text-muted-foreground">이메일</div>
              <div className="col-span-2 font-medium">{shipper.email}</div>
            </div>
          )}
      </div>

      {/* 분리선 */}
      <Separator className="my-4" />

      {/* 상/하차지 정보*/}
      <div>      
          <div className="space-y-3">
            {/* 상차지 정보 */}
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h4 className="font-medium">상/하차 정보</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">상차 주소</div>
              <div className="col-span-2 font-bold">{departure.address}</div>

              <div className="text-muted-foreground">하차 주소</div>
              <div className="col-span-2 font-bold">{destination.address}</div>

              <div className="text-muted-foreground">상차 일시</div>
              <div className="col-span-2 font-medium">{departureDateTime}</div>

              <div className="text-muted-foreground">하차 일시</div>
              <div className="col-span-2 font-medium">{destinationDateTime}</div>
              
              {departure.name && (
                <>
                  <div className="text-muted-foreground">상차 담당</div>
                  <div className="col-span-2 font-medium">
                    {departure.name}
                    {departure.contact && ` / ${departure.contact}`}
                  </div>
                </>
              )}
              
              {destination.name && (
                <>
                  <div className="text-muted-foreground">하차 담당</div>
                  <div className="col-span-2 font-medium">
                    {destination.name}
                    {destination.contact && ` / ${destination.contact}`}
                  </div>
                </>
              )}
              
              
            </div>
          </div>
      </div>

      {/* 분리선 */}
      <Separator className="my-4" />

      {/* 화물 정보 */}
      <div>
        
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h4 className="font-medium">화물 상세</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm py-2">
            
            
            <div className="text-muted-foreground">운송 옵션</div>
            <div className="col-span-2 font-medium">
              <div className="flex flex-wrap items-center gap-2">
                {cargo.vehicleType && (
                  <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {cargo.vehicleType}
                  </span>
                )}
                {cargo.weight && (
                  <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {cargo.weight}
                  </span>
                )}
                {cargo.options && cargo.options.length > 0 && cargo.options.map((option, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-muted-foreground">화물 종류</div>
            <div className="col-span-2 font-medium">{cargo.type}</div>
            
            {cargo.remark && (
              <>
                <div className="text-muted-foreground">비고</div>
                <div className="col-span-2 font-medium text-xs">
                  {cargo.remark}
                </div>
              </>
            )}
          </div>
      </div>
      
    </div>
  );
} 