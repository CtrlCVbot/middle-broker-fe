"use client";

import { Badge } from "@/components/ui/badge";
import { DriverStatus, TonnageType, VehicleType } from "@/types/broker-driver";
import { cn } from "@/lib/utils";

// 차주 상태 배지
interface BrokerDriverStatusBadgeProps {
  status: DriverStatus;
  className?: string;
}

export function BrokerDriverStatusBadge({ status, className }: BrokerDriverStatusBadgeProps) {
  return (
    <Badge
      variant={status === '활성' ? "default" : "destructive"}
      className={cn(
        status === '활성' ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200",
        "font-medium",
        className
      )}
    >
      {status}
    </Badge>
  );
}

// 차량 종류 배지
interface BrokerDriverVehicleTypeBadgeProps {
  type: VehicleType;
  className?: string;
}

export function BrokerDriverVehicleTypeBadge({ type, className }: BrokerDriverVehicleTypeBadgeProps) {
  // 차량 종류별 색상 설정
  const getColorByType = (type: VehicleType) => {
    switch (type) {
      case '카고':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case '윙바디':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case '냉동':
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200";
      case '탑차':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case '리프트':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        getColorByType(type),
        "font-medium",
        className
      )}
    >
      {type}
    </Badge>
  );
}

// 톤수 배지
interface BrokerDriverTonnageBadgeProps {
  tonnage: TonnageType;
  className?: string;
}

export function BrokerDriverTonnageBadge({ tonnage, className }: BrokerDriverTonnageBadgeProps) {
  // 톤수별 색상 설정
  const getColorByTonnage = (tonnage: TonnageType) => {
    if (tonnage === '1톤' || tonnage === '1.4톤') {
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
    } else if (tonnage === '2.5톤' || tonnage === '3.5톤') {
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    } else if (tonnage === '5톤' || tonnage === '8톤') {
      return "bg-violet-100 text-violet-800 hover:bg-violet-200";
    } else if (tonnage === '11톤' || tonnage === '18톤' || tonnage === '25톤') {
      return "bg-rose-100 text-rose-800 hover:bg-rose-200";
    } else {
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        getColorByTonnage(tonnage),
        "font-medium",
        className
      )}
    >
      {tonnage}
    </Badge>
  );
}

// 정산 상태 배지
interface BrokerDriverSettlementBadgeProps {
  status: '완료' | '미정산' | '-';
  className?: string;
}

export function BrokerDriverSettlementBadge({ status, className }: BrokerDriverSettlementBadgeProps) {
  // 정산 상태별 색상 설정
  const getColorByStatus = (status: '완료' | '미정산' | '-') => {
    switch (status) {
      case '완료':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case '미정산':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        getColorByStatus(status),
        "font-medium",
        className
      )}
    >
      {status}
    </Badge>
  );
} 