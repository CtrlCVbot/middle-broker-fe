import React from "react";
import { IBrokerOrderLog } from "@/types/broker-order";
import { BrokerStatusBadge } from "./broker-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, User, MessageSquare } from "lucide-react";

interface BrokerOrderStatusLogProps {
  logs: IBrokerOrderLog[];
}

export function BrokerOrderStatusLog({ logs }: BrokerOrderStatusLogProps) {
  // 로그가 없는 경우 처리
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">상태 변경 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">상태 변경 이력이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">상태 변경 이력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.map((log, index) => (
          <div 
            key={`${log.status}-${index}`} 
            className="relative pl-6 pb-6 last:pb-0"
          >
            {/* 타임라인 라인 (마지막 항목 제외) */}
            {index < logs.length - 1 && (
              <div className="absolute left-[11px] top-7 bottom-0 w-[1px] bg-border" />
            )}
            
            {/* 상태 배지와 시간 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-background border-2 border-primary" />
              
              <div className="flex items-center gap-2">
                <BrokerStatusBadge status={log.status} size="sm" />
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {log.date} {log.time}
                </div>
              </div>
              
              {/* 처리자 정보 */}
              {log.handler && (
                <div className="flex items-center text-xs text-muted-foreground ml-0 sm:ml-auto">
                  <User className="h-3 w-3 mr-1" />
                  처리자: {log.handler}
                </div>
              )}
            </div>
            
            {/* 위치 정보 */}
            {log.location && (
              <div className="flex items-start gap-1 text-sm ml-1 mb-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <span>{log.location}</span>
              </div>
            )}
            
            {/* 비고 */}
            {log.remark && (
              <div className="flex items-start gap-1 text-sm ml-1">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{log.remark}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 