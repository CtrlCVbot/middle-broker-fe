"use client";

import React, { useEffect, useRef } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { IOrderLog, OrderStatusType } from "@/types/order-ver01";
import { cn } from "@/lib/utils";
import { 
  ClipboardList, 
  Truck, 
  Package, 
  Navigation, 
  Package2, 
  CreditCard,
  Clock
} from "lucide-react";

interface OrderStatusLogProps {
  logs: IOrderLog[];
  className?: string;
}

// 상태별 아이콘 맵핑
const statusIcons: Record<OrderStatusType, React.ReactNode> = {
  '배차대기': <ClipboardList className="h-4 w-4" />,
  '배차완료': <Truck className="h-4 w-4" />,
  '상차완료': <Package className="h-4 w-4" />,
  '운송중': <Navigation className="h-4 w-4" />,
  '하차완료': <Package2 className="h-4 w-4" />,
  '운송마감': <CreditCard className="h-4 w-4" />
};

// 상태별 색상 맵핑
const statusColors: Record<OrderStatusType, string> = {
  '배차대기': 'bg-slate-100 text-slate-600',
  '배차완료': 'bg-blue-100 text-blue-600',
  '상차완료': 'bg-green-100 text-green-600',
  '운송중': 'bg-amber-100 text-amber-600',
  '하차완료': 'bg-violet-100 text-violet-600',
  '운송마감': 'bg-emerald-100 text-emerald-600'
};

export function OrderStatusLog({ logs, className }: OrderStatusLogProps) {
  const logsRef = useRef<HTMLDivElement>(null);
  
  // 자동 스크롤 (새 로그가 추가되면 스크롤 아래로 이동)
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);
  
  // 반응형 화면 크기 확인
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  return (
    <div className={cn("w-full", className)}>
      {/* 모바일에서는 Accordion 사용, 데스크톱에서는 기본적으로 펼쳐짐 */}
      {isSmallScreen ? (
        <Accordion type="single" collapsible defaultValue="">
          <AccordionItem value="logs" className="border-none">
            <AccordionTrigger className="py-2">
              화물 상태 변화 로그 ({logs.length}건)
            </AccordionTrigger>
            <AccordionContent>
              <div 
                ref={logsRef}
                className="max-h-[250px] overflow-y-auto space-y-3 p-2"
              >
                {logs.map((log, index) => (
                  <StatusLogItem key={index} log={log} isLatest={index === logs.length - 1} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-medium">화물 상태 변화 로그 ({logs.length}건)</h3>
          <div 
            ref={logsRef}
            className="max-h-[300px] overflow-y-auto space-y-3 p-2"
          >
            {logs.map((log, index) => (
              <StatusLogItem key={index} log={log} isLatest={index === logs.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 상태 로그 아이템 컴포넌트
interface StatusLogItemProps {
  log: IOrderLog;
  isLatest?: boolean;
}

function StatusLogItem({ log, isLatest = false }: StatusLogItemProps) {
  return (
    <div 
      className={cn(
        "p-3 rounded-lg transition-all flex gap-3",
        statusColors[log.status],
        isLatest ? "ring-2 ring-offset-2 ring-primary/30" : "opacity-80"
      )}
    >
      <div>
        {statusIcons[log.status]}
      </div>
      <div className="flex-1">
        <div className="font-medium">
          {log.status}
          {log.handler && (
            <span className="text-xs font-normal ml-2">({log.handler})</span>
          )}
        </div>
        
        <div className="text-xs mt-1 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {log.date} {log.time}
          {log.location && (
            <span className="ml-2">| {log.location}</span>
          )}
        </div>
        
        {log.remark && (
          <div className="text-xs mt-1 bg-white/50 p-1 rounded">
            {log.remark}
          </div>
        )}
      </div>
    </div>
  );
} 