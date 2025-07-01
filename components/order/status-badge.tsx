import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OrderStatusType, ORDER_STATUS, getProgressPercentage } from "@/types/order";
import { getStatusColor } from "@/utils/mockdata/mock-order-edit";

interface StatusBadgeProps {
  status: OrderStatusType;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ 
  status, 
  showProgress = false,
  size = "md", 
  className 
}: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  
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
          value={getProgressPercentage(status)} 
          className="h-1.5 w-full" 
        />
      )}
    </div>
  );
}

// 배차 상태의 전체 흐름을 표시하는 컴포넌트
export function StatusFlow({ currentStatus }: { currentStatus: OrderStatusType }) {
  const currentIndex = ORDER_STATUS.indexOf(currentStatus);
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ORDER_STATUS.map((status, index) => {
        // 현재 상태는 강조, 이전 상태는 완료, 이후 상태는 비활성화
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        //const isPending = index > currentIndex;
        
        let badgeClass = "";
        if (isActive) {
          badgeClass = getStatusColor(status); // 현재 상태는 색상 적용
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
            {index < ORDER_STATUS.length - 1 && (
              <div className="w-4 h-px bg-gray-300 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
} 