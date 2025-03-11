"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";
import { ActivitySquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatusType } from "@/types/order";

// 상태별 색상 및 스타일 정의
const getStatusStyle = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return { color: 'bg-gray-400', textColor: 'text-gray-800', badgeVariant: 'outline' };
    case '배차완료':
      return { color: 'bg-blue-500', textColor: 'text-blue-800', badgeVariant: 'secondary' };
    case '상차완료':
      return { color: 'bg-yellow-500', textColor: 'text-yellow-800', badgeVariant: 'default' };
    case '운송중':
      return { color: 'bg-orange-500', textColor: 'text-orange-800', badgeVariant: 'default' };
    case '하차완료':
      return { color: 'bg-green-500', textColor: 'text-green-800', badgeVariant: 'success' };
    case '정산완료':
      return { color: 'bg-purple-500', textColor: 'text-purple-800', badgeVariant: 'outline' };
    default:
      return { color: 'bg-gray-300', textColor: 'text-gray-800', badgeVariant: 'outline' };
  }
};

export function DashboardStatus() {
  const { statusStats, loading } = useDashboardStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ActivitySquare className="h-5 w-5 mr-2" />
          배차 상태별 진행률
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading.statusStats ? (
          // 로딩 스켈레톤
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          // 실제 상태 데이터
          statusStats.map((stat) => {
            const { color, textColor, badgeVariant } = getStatusStyle(stat.status);
            return (
              <div key={stat.status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium">{stat.status}</span>
                    <Badge 
                      variant={badgeVariant as any} 
                      className={cn("ml-2 text-xs font-normal", textColor)}
                    >
                      {stat.count}건
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.percentage}%</span>
                </div>
                <Progress value={stat.percentage} className={cn("h-2", color)} />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
} 