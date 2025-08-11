"use client";

//ui
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { BarChart3, TruckIcon, Wallet } from "lucide-react";

//store
import { useDashboardStore } from "@/store/dashboard-store";

const user = {
  name: "John Doe",
  avatar: "/images/globe.svg",
};

export function DashboardOverview() {
  const { kpi, loading } = useDashboardStore();
  
  // // 숫자 포맷 함수
  // const formatNumber = (num: number): string => {
  //   return new Intl.NumberFormat('ko-KR').format(num);
  // };
  
  // // 화폐 포맷 함수
  // const formatCurrency = (num: number): string => {
  //   return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(num);
  // };
  
  // 숫자를 약식으로 표시 (예: 9.3k, 24k)
  const formatCompactNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num < 10000 ? 1 : 0) + 'k';
    }
    return num.toString();
  };
  
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
      
      {/* 월간 운송 건수 카드 */}
      <Card className="overflow-hidden border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full p-2 bg-blue-100">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            
            {loading.kpi ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {kpi ? formatCompactNumber(kpi.monthlyOrderCount) : '0'}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              이번 달 운송
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 월간 운송 비용 카드 */}
      <Card className="overflow-hidden border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full p-2 bg-red-100">
              <Wallet className="h-6 w-6 text-red-600" />
            </div>
            
            {loading.kpi ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {kpi ? formatCompactNumber(kpi.monthlyOrderAmount / 10000) : '0'}만
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              총 운송 비용
            </p>
          </div>
        </CardContent>
      </Card>      

      {/* 평균 운송비 카드 */}
      <Card className="overflow-hidden border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full p-2 bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            
            {loading.kpi ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {kpi ? formatCompactNumber(kpi.monthlyOrderAverage / 10000) : '0'}만
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              건당 평균 비용
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 화주 업체 로고 */}
      <Card className="overflow-hidden border relative w-full h-64 hidden sm:block">
        {/* 배경 이미지 */}
        {/* <Image
          src="/images/globe-bg.svg"
          alt="background"
          fill
          className="object-cover"
        /> */}

        {/* 카드 콘텐츠 - 중앙 로고 */}
        <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <div className="rounded-full p-2 bg-green-100">
            <Image
              src="/globe.svg"
              alt="logo"
              fill
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 