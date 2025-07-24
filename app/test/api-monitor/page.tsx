'use client';

import React from 'react';
import { ApiUsageMonitor } from '@/components/dashboard/api-usage-monitor';

export default function ApiMonitorTestPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API 사용량 모니터링 테스트</h1>
        <p className="text-muted-foreground">
          카카오 API의 사용량, 성능, 에러 로그를 실시간으로 모니터링하고 분석할 수 있습니다.
        </p>
      </div>

      <ApiUsageMonitor className="w-full" />
    </div>
  );
} 