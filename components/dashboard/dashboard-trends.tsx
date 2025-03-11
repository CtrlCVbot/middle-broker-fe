"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStore, TrendPeriod } from "@/store/dashboard-store";
import { BarChart, LineChart, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 차트 타입 정의
type ChartType = 'amount' | 'count';

export function DashboardTrends() {
  const { trendData, loading, filters, setTrendPeriod, refreshDashboard } = useDashboardStore();
  const [activeChart, setActiveChart] = useState<ChartType>('amount');
  
  // 기간 변경 핸들러
  const handlePeriodChange = (value: string) => {
    setTrendPeriod(value === '7' ? 7 : 30);
  };
  
  // 차트 타입 변경 핸들러
  const handleChartTypeChange = (value: ChartType) => {
    setActiveChart(value);
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshDashboard();
  };
  
  // 데이터 포맷팅
  const labels = trendData.map(item => item.displayDate);
  
  // 운송 비용 데이터
  const amountData = {
    labels,
    datasets: [
      {
        label: '운송 비용',
        data: trendData.map(item => item.orderAmount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      }
    ],
  };
  
  // 운송 건수 데이터
  const countData = {
    labels,
    datasets: [
      {
        label: '운송 건수',
        data: trendData.map(item => item.orderCount),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ],
  };
  
  // 차트 공통 옵션
  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            
            if (activeChart === 'amount') {
              return `${label}: ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value)}`;
            } else {
              return `${label}: ${value}건`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (activeChart === 'amount') {
              return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0, notation: 'compact' }).format(value as number);
            } else {
              return value;
            }
          }
        }
      }
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          {activeChart === 'amount' ? (
            <LineChart className="h-5 w-5 mr-2" />
          ) : (
            <BarChart className="h-5 w-5 mr-2" />
          )}
          {activeChart === 'amount' ? '운송 비용 트렌드' : '운송 건수 트렌드'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Tabs
            value={activeChart}
            onValueChange={(value) => handleChartTypeChange(value as ChartType)}
            className="hidden sm:block"
          >
            <TabsList className="h-8">
              <TabsTrigger value="amount" className="text-xs">비용</TabsTrigger>
              <TabsTrigger value="count" className="text-xs">건수</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            value={String(filters.trendPeriod)}
            onValueChange={handlePeriodChange}
          >
            <TabsList className="h-8">
              <TabsTrigger value="7" className="text-xs">7일</TabsTrigger>
              <TabsTrigger value="30" className="text-xs">30일</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleRefresh}
            disabled={loading.trends}
            title="새로고침"
          >
            <RefreshCw className={loading.trends ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading.trends ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[260px] w-full" />
              </div>
            </div>
          ) : (
            <>
              {/* 모바일 화면에서만 보이는 선택기 */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:hidden">
                <Button 
                  variant={activeChart === 'amount' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleChartTypeChange('amount')}
                  className="text-xs"
                >
                  <LineChart className="h-3 w-3 mr-1" />
                  비용
                </Button>
                <Button 
                  variant={activeChart === 'count' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleChartTypeChange('count')}
                  className="text-xs"
                >
                  <BarChart className="h-3 w-3 mr-1" />
                  건수
                </Button>
              </div>
              
              {/* 차트 표시 */}
              <div className="h-[260px]">
                {activeChart === 'amount' ? (
                  <Line options={options} data={amountData} />
                ) : (
                  <Bar options={options} data={countData} />
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 