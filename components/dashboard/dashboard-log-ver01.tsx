"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

//ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, Clock, User, PauseCircle, PlayCircle, CircleFadingPlus, SquarePen, Truck, HandCoins, SquareX} from "lucide-react";

//store
import { useDashboardStore } from "@/store/dashboard-store";

//utils
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

//types
import { OrderStatusType } from "@/types/order";

// 상태별 색상 및 아이콘 정의
const getStatusStyle = (status: string) => {
  switch (status) {
    case '요청':
      return { color: 'text-gray-600 bg-gray-100', icon: <CircleFadingPlus className="h-3 w-3" /> };
    case '상태변경':
      return { color: 'text-blue-600 bg-blue-100', icon: <SquarePen className="h-3 w-3" /> };
    case '배차정보변경':
      return { color: 'text-yellow-600 bg-yellow-100', icon: <Truck className="h-3 w-3" /> };
    case '운임변경':
      return { color: 'text-orange-600 bg-orange-100', icon: <HandCoins className="h-3 w-3" /> };
    case '취소':
      return { color: 'text-green-600 bg-green-100', icon: <SquareX className="h-3 w-3" /> };    
    default:
      return { color: 'text-gray-600 bg-gray-100', icon: <Activity className="h-3 w-3" /> };
  }
};

export function DashboardLog() {
  const router = useRouter();
  const { logs, loading, refreshLogs, filters, setAutoRefresh, error } = useDashboardStore();
  const [refreshCounter, setRefreshCounter] = useState(0);

  // 자동 새로고침 기능 구현
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // 자동 새로고침이 활성화되어 있으면 일정 간격으로 로그 업데이트
    if (filters.autoRefresh) {
      interval = setInterval(async () => {
        await refreshLogs();
        setRefreshCounter((prev) => prev + 1);
      }, 30000); // 30초마다 새로고침 (API 호출 부담 고려)
    }
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filters.autoRefresh, refreshLogs]);

  // 수동 새로고침 핸들러
  const handleRefresh = async () => {
    await refreshLogs();
    setRefreshCounter((prev) => prev + 1);
  };

  // 자동 새로고침 토글 핸들러
  const toggleAutoRefresh = () => {
    setAutoRefresh(!filters.autoRefresh);
  };

  // 화물 상세 페이지로 이동 핸들러
  const goToOrderDetail = (orderNumber: string) => {
    // orderNumber가 짧은 경우 (UUID slice) 전체 orderId를 찾아서 이동
    router.push(`/order/list?search=${orderNumber}`);
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
    <Card className="flex flex-col h-full">
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
            <RefreshCw className={cn("h-4 w-4", (loading.logs || filters.autoRefresh) && "animate-spin")} />
            
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
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
        ) : error ? (
          // 에러 상태
          <div className="text-center py-6">
            <Activity className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-destructive font-medium">데이터 로딩 중 오류가 발생했습니다</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              다시 시도
            </Button>
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
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>변경 이력이 없습니다.</p>
                <p className="text-sm mt-1">화물 등록, 상태 변경 등의 활동이 기록됩니다.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 