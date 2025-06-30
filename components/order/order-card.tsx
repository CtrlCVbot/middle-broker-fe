"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Truck,
  Clock,
  DollarSign,
  User,
} from "lucide-react";
import { ISimpleOrder } from "@/types/order-ver01";
import { formatCurrency } from "@/lib/utils";
import { useOrderDetailStore } from "@/store/order-detail-store";

// 화물 상태에 따른 배지 색상 설정
const getStatusBadge = (status: string) => {
  switch (status) {
    case "배차대기":
      return <Badge variant="outline">배차대기</Badge>;
    case "배차완료":
      return <Badge variant="secondary">배차완료</Badge>;
    case "상차완료":
      return <Badge variant="default">상차완료</Badge>;
    case "운송중":
      return <Badge className="bg-blue-500">운송중</Badge>;
    case "하차완료":
      return <Badge className="bg-green-500">하차완료</Badge>;
    case "운송완료":
      return <Badge className="bg-purple-500">운송완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface OrderCardProps {
  orders: ISimpleOrder[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrderCard({
  orders,
  currentPage,
  totalPages,
  onPageChange,
}: OrderCardProps) {
  // 상세 정보 모달을 위한 스토어 액세스
  const { openSheet } = useOrderDetailStore();
  
  // 화물 상세 정보 열기
  const handleOrderClick = (orderId: string) => {
    openSheet(orderId);
  };
  
  // 첫 페이지로 이동
  const handleFirstPage = () => {
    onPageChange(1);
  };

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 마지막 페이지로 이동
  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="py-12 text-center text-lg text-muted-foreground">
          표시할 화물 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              //className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              className="hover:ring-2 hover:ring-primary/30 transition-all duration-150"
              onClick={() => handleOrderClick(order.id)}
            >
              <div className="flex items-center justify-between p-4 bg-gray-100">
                <div className="font-semibold text-sm text-primary truncate">{order.id}</div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-[20px_1fr] gap-x-2 gap-y-3">
                  {/* 상차지 정보 */}
                  <ArrowUp className="h-5 w-5 text-blue-500" />
                  <div className="space-y-1">
                    <div className="font-medium line-clamp-1" title={order.departureLocation}>
                      {order.departureLocation}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-1 items-center">
                      <Clock className="h-3 w-3" />
                      {order.departureDateTime}
                    </div>
                  </div>
                  
                  {/* 하차지 정보 */}
                  <ArrowDown className="h-5 w-5 text-red-500" />
                  <div className="space-y-1">
                    <div className="font-medium line-clamp-1" title={order.arrivalLocation}>
                      {order.arrivalLocation}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-1 items-center">
                      <Clock className="h-3 w-3" />
                      {order.arrivalDateTime}
                    </div>
                  </div>
                  
                  {/* 차량 정보 */}
                  {/* <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>{order.vehicle.type} {order.vehicle.weight}</div> */}
                  
                  {/* 운전자 정보 */}
                  {/* <User className="h-5 w-5 text-muted-foreground" />
                  <div>{order.driver.name || "-"}</div> */}
                  
                  {/* 운송비 정보 */}
                  {/* <DollarSign className="h-5 w-5 text-green-500" />
                  <div className="font-medium">{formatCurrency(order.amount)}원</div> */}

                  
                </div>

                <div className="flex justify-between items-center text-md">
                  <span><Truck className="inline h-4 w-4 mr-1 text-muted-foreground" />{order.vehicle.type} {order.vehicle.weight}</span>
                  <span><User className="inline h-4 w-4 mr-1 text-muted-foreground" />{order.driver.name || "-"}</span>
                </div>
                <div className="text-right text-base font-semibold text-green-600">
                  {formatCurrency(order.amount)}원
                </div>
              </CardContent>

              

              
              <CardFooter className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
              등록일: {format(new Date(order.createdAt), "yyyy.MM.dd HH:mm")}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {totalPages > 0
              ? `페이지 ${currentPage} / ${totalPages}`
              : "데이터 없음"}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 