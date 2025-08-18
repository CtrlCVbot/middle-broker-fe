"use client";

//react, next
import { useRouter } from "next/navigation";

//ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, RefreshCw, ArrowRight, Calendar, MapPin, Truck, Clock } from "lucide-react";

//store
import { useDashboardStore } from "@/store/dashboard-store";

//utils
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

//types
import { OrderStatusType } from "@/types/order";

// 상태에 따른 배지 색상 및 스타일
const getStatusBadgeStyles = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return { variant: 'outline', className: 'text-gray-800 bg-gray-100 hover:bg-gray-200 border-gray-300' };
    case '배차완료':
      return { variant: 'secondary', className: 'text-blue-800 bg-blue-100 hover:bg-blue-200 border-blue-300' };
    case '상차완료':
      return { variant: 'default', className: 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border-yellow-300' };
    case '운송중':
      return { variant: 'default', className: 'text-orange-800 bg-orange-100 hover:bg-orange-200 border-orange-300' };
    case '하차완료':
      return { variant: 'default', className: 'text-green-800 bg-green-100 hover:bg-green-200 border-green-300' };
    case '운송완료':
      return { variant: 'outline', className: 'text-purple-800 bg-purple-100 hover:bg-purple-200 border-purple-300' };
    default:
      return { variant: 'outline', className: 'text-gray-800 bg-gray-100 hover:bg-gray-200 border-gray-300' };
  }
};

// 상태에 따른 아이콘
const getStatusIcon = (status: OrderStatusType) => {
  switch (status) {
    case '배차대기':
      return <Clock className="h-4 w-4 text-gray-500" />;
    case '배차완료':
      return <Truck className="h-4 w-4 text-blue-500" />;
    case '상차완료':
      return <Package className="h-4 w-4 text-yellow-500" />;
    case '운송중':
      return <Truck className="h-4 w-4 text-orange-500" />;
    case '하차완료':
      return <Package className="h-4 w-4 text-green-500" />;
    case '운송완료':
      return <Truck className="h-4 w-4 text-purple-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export function DashboardTable() {
  const router = useRouter();
  const { recentOrders, loading, refreshRecentOrders } = useDashboardStore();
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshRecentOrders();
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
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
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
          <RefreshCw className={`h-4 w-4 ${loading.recentOrders ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {loading.recentOrders ? (
          // 로딩 스켈레톤
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-4 w-4 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* 타임라인 컨테이너 */}
            <div className="space-y-0">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 3).map((order, index) => {
                  const { variant, className } = getStatusBadgeStyles(order.status);
                  const isLast = index === 2 || index === recentOrders.slice(0, 3).length - 1;
                  
                  return (
                    <div key={order.id} className="relative">
                      {/* 타임라인 라인 */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                      )}
                      
                      {/* 타임라인 아이템 */}
                      <div className="relative flex items-start space-x-4 p-4 hover:bg-muted/30 transition-colors duration-200">
                        {/* 상태 아이콘 */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                            {getStatusIcon(order.status)}
                          </div>
                        </div>
                        
                        {/* 콘텐츠 영역 */}
                        <div className="flex-1 min-w-0">
                          {/* 헤더 영역 */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {order.orderNumber}
                              </h4>
                              <Badge variant={variant as any} className={`text-xs px-2 py-1 ${className}`}>
                                {order.status}
                              </Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600" 
                              onClick={() => goToOrderDetail(order.id)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* 주소 정보 */}
                          <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{order.departure.address}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{order.destination.address}</span>
                          </div>
                          
                          {/* 하단 정보 */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="font-medium text-gray-700">
                              {order.amount}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatRelativeTime(order.registeredDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">등록된 화물이 없습니다.</p>
                  <p className="text-xs mt-1">새로운 화물을 등록해보세요.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* "모든 화물 보기" 버튼 */}
        {recentOrders.length > 0 && (
          <div className="flex justify-center p-4 border-t bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => router.push('/order/list')}
              className="w-full"
            >
              모든 화물 보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 