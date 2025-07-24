import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BrokerOrderStatusType, BROKER_ORDER_STATUS, getBrokerProgressPercentage } from "@/types/broker-order";
import { SquareCheckBig } from "lucide-react";

// 중개 화물 상태에 따른 색상 클래스 반환 함수
export const getBrokerStatusColor = (status: BrokerOrderStatusType): string => {
  switch (status) {
    case "배차대기":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "배차완료":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "상차완료":
    case "상차대기":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
    case "운송중":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "하차완료":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "운송완료":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

interface BrokerStatusBadgeProps {
  status: BrokerOrderStatusType;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrokerStatusBadge({ 
  status, 
  showProgress = false,
  size = "md", 
  className 
}: BrokerStatusBadgeProps) {
  const colorClass = getBrokerStatusColor(status);
  
  // 크기에 따른 스타일 클래스
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  };
  
  return (
    <div className="space-y-1">
      <Badge 
        variant="outline" 
        className={cn(
          colorClass, 
          sizeClasses[size], 
          "font-medium border-transparent",
          className
        )}
      >
        
        {status}
      </Badge>
      
      {showProgress && (
        <Progress 
          value={getBrokerProgressPercentage(status)} 
          className="h-1.5 w-full" 
        />
      )}
    </div>
  );
}

// 중개 화물 상태의 전체 흐름을 표시하는 컴포넌트
export function BrokerStatusFlow({ currentStatus }: { currentStatus: BrokerOrderStatusType }) {
  const currentIndex = BROKER_ORDER_STATUS.indexOf(currentStatus);
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {BROKER_ORDER_STATUS.map((status, index) => {
        // 현재 상태는 강조, 이전 상태는 완료, 이후 상태는 비활성화
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;
        
        let badgeClass = "";
        if (isActive) {
          badgeClass = getBrokerStatusColor(status); // 현재 상태는 색상 적용
        } else if (isCompleted) {
          badgeClass = "bg-gray-100 text-gray-800"; // 완료된 상태
        } else {
          badgeClass = "bg-gray-50 text-gray-400"; // 미완료 상태
        }
        
        return (
          <div key={status} className="flex items-center">
            <Badge 
              variant="outline" 
              className={cn(
                badgeClass,
                "px-2 py-0.5 text-xs font-medium border-transparent",
                isActive && "ring-1 ring-offset-1 ring-offset-white"
              )}
            >
              {status}
            </Badge>
            
            {/* 구분선 (마지막 항목 제외) */}
            {index < BROKER_ORDER_STATUS.length - 1 && (
              <div className="w-4 h-px bg-gray-300 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
} 