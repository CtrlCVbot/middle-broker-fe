"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  Truck, 
  MapPin,
  Building, 
  FileText,
  Calendar,
  Clock
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { IBrokerDriver } from "@/types/broker-driver";
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { BrokerDriverContextMenu } from "./broker-driver-context-menu";
import { 
  BrokerDriverStatusBadge, 
  BrokerDriverVehicleTypeBadge, 
  BrokerDriverTonnageBadge,
  BrokerDriverSettlementBadge
} from "./broker-driver-status-badge";
import { cn, formatDate } from "@/lib/utils";

interface BrokerDriverCardProps {
  driver: IBrokerDriver;
  onDriverClick: (driver: IBrokerDriver) => void;
}

export function BrokerDriverCard({ driver, onDriverClick }: BrokerDriverCardProps) {
  const { selectedDriverIds, toggleDriverSelection } = useBrokerDriverStore();
  const isSelected = selectedDriverIds.includes(driver.id);

  // 차주 이름에서 첫 글자 가져오기
  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  // 체크박스 클릭 핸들러 (이벤트 버블링 방지)
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDriverSelection(driver.id);
  };

  return (
    <BrokerDriverContextMenu
      driver={driver}
      onEdit={() => onDriverClick(driver)}
      onDelete={() => alert(`${driver.name} 차주를 삭제하시겠습니까?`)}
      onStatusChange={(d, newStatus) => alert(`${d.name} 차주 상태를 ${newStatus}로 변경하시겠습니까?`)}
      onViewDispatch={() => alert(`${driver.name} 차주의 배차 이력을 조회합니다.`)}
      onViewSettlement={() => alert(`${driver.name} 차주의 정산 내역을 조회합니다.`)}
    >
      <Card 
        className={cn(
          "h-full cursor-pointer transition-all hover:border-primary",
          isSelected && "border-primary bg-primary/5",
          !driver.isActive && "bg-muted/30"
        )}
        onClick={() => onDriverClick(driver)}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => toggleDriverSelection(driver.id)}
                onClick={handleCheckboxClick}
                aria-label={`${driver.name} 선택`}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{driver.name}</CardTitle>
                  <BrokerDriverStatusBadge status={driver.status} className="ml-1" />
                </div>
                <CardDescription className="text-xs mt-1">{driver.code}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback className="text-primary bg-primary/10">
                  {getInitials(driver.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{driver.phoneNumber}</span>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-blue-600 hover:underline cursor-pointer">
                  {driver.vehicleNumber}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <BrokerDriverVehicleTypeBadge type={driver.vehicleType} />
                  <BrokerDriverTonnageBadge tonnage={driver.tonnage} />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              <span className="line-clamp-2">{driver.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {driver.companyName} 
                {driver.businessNumber && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({driver.businessNumber})
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col items-start gap-2 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>등록: {driver.createdAt ? formatDate(driver.createdAt) : '-'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                최근 배차: {driver.lastDispatchedAt 
                  ? formatDate(driver.lastDispatchedAt) 
                  : '-'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {driver.dispatchCount}회
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>총 배차 횟수</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <BrokerDriverSettlementBadge status={driver.lastSettlementStatus} />
          </div>
        </CardFooter>
      </Card>
    </BrokerDriverContextMenu>
  );
}

export function BrokerDriverCardGrid({ 
  drivers, 
  onDriverClick 
}: { 
  drivers: IBrokerDriver[], 
  onDriverClick: (driver: IBrokerDriver) => void 
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
      {drivers.map((driver) => (
        <BrokerDriverCard
          key={driver.id}
          driver={driver}
          onDriverClick={onDriverClick}
        />
      ))}
    </div>
  );
} 