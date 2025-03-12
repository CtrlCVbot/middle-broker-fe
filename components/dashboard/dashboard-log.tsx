"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/dashboard-store";
import { Activity, RefreshCw, Clock, User, PauseCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { OrderStatusType } from "@/types/order";

// 상태별 색상 및 아이콘 정의
const getStatusStyle = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return { color: 'text-gray-600 bg-gray-100', icon: <Clock className="h-3 w-3" /> };
    case '배차완료':
      return { color: 'text-blue-600 bg-blue-100', icon: <User className="h-3 w-3" /> };
    case '상차완료':
      return { color: 'text-yellow-600 bg-yellow-100', icon: <Activity className="h-3 w-3" /> };
    case '운송중':
      return { color: 'text-orange-600 bg-orange-100', icon: <Activity className="h-3 w-3" /> };
    case '하차완료':
      return { color: 'text-green-600 bg-green-100', icon: <Activity className="h-3 w-3" /> };
    case '운송마감':
      return { color: 'text-purple-600 bg-purple-100', icon: <Activity className="h-3 w-3" /> };
    default:
      return { color: 'text-gray-600 bg-gray-100', icon: <Activity className="h-3 w-3" /> };
  }
};

export function DashboardLog() {
  const router = useRouter();
  const { logs, loading, refreshLogs, filters, setAutoRefresh } = useDashboardStore();
  const [refreshCounter, setRefreshCounter] = useState(0);

  // 자동 새로고침 기능 구현
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // 자동 새로고침이 활성화되어 있으면 일정 간격으로 로그 업데이트
    if (filters.autoRefresh) {
      interval = setInterval(() => {
        refreshLogs();
        setRefreshCounter((prev) => prev + 1);
      }, 5000); // 5초마다 새로고침
    }
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filters.autoRefresh, refreshLogs]);

  // 수동 새로고침 핸들러
  const handleRefresh = () => {
    refreshLogs();
    setRefreshCounter((prev) => prev + 1);
  };

  // 자동 새로고침 토글 핸들러
  const toggleAutoRefresh = () => {
    setAutoRefresh(!filters.autoRefresh);
  };

  // 화물 상세 페이지로 이동 핸들러
  const goToOrderDetail = (orderNumber: string) => {
    router.push(`/order/list?id=${orderNumber}`);
  };

  // 상대적 시간 포맷 함수
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ko });
    } catch (error) {
      return '알 수 없음';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          운송 상태 변경 로그
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={toggleAutoRefresh}
            title={filters.autoRefresh ? "자동 새로고침 중지" : "자동 새로고침 시작"}
          >
            {filters.autoRefresh ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleRefresh}
            disabled={loading.logs}
            title="수동 새로고침"
          >
            <RefreshCw className={cn("h-4 w-4", loading.logs && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading.logs && logs.length === 0 ? (
          // 로딩 스켈레톤
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 타임라인 UI
          <div className="space-y-4">
            {logs.slice(0, 6).map((log) => {
              // 현재 상태의 스타일 가져오기
              const { color, icon } = getStatusStyle(log.currentStatus);
              return (
                <div key={log.id} className="flex space-x-3">
                  <div className={cn("rounded-full p-1 h-6 w-6 flex items-center justify-center", color)}>
                    {icon}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-sm font-medium text-primary" 
                        onClick={() => goToOrderDetail(log.orderNumber)}
                      >
                        #{log.orderNumber}
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        {log.previousStatus ? `${log.previousStatus} → ${log.currentStatus}` : log.currentStatus}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{log.description}</span>
                      <span className="font-medium">담당: {log.operator}</span>
                      <time className="text-xs text-muted-foreground" dateTime={log.timestamp}>
                        {formatRelativeTime(log.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {logs.length === 0 && !loading.logs && (
              <div className="text-center py-6 text-muted-foreground">
                로그 데이터가 없습니다.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 