"use client"

import { Check, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ORDER_FLOW_STATUSES, OrderFlowStatus, isStatusAtLeast } from "@/types/order"
import { getStatusBadge, getStatusColor } from "./order-table-ver01";

interface OrderStepProgressProps {
  currentStatus: OrderFlowStatus
}

export const GROUPED_ORDER_FLOW = [
  {
    label: "운송요청",
    statuses: ["운송요청"],
  },
  {
    label: "배차중",
    statuses: ["배차대기", "배차완료"],
  },
  {
    label: "운송중",
    statuses: ["상차대기", "상차완료", "운송중"],
  },
  {
    label: "운송완료",
    statuses: ["하차완료", "운송완료"],
  },
] as const;

function getCurrentGroupIndex(currentStatus: string) {
  return GROUPED_ORDER_FLOW.findIndex(group =>
    group.statuses.includes(currentStatus as never)
  )
}

export function OrderStepProgress({ currentStatus }: OrderStepProgressProps) {
  const stepCount = ORDER_FLOW_STATUSES.length
  const currentIndex = ORDER_FLOW_STATUSES.findIndex((s) => s === currentStatus)
  const currentGroupIndex = getCurrentGroupIndex(currentStatus)
  const currentStatusLabel = currentStatus

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between relative">
        {/* 배경 선 */}
        <div className="absolute left-0 right-0 h-2 bg-gray-200 top-1/2 -translate-y-1/2 z-0 rounded-full" />

        {/* 채워진 진행 선 */}
        <div
          className="absolute left-0 h-2 bg-black top-1/2 -translate-y-1/2 z-10 transition-all duration-500 rounded-full"
          style={{
            width: `${(currentGroupIndex / (ORDER_FLOW_STATUSES.length-5)) * 100}%`
          }}
        />

        {/* 스텝 마커들 */}
        {GROUPED_ORDER_FLOW.map((group, idx) => {
          const isCurrent = idx === currentGroupIndex
          const isCompleted = idx < currentGroupIndex
          const isUpcoming = idx > currentGroupIndex
          return (
            <div key={group.label} className="flex flex-col items-center z-20 w-max">
              {/* 마커 */}
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  isCurrent ? "w-7 h-7" : isCompleted ? "w-6 h-6" : "w-5 h-5"
                )}
              >
                {/* 현재 상태: 점멸 + 컬러 */}
                {isCurrent && (
                  <>
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full animate-pulse-scale",
                      "bg-" + getStatusColor(currentStatus) + "-500"
                    )}
                  />
                  <Truck size={18} className="text-white z-10 animate-pulse-scale" />
                  </>
                )}

                {/* 완료 상태: 검정 원 + 체크 */}
                {isCompleted && !isCurrent && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-black" />
                    <Check size={14} className="text-white z-10" />
                  </>
                )}

                {/* 미래 상태: 회색 원 */}
                {!isCompleted && !isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-gray-200" />
                )}
              </div>

              {/* 텍스트 */}
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  isCurrent
                    ? "text-" + getStatusColor(currentStatus) + "-500 font-bold text-md"
                    : isCompleted
                    ? "text-black"
                    : "text-gray-400"
                )}
              >
                {group.label}
                {group.label !== currentStatus && isCurrent && `(${currentStatus})`}
              </span>
            </div>
          )
        })}

        
      </div>
    </div>
  )
}
