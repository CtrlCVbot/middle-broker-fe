"use client";

//react
import { useState, useMemo } from "react";

//ui
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
  Filler
} from 'chart.js';

// SWR 훅
import { useTransportTrends } from "@/hooks/use-transport-trends";
import { getCurrentUser } from "@/utils/auth";

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
  const currentUser = getCurrentUser();
  const [period, setPeriod] = useState<PeriodType>("7d");
  const [showRecommended, setShowRecommended] = useState(false);

  // 기간 계산 (Asia/Seoul 기준)
  const { date_from, date_to } = useMemo(() => {
    const today = new Date();
    const days = period === "7d" ? 6 : 29;
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - days);
    
    return {
      date_from: fromDate.toISOString().slice(0, 10),
      date_to: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    };
  }, [period]);

  // SWR 훅 사용
  const { points, loading, error, isValidating, mutate } = useTransportTrends(
    currentUser?.companyId ? {
      date_from,
      date_to,
      company_id: currentUser.companyId,
      recommended_only: showRecommended,
    } : undefined
  );

  const handlePeriodChange = (value: string) => {
    setPeriod(value as PeriodType);
  };

  const handleRefresh = () => {
    mutate();
  };

  // 데이터 포맷팅 - 서버 응답 데이터에 맞게 수정
  const chartData = points.map((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString('ko-KR', { month: 'short' });
    const day = date.getDate();
    
    return {
      date: `${month} ${day}일`, // "MM-DD" 형식으로 표시
      orderAmount: item.orderAmount / 10000, // 만원 단위로 변환
      orderCount: item.orderCount,
    };
  });

  // 증가율 계산 (첫 데이터와 마지막 데이터 비교)
  const calculateGrowthRate = (): string => {
    if (points.length < 2) return "0.0";
    const first = points[0].orderCount;
    const last = points[points.length - 1].orderCount;
    const denominator = Math.max(first, 1); // 분모 0 가드
    return ((last - first) / denominator * 100).toFixed(1);
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
          {/* <div className="flex items-center space-x-2">
            <Switch
              id="recommended-mode"
              checked={showRecommended}
              onCheckedChange={setShowRecommended}
            />
            <Label htmlFor="recommended-mode">추천만</Label>
          </div> */}
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
            disabled={isValidating}
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-sm mb-2">데이터 로드 실패</div>
              <div className="text-gray-500 text-xs mb-4">{error.message}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
              >
                다시 시도
              </Button>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-2">표시할 데이터가 없습니다</div>
              <div className="text-gray-400 text-xs">선택한 기간에 운송 데이터가 없습니다</div>
            </div>
          </div>
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
              {showRecommended && " (추천만)"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 