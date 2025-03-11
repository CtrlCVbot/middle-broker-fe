"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDashboardStore, RegionType } from "@/store/dashboard-store";
import { MapPin, RefreshCw } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export function DashboardGeo() {
  const { regionStats, loading, filters, setRegionType, refreshDashboard } = useDashboardStore();
  
  // 필터 변경 핸들러
  const handleTypeChange = (value: string) => {
    setRegionType(value as RegionType);
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshDashboard();
  };
  
  // 현재 지역 데이터 가져오기
  const regions = regionStats ? 
    (filters.regionType === 'departure' ? regionStats.departure : regionStats.destination) : 
    [];
  
  // 도넛 차트 데이터
  const chartData = {
    labels: regions.map(region => region.name),
    datasets: [
      {
        label: filters.regionType === 'departure' ? '출발지 비율' : '도착지 비율',
        data: regions.map(region => region.percentage),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(201, 203, 207, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 차트 옵션
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          // 라벨이 너무 길면 잘라서 표시
          generateLabels: (chart) => {
            const originalLabels = ChartJS.overrides.doughnut.plugins?.legend?.labels?.generateLabels?.(chart) || [];
            return originalLabels.map(label => {
              const text = label.text || '';
              label.text = text.length > 10 ? text.slice(0, 10) + '...' : text;
              return label;
            });
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const index = context.dataIndex;
            const count = regions[index]?.count || 0;
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
          <MapPin className="h-5 w-5 mr-2" />
          {filters.regionType === 'departure' ? '출발지별' : '도착지별'} 운송 현황
        </CardTitle>
        <div className="flex items-center gap-2">
          <Tabs
            value={filters.regionType}
            onValueChange={handleTypeChange}
          >
            <TabsList className="h-8">
              <TabsTrigger value="departure" className="text-xs">출발지</TabsTrigger>
              <TabsTrigger value="destination" className="text-xs">도착지</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleRefresh}
            disabled={loading.regions}
            title="새로고침"
          >
            <RefreshCw className={loading.regions ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading.regions ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[260px] w-full rounded-full" />
              </div>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              {regions.length > 0 ? (
                <Doughnut data={chartData} options={options} />
              ) : (
                <div className="text-center text-muted-foreground">
                  지역 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 지역별 상세 데이터 (표) */}
        {!loading.regions && regions.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">지역</th>
                  <th className="text-right py-2">건수</th>
                  <th className="text-right py-2">비율</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region) => (
                  <tr key={region.name} className="border-b border-dashed">
                    <td className="py-2">{region.name}</td>
                    <td className="text-right py-2">{region.count}건</td>
                    <td className="text-right py-2">{region.percentage}%</td>
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