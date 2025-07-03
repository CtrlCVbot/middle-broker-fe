'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  Zap
} from 'lucide-react';
import { IApiUsageStats, IApiUsageSummary, IApiUsageRecord, IDailyApiStats } from '@/types/api-usage';

interface IApiUsageMonitorProps {
  className?: string;
}

export function ApiUsageMonitor({ className }: IApiUsageMonitorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<IApiUsageSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<IDailyApiStats[]>([]);
  const [recentErrors, setRecentErrors] = useState<IApiUsageRecord[]>([]);
  const [slowCalls, setSlowCalls] = useState<IApiUsageRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 데이터 로드 함수
  const loadSummaryData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/kakao/usage-stats?type=summary');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('요약 통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyStats = async () => {
    try {
      const response = await fetch('/api/kakao/usage-stats?type=daily&days=7');
      const data = await response.json();
      
      if (data.success) {
        setDailyStats(data.data);
      }
    } catch (error) {
      console.error('일별 통계 로드 실패:', error);
    }
  };

  const loadErrorLogs = async () => {
    try {
      const response = await fetch('/api/kakao/usage-stats?type=errors&limit=10');
      const data = await response.json();
      
      if (data.success) {
        setRecentErrors(data.data);
      }
    } catch (error) {
      console.error('에러 로그 로드 실패:', error);
    }
  };

  const loadSlowCalls = async () => {
    try {
      const response = await fetch('/api/kakao/usage-stats?type=slow&limit=10&thresholdMs=3000');
      const data = await response.json();
      
      if (data.success) {
        setSlowCalls(data.data);
      }
    } catch (error) {
      console.error('느린 호출 로드 실패:', error);
    }
  };

  // 실시간 데이터 로드
  const loadRealtimeData = async () => {
    try {
      const response = await fetch('/api/kakao/usage-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'realtime' })
      });
      const data = await response.json();
      
      if (data.success) {
        // 실시간 데이터로 상태 업데이트
        const { today, recentErrors: errors, slowCalls: slow } = data.data;
        setSummary(prev => prev ? { ...prev, today } : null);
        setRecentErrors(errors);
        setSlowCalls(slow);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('실시간 데이터 로드 실패:', error);
    }
  };

  // 데이터 내보내기
  const exportData = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await fetch('/api/kakao/usage-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format,
          dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          dateTo: new Date().toISOString()
        })
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `api-usage-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `api-usage-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadSummaryData();
    loadDailyStats();
    loadErrorLogs();
    loadSlowCalls();
  }, []);

  // 자동 새로고침
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        loadRealtimeData();
      }, 30000); // 30초마다 갱신
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // 성공률 계산
  const getSuccessRate = (successful: number, total: number): number => {
    return total > 0 ? Math.round((successful / total) * 100) : 0;
  };

  // 상태 색상 결정
  const getStatusColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">API 사용량 모니터링</h2>
          <p className="text-muted-foreground">카카오 API 사용량 및 성능 통계를 실시간으로 확인합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Zap className="h-4 w-4 mr-1" />
            {autoRefresh ? '자동 갱신 ON' : '자동 갱신 OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRealtimeData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-1" />
            CSV 내보내기
          </Button>
        </div>
      </div>

      {/* 실시간 상태 카드 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 총 호출</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.today.totalCalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                성공률: <span className={getStatusColor(summary.today.successRate)}>
                  {summary.today.successRate.toFixed(1)}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.today.avgResponseTime}ms</div>
              <Progress 
                value={Math.min((summary.today.avgResponseTime / 5000) * 100, 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 비용</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.thisMonth.totalCost.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">
                총 {summary.thisMonth.totalCalls.toLocaleString()}회 호출
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 상세 통계 탭 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="daily">일별 통계</TabsTrigger>
          <TabsTrigger value="errors">에러 로그</TabsTrigger>
          <TabsTrigger value="performance">성능</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>기간별 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">오늘</span>
                    <div className="text-right">
                      <div className="font-medium">{summary.today.totalCalls.toLocaleString()}회</div>
                      <div className="text-sm text-muted-foreground">
                        {summary.today.successRate.toFixed(1)}% 성공
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">이번 주</span>
                    <div className="text-right">
                      <div className="font-medium">{summary.thisWeek.totalCalls.toLocaleString()}회</div>
                      <div className="text-sm text-muted-foreground">
                        {summary.thisWeek.successRate.toFixed(1)}% 성공
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">이번 달</span>
                    <div className="text-right">
                      <div className="font-medium">{summary.thisMonth.totalCalls.toLocaleString()}회</div>
                      <div className="text-sm text-muted-foreground">
                        {summary.thisMonth.successRate.toFixed(1)}% 성공
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>시스템 상태</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {summary.today.successRate >= 95 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span>API 상태</span>
                      </div>
                      <Badge variant={summary.today.successRate >= 95 ? "default" : "secondary"}>
                        {summary.today.successRate >= 95 ? "정상" : "주의"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {summary.today.avgResponseTime < 3000 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span>응답 속도</span>
                      </div>
                      <Badge variant={summary.today.avgResponseTime < 3000 ? "default" : "secondary"}>
                        {summary.today.avgResponseTime < 3000 ? "빠름" : "느림"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">마지막 업데이트</span>
                      <span className="text-sm">
                        {lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                최근 7일 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.map((stat, index) => (
                  <div key={`${stat.date}-${stat.apiType}`} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{stat.date}</div>
                      <div className="text-sm text-muted-foreground">{stat.apiType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stat.totalCalls}회</div>
                      <div className="text-sm text-muted-foreground">
                        {getSuccessRate(stat.successfulCalls, stat.totalCalls)}% 성공
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                최근 에러 로그
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentErrors.length > 0 ? (
                  recentErrors.map((error, index) => (
                    <Alert key={error.id} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{error.errorMessage}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {error.apiType} | 응답시간: {error.responseTimeMs}ms
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(error.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    최근 에러가 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                느린 API 호출 (3초 이상)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slowCalls.length > 0 ? (
                  slowCalls.map((call, index) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{call.apiType}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(call.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-orange-600">
                          {call.responseTimeMs.toLocaleString()}ms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {call.success ? '성공' : '실패'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    느린 호출이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 