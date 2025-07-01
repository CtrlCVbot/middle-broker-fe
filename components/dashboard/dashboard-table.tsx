"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";
import { Package, RefreshCw, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { OrderStatusType } from "@/types/order";


// 상태에 따른 배지 색상 및 스타일
const getStatusBadgeStyles = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return { variant: 'outline', className: 'text-gray-800 bg-gray-100 hover:bg-gray-200' };
    case '배차완료':
      return { variant: 'secondary', className: 'text-blue-800 bg-blue-100 hover:bg-blue-200' };
    case '상차완료':
      return { variant: 'default', className: 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200' };
    case '운송중':
      return { variant: 'default', className: 'text-orange-800 bg-orange-100 hover:bg-orange-200' };
    case '하차완료':
      return { variant: 'default', className: 'text-green-800 bg-green-100 hover:bg-green-200' };
    case '운송완료':
      return { variant: 'outline', className: 'text-purple-800 bg-purple-100 hover:bg-purple-200' };
    default:
      return { variant: 'outline', className: 'text-gray-800 bg-gray-100 hover:bg-gray-200' };
  }
};

export function DashboardTable() {
  const router = useRouter();
  const { recentOrders, loading, refreshDashboard } = useDashboardStore();
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshDashboard();
  };
  
  // 상세 페이지로 이동 핸들러
  const goToOrderDetail = (id: string) => {
    router.push(`/order/list?id=${id}`);
  };
  
  // 상대적 시간 포맷 함수
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ko });
    } catch (error) {
      return '알 수 없음';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Package className="h-5 w-5 mr-2" />
          최근 등록된 화물
        </CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleRefresh}
          disabled={loading.recentOrders}
          title="새로고침"
        >
          <RefreshCw className={loading.recentOrders ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading.recentOrders ? (
          // 로딩 스켈레톤
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col md:hidden space-y-2 pb-3 border-b">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
            <div className="hidden md:block">
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block rounded-md border overflow-hidden">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-10 px-4 text-left align-middle font-medium">화물번호</th>
                    <th className="h-10 px-2 text-left align-middle font-medium">상태</th>
                    <th className="h-10 px-2 text-left align-middle font-medium">출발지</th>
                    <th className="h-10 px-2 text-left align-middle font-medium">도착지</th>
                    <th className="h-10 px-2 text-right align-middle font-medium">금액</th>
                    <th className="h-10 px-2 text-right align-middle font-medium">등록일</th>
                    <th className="h-10 px-4 text-right align-middle font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const { variant, className } = getStatusBadgeStyles(order.status);
                      return (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 px-4 align-middle font-medium">{order.orderNumber}</td>
                          <td className="p-2 align-middle">
                            <Badge variant={variant as any} className={className}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-2 align-middle truncate max-w-[120px]">{order.departure.address}</td>
                          <td className="p-2 align-middle truncate max-w-[120px]">{order.destination.address}</td>
                          <td className="p-2 align-middle text-right">{order.amount}</td>
                          <td className="p-2 align-middle text-right text-muted-foreground">
                            {formatRelativeTime(order.registeredDate)}
                          </td>
                          <td className="p-2 px-4 align-middle text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={() => goToOrderDetail(order.id)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        등록된 화물이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 모바일 카드 뷰 */}
            <div className="md:hidden space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const { variant, className } = getStatusBadgeStyles(order.status);
                  return (
                    <div 
                      key={order.id} 
                      className="p-3 border rounded-md space-y-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => goToOrderDetail(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{order.orderNumber}</div>
                        <Badge variant={variant as any} className={className}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="truncate">{order.departure.address}</span>
                        <ArrowRight className="h-3 w-3 mx-1 flex-shrink-0" />
                        <span className="truncate">{order.destination.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{order.amount}</div>
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatRelativeTime(order.registeredDate)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  등록된 화물이 없습니다.
                </div>
              )}
            </div>
          </>
        )}
        
        {/* "더 보기" 버튼 */}
        {recentOrders.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/order/list')}
              className="w-full md:w-auto"
            >
              모든 화물 목록 보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 