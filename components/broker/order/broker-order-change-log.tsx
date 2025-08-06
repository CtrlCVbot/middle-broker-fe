"use client";

import React, { useEffect, useState } from "react";
import { IOrderChangeLog } from "@/types/broker-order";
import { fetchOrderChangeLogs } from "@/services/order-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, AlertCircle, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/utils/auth";


// Date formatting utility (date-fns 대신 내장 기능 사용)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return dateString;
  }
};

interface BrokerOrderChangeLogProps {
  orderId: string;
}

// 변경 타입별 한글 변환
const getChangeTypeLabel = (changeType: string): string => {
  const typeMap: Record<string, string> = {
    'create': '주문 생성',
    'update': '주문 수정',
    'updateStatus': '상태 변경',
    'updatePrice': '운임 변경',
    'updatePriceSales': '청구금 변경',
    'updatePricePurchase': '배차금 변경',
    'updateDispatch': '배차 정보 변경',
    'cancelDispatch': '배차 취소',
    'cancel': '주문 취소',
    'delete': '주문 삭제'
  };
  return typeMap[changeType] || changeType;
};

// 변경 타입별 배지 색상
const getChangeTypeBadgeVariant = (changeType: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (changeType) {
    case 'create':
      return 'default';
    case 'updateStatus':
      return 'secondary';
    case 'updatePrice':
    case 'updatePriceSales':
    case 'updatePricePurchase':
      return 'outline';
    case 'updateDispatch':
      return 'secondary';
    case 'cancel':
    case 'delete':
      return 'destructive';
    default:
      return 'default';
  }
};

// 역할별 한글 변환
const getRoleLabel = (accessLevel: string): string => {
  const roleMap: Record<string, string> = {
    'platform_admin': '플랫폼 관리자',
    'broker_admin': '주선사 관리자',
    'broker_member': '주선사 직원',
    'shipper_admin': '화주 관리자',
    'shipper_member': '화주 직원'
  };
  return roleMap[accessLevel] || accessLevel;
};

// changedByRole 한글 변환
const getChangedByRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    'broker': '주선사',
    'shipper': '화주',
    'admin': '관리자'
  };
  return roleMap[role] || role;
};

export function BrokerOrderChangeLog({ orderId }: BrokerOrderChangeLogProps) {
  const [changeLogs, setChangeLogs] = useState<IOrderChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // 사용자 정보와 변경 이력을 병렬로 조회
        const [user, response] = await Promise.all([
          getCurrentUser(),
          fetchOrderChangeLogs(orderId)
        ]);
        
        setCurrentUser(user);
        setChangeLogs(response.data || []);
      } catch (err) {
        console.error('데이터 조회 중 오류 발생:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">변경 이력을 불러오는 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-destructive mr-2" />
          <span className="text-sm text-destructive">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!changeLogs || changeLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">변경 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">변경 이력이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  console.log('currentUser: ', currentUser);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">변경 이력 ({changeLogs.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {changeLogs.map((log, index) => (
          <div 
            key={log.id} 
            className="relative pl-6 pb-6 last:pb-0"
          >
            {/* 타임라인 라인 (마지막 항목 제외) */}
            {index < changeLogs.length - 1 && (
              <div className="absolute left-[11px] top-7 bottom-0 w-[1px] bg-border" />
            )}
            
            {/* 변경 타입 배지와 시간 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-background border-2 border-primary" />
              
              <div className="flex items-center gap-2">
                <Badge variant={getChangeTypeBadgeVariant(log.changeType)} className="text-xs">
                  {getChangeTypeLabel(log.changeType)}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(log.changedAt)}
                </div>
              </div>
              
              {/* 변경자 정보 */}
              <div className="flex items-center text-xs text-muted-foreground ml-0 sm:ml-auto">
                <User className="h-3 w-3 mr-1" />
                {log.changedBy.name} ({log.changedByRole ? getChangedByRoleLabel(log.changedByRole) : getRoleLabel(log.changedBy.accessLevel)})
              </div>
            </div>
            
            {/* 변경 사유 */}
            {log.reason && (
              <div className="flex items-start gap-1 text-sm ml-1 mb-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{log.reason}</span>
              </div>
            )}

            {/* 변경 내용 상세 (필요시 확장 가능) */}
            {currentUser?.systemAccessLevel === 'platform_admin' && 
            (log.oldData || log.newData) && (
              <div className="ml-1">
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    상세 변경 내용 보기
                  </summary>
                  <div className="mt-2 p-2 bg-muted rounded-md space-y-1">
                    {log.oldData && (
                      <div>
                        <span className="font-medium">변경 전:</span>
                        <pre className="text-xs overflow-auto">{JSON.stringify(log.oldData, null, 2)}</pre>
                      </div>
                    )}
                    {log.newData && (
                      <div>
                        <span className="font-medium">변경 후:</span>
                        <pre className="text-xs overflow-auto">{JSON.stringify(log.newData, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}