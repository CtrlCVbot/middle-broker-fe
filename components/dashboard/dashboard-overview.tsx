"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";
import { BarChart3, TruckIcon, Wallet, CalendarCheck } from "lucide-react";

export function DashboardOverview() {
  const { kpi, loading } = useDashboardStore();
  
  // 숫자 포맷 함수
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };
  
  // 화폐 포맷 함수
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(num);
  };
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 월간 운송 건수 카드 */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TruckIcon className="h-4 w-4 mr-2" />
            이번 달 누적 운송 건수
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.kpi ? (
            <Skeleton className="h-10 w-24 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold">{kpi ? formatNumber(kpi.monthlyOrderCount) : 0} 건</div>
          )}
          {kpi && !loading.kpi && (
            <p className="text-xs text-white/80 mt-1">
              목표 {formatNumber(kpi.monthlyTarget.target)}건 중 
              {kpi.monthlyTarget.percentage}% 진행
            </p>
          )}
        </CardContent>
      </Card>

      {/* 월간 운송 비용 카드 */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            이번 달 총 운송 비용
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.kpi ? (
            <Skeleton className="h-10 w-28 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold">{kpi ? formatCurrency(kpi.monthlyOrderAmount) : '₩0'}</div>
          )}
          {kpi && !loading.kpi && (
            <p className="text-xs text-white/80 mt-1">
              운송 건당 평균: {formatCurrency(kpi.monthlyOrderAverage)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 평균 운송비 카드 */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            월 평균 운송 비용
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.kpi ? (
            <Skeleton className="h-10 w-28 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold">{kpi ? formatCurrency(kpi.monthlyOrderAverage) : '₩0'}</div>
          )}
          {kpi && !loading.kpi && (
            <p className="text-xs text-white/80 mt-1">
              건당 평균 운송 비용
            </p>
          )}
        </CardContent>
      </Card>

      {/* 월간 목표 진행률 카드 */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CalendarCheck className="h-4 w-4 mr-2" />
            월간 목표 진행률
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.kpi ? (
            <Skeleton className="h-10 w-28 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold">{kpi ? `${kpi.monthlyTarget.percentage}%` : '0%'}</div>
          )}
          {kpi && !loading.kpi && (
            <div className="mt-2">
              <Progress value={kpi.monthlyTarget.percentage} className="h-2 bg-white/20" />
              <p className="text-xs text-white/80 mt-1">
                {kpi.monthlyTarget.current}/{kpi.monthlyTarget.target} 건 완료
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 