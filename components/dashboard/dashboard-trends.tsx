"use client";

import { useState } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps,
  Legend as RechartsLegend
} from "recharts";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// 원래의 ChartJS 관련 라이브러리를 다시 불러옵니다
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// 타입 정의
type PeriodType = "7d" | "30d";

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-2">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name === "orderAmount" 
              ? `운송 비용: ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(Number(entry.value) * 10000)}` 
              : `운송 건수: ${entry.value}건`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function DashboardTrends() {
  const { trendData, loading, filters, setTrendPeriod, refreshDashboard } = useDashboardStore();
  const [period, setPeriod] = useState<PeriodType>("7d");
  const [showRecommended, setShowRecommended] = useState(false);

  const handlePeriodChange = (value: string) => {
    setPeriod(value as PeriodType);
    // 기존 API 호출 방식으로 변경
    if (value === "7d") {
      setTrendPeriod(7);
    } else {
      setTrendPeriod(30);
    }
  };

  const handleRefresh = () => {
    refreshDashboard();
  };

  // 데이터 포맷팅 - 데이터 구조에 맞게 수정
  const chartData = trendData.map((item, index) => {
    // trendData에 date 필드가 있다고 가정하고, 없으면 현재 날짜에서 인덱스만큼 뺀 날짜 사용
    const date = new Date();
    date.setDate(date.getDate() - (trendData.length - index - 1));
    const month = date.toLocaleString('en-US', { month: 'short' });
    
    return {
      date: item.date || month, // date 필드가 있으면 사용, 없으면 계산된 월 사용
      orderAmount: item.orderAmount / 10000, // 만원 단위로 변환
      orderCount: item.orderCount,
    };
  });

  // 증가율 계산 (첫 데이터와 마지막 데이터 비교)
  const calculateGrowthRate = (): string => {
    if (trendData.length < 2) return "0.0";
    const first = trendData[0].orderCount;
    const last = trendData[trendData.length - 1].orderCount;
    return ((last - first) / first * 100).toFixed(1);
  };

  const growthRate = calculateGrowthRate();
  const isPositiveGrowth = parseFloat(growthRate) >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>운송 추이 분석</CardTitle>
          <CardDescription>
            {period === "7d" ? "지난 7일간" : "지난 30일간"} 운송 건수 및 비용 추이
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="recommended-mode"
              checked={showRecommended}
              onCheckedChange={setShowRecommended}
            />
            <Label htmlFor="recommended-mode">추천만</Label>
          </div>
          <Select 
            value={period} 
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">최근 7일</SelectItem>
              <SelectItem value="30d">최근 30일</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={loading.trends}
          >
            <RefreshCw className={`h-4 w-4 ${loading.trends ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading.trends ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}만`}
                />
                <Tooltip content={<CustomTooltip />} />
                <RechartsLegend />
                <defs>
                  <linearGradient id="colorOrderCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOrderAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  yAxisId="left"
                  type="monotone"
                  name="운송 건수"
                  dataKey="orderCount"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#colorOrderCount)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  name="운송 비용"
                  dataKey="orderAmount"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#colorOrderAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {isPositiveGrowth ? "증가" : "감소"}하는 추세: {growthRate}% 
              <TrendingUp className={`h-4 w-4 ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {period === "7d" ? "최근 7일간 데이터" : "최근 30일간 데이터"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 