import React from "react";
import { Progress } from "@/components/ui/progress";
import { BrokerOrderStatusType, BROKER_ORDER_STATUS, getBrokerProgressPercentage } from "@/types/broker-order";
import { getBrokerStatusColor } from "./broker-status-badge";

interface BrokerOrderProgressProps {
  currentStatus: BrokerOrderStatusType;
}

export function BrokerOrderProgress({ currentStatus }: BrokerOrderProgressProps) {
  const progressPercentage = getBrokerProgressPercentage(currentStatus);
  const currentIndex = BROKER_ORDER_STATUS.indexOf(currentStatus);
  
  return (
    <div className="space-y-4">
      {/* 진행 상태 바 */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>배차대기</span>
          <span>운송마감</span>
        </div>
      </div>
      
      {/* 상태 단계 표시 */}
      <div className="flex items-center justify-between">
        {BROKER_ORDER_STATUS.map((status, index) => {
          // 현재 상태는 강조, 이전 상태는 완료, 이후 상태는 비활성화
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <div 
              key={status} 
              className="flex flex-col items-center"
              style={{ width: `${100 / BROKER_ORDER_STATUS.length}%` }}
            >
              <div 
                className={`
                  w-3 h-3 rounded-full mb-1
                  ${isActive ? getBrokerStatusColor(status).replace('bg-', 'bg-').replace('text-', '').replace('hover:bg-', '') : ''}
                  ${isCompleted ? 'bg-gray-400' : ''}
                  ${isPending ? 'bg-gray-200' : ''}
                `}
              />
              <span 
                className={`
                  text-xs text-center
                  ${isActive ? 'font-medium' : ''}
                  ${isPending ? 'text-muted-foreground' : ''}
                `}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 