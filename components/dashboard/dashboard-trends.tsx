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

// SWR 훅
import { useTransportTrends } from "@/hooks/use-transport-trends";
import { getCurrentUser } from "@/utils/auth";

// 타입 정의
type PeriodType = "7d" | "30d";

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  // 디버깅을 위한 콘솔 로그
  console.log('CustomTooltip Debug:', {
    active,
    payload: payload?.map(p => ({ name: p.name, value: p.value, dataKey: p.dataKey })),
    label
  });

  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-2">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => {
          // 디버깅: 각 entry 정보 출력
          console.log('Tooltip Entry:', {
            name: entry.name,
            dataKey: entry.dataKey,
            value: entry.value
          });
          
          // dataKey를 기준으로 판단 (더 안정적)
          if (entry.dataKey === "orderAmount") {
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                운송 비용: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(Number(entry.value) * 10000)}
              </p>
            );
          } else if (entry.dataKey === "orderCount") {
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                운송 건수: {entry.value}건
              </p>
            );
          } else {
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            );
          }
        })}
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

  // 디버깅을 위한 콘솔 로그
  console.log('DashboardTrends Debug:', {
    currentUser: currentUser?.companyId,
    date_from,
    date_to,
    points,
    loading,
    error,
    chartDataLength: points.length
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value as PeriodType);
  };

  const handleRefresh = () => {
    mutate();
  };

  // 테스트 데이터 (개발 중에만 사용)
  const testData = [
    { date: '2024-01-01', orderCount: 5, orderAmount: 500000 },
    { date: '2024-01-02', orderCount: 8, orderAmount: 800000 },
    { date: '2024-01-03', orderCount: 12, orderAmount: 1200000 },
    { date: '2024-01-04', orderCount: 6, orderAmount: 600000 },
    { date: '2024-01-05', orderCount: 15, orderAmount: 1500000 },
    { date: '2024-01-06', orderCount: 10, orderAmount: 1000000 },
    { date: '2024-01-07', orderCount: 18, orderAmount: 1800000 },
  ];

  // 디버깅: 사용할 데이터 확인
  console.log('Using data:', points.length > 0 ? 'API data' : 'Test data');
  console.log('Data source:', points.length > 0 ? points : testData);

  // 데이터 포맷팅 - 서버 응답 데이터에 맞게 수정
  const chartData = (points.length > 0 ? points : testData).map((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString('ko-KR', { month: 'short' });
    const day = date.getDate();
    
    // API 데이터와 테스트 데이터의 구조 차이를 고려한 안전한 접근
    const orderAmount = (item.orderAmount ||  0) / 10000; // 만원 단위로 변환
    const orderCount = item.orderCount || 0;
    
    const formattedData = {
      date: `${month} ${day}일`, // "MM-DD" 형식으로 표시
      orderAmount: orderAmount,
      orderCount: orderCount,
    };
    
    // 디버깅을 위한 콘솔 로그
    console.log('Chart Data Item:', formattedData);
    
    return formattedData;
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
    // <Card className="flex flex-col" style={{ minHeight: '500px' }}>
    <Card className="flex flex-col h-full">
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
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex-1 w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
           <div className="flex-1 w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
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
           <div className="flex-1 w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-2">표시할 데이터가 없습니다</div>
              <div className="text-gray-400 text-xs">선택한 기간에 운송 데이터가 없습니다</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full" style={{ minHeight: '300px', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}만`}
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <RechartsLegend />
                <defs>
                  <linearGradient id="colorOrderCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOrderAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  yAxisId="left"
                  type="monotone"
                  name="운송 건수"
                  dataKey="orderCount"
                  stroke="#3b82f6"
                  fill="url(#colorOrderCount)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  name="운송 비용"
                  dataKey="orderAmount"
                  stroke="#10b981"
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