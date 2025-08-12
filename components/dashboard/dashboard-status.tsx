"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";
import { MoreVertical, ArrowUp, ArrowDown, TrendingUp, Package, Truck, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupLabel } from "@/types/order";
import { getCurrentUser } from "@/utils/auth";
import { ymd } from "@/lib/date-kst";
import { useEffect, useState } from "react";

// 그룹별 색상 및 스타일 정의 (더 세련된 색상 팔레트)
const getGroupStyle = (label: GroupLabel) => {
  switch (label) {
    case "운송요청":
      return { 
        color: "bg-amber-500", 
        textColor: "text-amber-700", 
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        hoverColor: "hover:bg-amber-100"
      };
    case "배차중":
      return { 
        color: "bg-emerald-500", 
        textColor: "text-emerald-700", 
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        hoverColor: "hover:bg-emerald-100"
      };
    case "운송중":
      return { 
        color: "bg-blue-500", 
        textColor: "text-blue-700", 
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        hoverColor: "hover:bg-blue-100"
      };
    case "운송완료":
      return { 
        color: "bg-purple-500", 
        textColor: "text-purple-700", 
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        hoverColor: "hover:bg-purple-100"
      };
    default:
      return { 
        color: "bg-gray-500", 
        textColor: "text-gray-700", 
        iconColor: "text-gray-500",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        hoverColor: "hover:bg-gray-100"
      };
  }
};

// 그룹별 아이콘 매핑
const getGroupIcon = (label: GroupLabel) => {
  switch (label) {
    case "운송요청":
      return Package;
    case "배차중":
      return Clock;
    case "운송중":
      return Truck;
    case "운송완료":
      return CheckCircle;
    default:
      return Package;
  }
};

export function DashboardStatus() {
  const { statusStats, loading, fetchStatusStats, error } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 현재 사용자 정보 가져오기
  const currentUser = getCurrentUser();
  
  // 컴포넌트 마운트 시 상태 통계 데이터 조회
  useEffect(() => {
    if (currentUser?.companyId) {
      fetchStatusStats({ 
        companyId: currentUser.companyId, 
        //dateFrom: ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), // 이번 달 1일
        dateFrom: ymd(new Date()), // 오늘
        dateTo: ymd(new Date()) // 오늘
      });
    }
  }, [currentUser?.companyId, fetchStatusStats]);

  // 새로고침 핸들러
  const handleRefresh = async () => {
    if (!currentUser?.companyId || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchStatusStats({ 
        companyId: currentUser.companyId, 
        dateFrom: ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        dateTo: ymd(new Date())
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 상태 카드 클릭 핸들러
  const handleStatusClick = (label: GroupLabel) => {
    // 실제 구현에서는 해당 상태의 상세 페이지로 이동
    console.log(`상태 클릭: ${label}`);
    // router.push(`/orders?status=${label}`);
  };
  
  // 총 건수 계산
  const totalCount = !loading.statusStats ? statusStats.reduce((sum, stat) => sum + stat.count, 0) : 0;
  
  // 포맷 함수
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 증감률 계산 (실제로는 이전 기간과 비교해야 함)
  const calculateGrowth = () => {
    // 실제 구현에서는 이전 기간 데이터와 비교
    return { percentage: 2.7, isPositive: true };
  };

  const growth = calculateGrowth();
  
  return (
    <Card className="overflow-hidden border-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between ">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">배차 현황</CardTitle>
            <p className="text-xs text-slate-500">오늘 기준</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || loading.statusStats}
            className={cn(
              "p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white transition-all duration-200",
              (isRefreshing || loading.statusStats) && "opacity-50 cursor-not-allowed"
            )}
            title="새로고침"
          >
            <RefreshCw className={cn("h-4 w-4", (isRefreshing || loading.statusStats) && "animate-spin")} />
          </button>
          <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {loading.statusStats ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-2">데이터 로드 실패</div>
            <div className="text-gray-500 text-xs mb-4">{error}</div>
            <button 
              onClick={handleRefresh}
              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : statusStats.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm mb-2">데이터가 없습니다</div>
            <div className="text-gray-400 text-xs">이번 달 배차 데이터가 없습니다</div>
          </div>
        ) : (
          <>
            {/* 헤더 섹션 */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-2xl font-bold text-slate-900">{formatNumber(totalCount)}건</h3>
                <div className={cn("flex items-center text-sm font-medium", 
                  growth.isPositive ? "text-emerald-600" : "text-red-600")}>
                  {growth.isPositive ? 
                    <ArrowUp className="h-3 w-3 mr-1" /> : 
                    <ArrowDown className="h-3 w-3 mr-1" />
                  }
                  <span>{growth.percentage}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">전날 대비</p>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="flex h-1.5 mb-4 bg-slate-100 rounded-full overflow-hidden">
              {statusStats.map((stat) => {
                const { color } = getGroupStyle(stat.label);
                return (
                  <div 
                    key={stat.label} 
                    className={cn("h-full transition-all duration-300", color)} 
                    style={{ width: `${stat.percentage}%` }}
                    title={`${stat.label}: ${stat.count}건 (${stat.percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            
            {/* 상태별 카드 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              {statusStats.map((stat) => {
                const { color, textColor, iconColor, bgColor, borderColor, hoverColor } = getGroupStyle(stat.label);
                const IconComponent = getGroupIcon(stat.label);
                
                return (
                  <div 
                    key={stat.label} 
                    onClick={() => handleStatusClick(stat.label)}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200 cursor-pointer group",
                      bgColor, borderColor, hoverColor
                    )}
                    title={`${stat.label} 상세 보기`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={cn("p-1.5 rounded-md transition-transform group-hover:scale-110", color)}>
                          <IconComponent className="h-3 w-3 text-white" />
                        </div>
                        <span className={cn("text-xs font-medium", textColor)}>
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                      {formatNumber(stat.count)}
                    </div>
                    <div className="text-xs text-slate-500">건</div>
                  </div>
                );
              })}
            </div>
            
            {/* 범례 */}
            {/* <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
              {statusStats.map(({ label }) => {
                const { color } = getGroupStyle(label);
                return (
                  <div key={label} className="flex items-center text-xs text-slate-600">
                    <div className={cn("h-2 w-2 rounded-full mr-1.5", color)}></div>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div> */}
          </>
        )}
      </CardContent>
    </Card>
  );
} 