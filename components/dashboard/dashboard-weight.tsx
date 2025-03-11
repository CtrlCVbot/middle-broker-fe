"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard-store";
import { Weight, RefreshCw } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록 (이미 다른 컴포넌트에서 등록했으면 생략 가능)
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export function DashboardWeight() {
  const { weightStats, loading, refreshDashboard } = useDashboardStore();
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshDashboard();
  };
  
  // 파이 차트 데이터
  const chartData = {
    labels: weightStats.map(stat => stat.weight),
    datasets: [
      {
        label: '중량별 사용 비율',
        data: weightStats.map(stat => stat.percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 차트 옵션
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const index = context.dataIndex;
            const count = weightStats[index]?.count || 0;
            return `${label}: ${value}% (${count}건)`;
          }
        }
      }
    },
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Weight className="h-5 w-5 mr-2" />
          중량별 운송 통계
        </CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleRefresh}
          disabled={loading.weights}
          title="새로고침"
        >
          <RefreshCw className={loading.weights ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          {loading.weights ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[200px] w-full rounded-full" />
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              {weightStats.length > 0 ? (
                <Pie data={chartData} options={options} />
              ) : (
                <div className="text-center text-muted-foreground">
                  중량 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 중량별 상세 데이터 (표) */}
        {!loading.weights && weightStats.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">중량</th>
                  <th className="text-right py-1">건수</th>
                  <th className="text-right py-1">비율</th>
                </tr>
              </thead>
              <tbody>
                {weightStats.map((stat) => (
                  <tr key={stat.weight} className="border-b border-dashed">
                    <td className="py-1">{stat.weight}</td>
                    <td className="text-right py-1">{stat.count}건</td>
                    <td className="text-right py-1">{stat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 