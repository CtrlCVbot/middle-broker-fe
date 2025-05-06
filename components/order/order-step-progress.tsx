// components/OrderStepProgress.tsx

"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ORDER_FLOW_STATUSES, OrderFlowStatus, getProgressPercentage, isStatusAtLeast } from "@/types/order1"
import { Progress } from "@radix-ui/react-progress"

interface OrderStepProgressProps {
  currentStatus: OrderFlowStatus
}

export function OrderStepProgress({ currentStatus }: OrderStepProgressProps) {
  // 현재 배차 진행도 퍼센트 계산
  const progressValue = getProgressPercentage(currentStatus);
  return (
    <div className="flex items-center justify-between w-full px-4 py-2">
      {ORDER_FLOW_STATUSES.map((status, idx) => {
        const isCompleted = isStatusAtLeast(currentStatus, status)
        const isCurrent = currentStatus === status
        const isLast = idx === ORDER_FLOW_STATUSES.length - 1

        return (
          <>
          <div className="mb-2">
            <Progress value={progressValue} className="h-2" />
          </div>
          <div key={status} className="flex items-center w-full">
            {/* Step Marker */}
            <div className="relative flex flex-col items-center text-center w-16">
              <div className="relative w-6 h-6 flex items-center justify-center rounded-full z-10">
                {/* 배경 원 */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    isCurrent
                      ? "bg-blue-500 animate-pulse-scale"
                      : isCompleted
                      ? "bg-black"
                      : "bg-gray-300"
                  )}
                />
                {/* 체크 아이콘 또는 텍스트 */}
                {isCompleted && !isCurrent ? (
                  <Check size={14} className="text-white z-20" />
                ) : (
                  <span
                    className={cn(
                      "text-xs z-20",
                      isCurrent ? "text-white" : isCompleted ? "text-white" : "text-gray-400"
                    )}
                  >
                    {isCurrent ? "" : ""}
                  </span>
                )}
              </div>
              {/* 상태 텍스트 */}
              <div
                className={cn(
                  "mt-2 text-xs",
                  isCurrent
                    ? "text-blue-500 font-bold"
                    : isCompleted
                    ? "text-black"
                    : "text-gray-400"
                )}
              >
                {status}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "h-1 flex-1 mx-1 mt-3 rounded-sm",
                  isStatusAtLeast(currentStatus, ORDER_FLOW_STATUSES[idx + 1])
                    ? "bg-black"
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
          </>
        )
      })}
    </div>
  )
}
