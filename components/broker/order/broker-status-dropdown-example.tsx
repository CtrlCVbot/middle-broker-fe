import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrokerStatusDropdown } from './broker-status-dropdown';
import { ORDER_FLOW_STATUSES } from '@/types/order-ver01';
import { v4 as uuidv4 } from 'uuid';

// 이 컴포넌트는 배차상태 드롭다운 사용 예시를 보여주는 데모 컴포넌트입니다.
export function BrokerStatusDropdownExample() {
  const [currentStatus, setCurrentStatus] = useState<string>(ORDER_FLOW_STATUSES[1]); // 기본값: 배차대기
  const [statusHistory, setStatusHistory] = useState<{status: string, timestamp: string}[]>([
    { status: ORDER_FLOW_STATUSES[1], timestamp: new Date().toISOString() }
  ]);
  
  // 예시용 유효한 UUID 형식의 배차 ID 생성
  const [mockDispatchId] = useState<string>(uuidv4());
  
  // 상태 변경 핸들러
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setStatusHistory(prev => [
      ...prev,
      { status: newStatus, timestamp: new Date().toISOString() }
    ]);
  };
  
  // 타임스탬프 포맷팅
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">배차상태 변경 예시</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">현재 상태:</span>
            <BrokerStatusDropdown
              currentStatus={currentStatus}
              dispatchId={mockDispatchId}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <div className="mt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">사용된 배차 ID:</h4>
            <code className="bg-gray-100 p-1 rounded text-xs block w-full overflow-auto">{mockDispatchId}</code>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">상태 변경 이력</h4>
            <div className="border rounded-md p-2 text-sm">
              <ul className="space-y-2">
                {statusHistory.map((item, index) => (
                  <li key={index} className="flex justify-between pb-1 border-b last:border-b-0 last:pb-0">
                    <span>{item.status}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 