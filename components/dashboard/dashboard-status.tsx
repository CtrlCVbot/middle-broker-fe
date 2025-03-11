"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";
import { ActivitySquare, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatusType } from "@/types/order";

// 상태별 색상 및 스타일 정의
const getStatusStyle = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return { color: 'bg-emerald-500', textColor: 'text-emerald-800', iconColor: 'text-emerald-500' };
    case '배차완료':
      return { color: 'bg-orange-500', textColor: 'text-orange-800', iconColor: 'text-orange-500' };
    case '상차완료':
      return { color: 'bg-violet-500', textColor: 'text-violet-800', iconColor: 'text-violet-500' };
    case '운송중':
      return { color: 'bg-blue-500', textColor: 'text-blue-800', iconColor: 'text-blue-500' };
    case '하차완료':
      return { color: 'bg-green-500', textColor: 'text-green-800', iconColor: 'text-green-500' };
    case '정산완료':
      return { color: 'bg-purple-500', textColor: 'text-purple-800', iconColor: 'text-purple-500' };
    default:
      return { color: 'bg-gray-300', textColor: 'text-gray-800', iconColor: 'text-gray-500' };
  }
};

export function DashboardStatus() {
  const { statusStats, loading } = useDashboardStore();
  
  // 총 건수 계산
  const totalCount = !loading.statusStats ? statusStats.reduce((sum, stat) => sum + stat.count, 0) : 0;
  
  // 포맷 함수
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">배차 상태 하이라이트</CardTitle>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        {loading.statusStats ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">{formatNumber(totalCount)}건</h3>
                <div className="flex items-center text-sm text-emerald-600 font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>2.7%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">모든 화물 누적 현황</p>
            </div>
            
            {/* 프로그레스 바 그룹 */}
            <div className="flex h-2 mt-4">
              {statusStats.map((stat) => {
                const { color } = getStatusStyle(stat.status);
                return (
                  <div 
                    key={stat.status} 
                    className={cn("h-full", color)} 
                    style={{ width: `${stat.percentage}%` }}
                  />
                );
              })}
            </div>
            
            {/* 범례 */}
            <div className="flex flex-wrap gap-2 mt-2">
              {statusStats.map(({ status }) => {
                const { color } = getStatusStyle(status);
                return (
                  <div key={status} className="flex items-center text-xs">
                    <div className={cn("h-2 w-2 rounded-full mr-1", color)}></div>
                    <span>{status}</span>
                  </div>
                );
              })}
            </div>
            
            {/* 상태별 상세 */}
            <div className="mt-6 space-y-4 border-t pt-4">
              {statusStats.map((stat) => {
                const { iconColor } = getStatusStyle(stat.status);
                const isIncreasing = Math.random() > 0.5; // 데모 목적, 실제로는 이전 데이터와 비교하여 설정
                
                return (
                  <div key={stat.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn("h-2 w-2 rounded-full mr-2", getStatusStyle(stat.status).color)}></div>
                      <span className={cn("font-medium", iconColor)}>{stat.status}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{formatNumber(stat.count)}건</span>
                      <span className={cn("flex items-center text-xs", 
                        isIncreasing ? "text-emerald-600" : "text-red-600")}>
                        {isIncreasing ? 
                          <ArrowUp className="h-3 w-3 mr-0.5" /> : 
                          <ArrowDown className="h-3 w-3 mr-0.5" />
                        }
                        {Math.floor(Math.random() * 10).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 