"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { 
  OrderStatusType,
  ORDER_STATUS,
  getProgressPercentage, 
  isStatusAtLeast 
} from "@/types/order";
import { cn } from "@/lib/utils";

interface OrderProgressProps {
  currentStatus: OrderStatusType;
  className?: string;
}

export function OrderProgress({ currentStatus, className }: OrderProgressProps) {
  // 현재 배차 진행도 퍼센트 계산
  const progressValue = getProgressPercentage(currentStatus);
  
  // 가로 또는 세로 배열 판단 (모바일 등)
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-2">
        <Progress value={progressValue} className="h-2" />
      </div>
      
      {/* Status Labels - 모바일에서는 현재 상태만 표시 */}
      {isSmallScreen ? (
        <div className="flex justify-center items-center mt-4">
          <div 
            className={cn(
              "font-medium text-sm px-3 py-1 rounded-full",
              "bg-primary text-primary-foreground"
            )}
          >
            {currentStatus}
          </div>
        </div>
      ) : (
        <div className="flex justify-between text-xs md:text-sm mt-2">
          {ORDER_STATUS.map((status) => {
            const isActive = isStatusAtLeast(currentStatus, status);
            const isCurrent = currentStatus === status;
            
            return (
              <div 
                key={status}
                className={cn(
                  "flex flex-col items-center transition-all",
                  isActive ? "text-primary" : "text-muted-foreground",
                  isCurrent ? "font-bold scale-110" : "font-normal"
                )}
              >
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full mb-1 transition-all",
                    isActive ? "bg-primary" : "bg-muted",
                    isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                  )}
                />
                <span>{status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 반응형 상태만 따로 표시하기 위한 컴포넌트
export function OrderProgressMobile({ currentStatus }: OrderProgressProps) {
  return (
    <div className="flex items-center justify-center py-2">
      <div 
        className={cn(
          "font-medium text-sm px-3 py-1 rounded-full",
          "bg-primary/10 text-primary"
        )}
      >
        {currentStatus}
      </div>
    </div>
  );
} 