import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IBrokerOrder } from "@/types/broker-order";
import { BrokerStatusBadge } from "./broker-status-badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Calendar, Truck, User, ArrowRight } from "lucide-react";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";

interface BrokerOrderCardProps {
  order: IBrokerOrder;
}

export function BrokerOrderCard({ order }: BrokerOrderCardProps) {
  // 상세 정보 모달을 위한 스토어 액세스
  const { openSheet } = useBrokerOrderDetailStore();
  
  // 화물 상세 정보 열기
  const handleOrderClick = () => {
    openSheet(order.id);
  };
  
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* 헤더 - 화물 ID 및 상태 */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-primary underline cursor-pointer" onClick={handleOrderClick}>
            {order.id}
          </h3>
          <BrokerStatusBadge status={order.status} size="sm" />
        </div>
        
        {/* 출발지 정보 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>출발지</span>
          </div>
          <p className="text-sm font-medium truncate" title={order.departureLocation}>
            {order.departureLocation}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{order.departureDateTime}</span>
          </div>
        </div>
        
        {/* 화살표 */}
        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* 도착지 정보 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>도착지</span>
          </div>
          <p className="text-sm font-medium truncate" title={order.arrivalLocation}>
            {order.arrivalLocation}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{order.arrivalDateTime}</span>
          </div>
        </div>
        
        {/* 차량 및 운전자 정보 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>차량</span>
            </div>
            <p className="text-sm">
              {order.vehicle.type} {order.vehicle.weight}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>차주</span>
            </div>
            <p className="text-sm">
              {order.driver.name || "-"}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-4">
        <div className="text-sm font-medium">
          {formatCurrency(order.amount)}원
        </div>
        <Button variant="outline" size="sm" onClick={handleOrderClick}>
          상세보기
        </Button>
      </CardFooter>
    </Card>
  );
} 