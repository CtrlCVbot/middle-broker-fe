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
  MoveRight,
  Tally1,
  ArrowRightCircle,
  GitCommitVertical,
  Link2Off,
  LogOut,
  LogIn,
} from "lucide-react";
import { IOrder } from "@/types/order1";
import { cn, formatCurrency } from "@/lib/utils";
import { useOrderDetailStore } from "@/store/order-detail-store";
import { getSchedule, getTime, getStatusColor, getStatusBadge } from "./order-table-ver01";


// 화물 상태에 따른 배지 색상 설정
export const getStatusBadgeVer01 = (status: string) => {
  switch (status) {
    case "운송요청":
      return <Badge className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold bg-gray-100 rounded-full border text-muted-foreground" variant="outline" >운송요청</Badge>;
    case "배차대기":
      return <Badge className="text-md border-orange-500 border-2">배차대기</Badge>;
    case "배차완료":
      return <Badge className="text-md border-green-500 border-2">배차완료</Badge>;
    case "상차대기":
      return <Badge className="text-md bg-green-800">상차대기</Badge>;
    case "상차완료":
      return <Badge className="text-md bg-blue-300">상차완료</Badge>;
    case "운송중":
      return <Badge className="text-md bg-blue-500">운송중</Badge>;
    case "하차완료":
      return <Badge className="text-md bg-blue-800">하차완료</Badge>;
    case "운송마감":
    case "운송완료":
      return <Badge className="text-md bg-purple-500">운송마감</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface OrderCardProps {
  orders: IOrder[];
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
    <>
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="py-12 text-center text-lg text-muted-foreground">
          표시할 화물 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {orders.map((order) => {

            const isCurrent = order.flowStatus.length > 1;
            
            return(
            
            <>
            <Card 
              key={order.id} 
              //className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              className="hover:ring-2 hover:ring-primary/30 transition-all duration-150 shadow-sm rounded-xl bg-muted/30"
              onClick={() => handleOrderClick(order.id)}
            >              
              
              <div className="flex items-center justify-between px-6 pb-3 border-b ">
                {/* 왼쪽: 시간 */}
                <div className="flex-1 flex items-center">
                  <div className="font-semibold text-shadow-xs text-lg text-neutral-600 truncate">
                    {getSchedule(order.pickupDate, order.pickupTime, order.deliveryDate, order.deliveryTime)}
                  </div>
                </div>

                {/* 가운데: 상태 배지 (정중앙 정렬) */}
                <div className="flex-1 flex justify-center">
                  {/* <div className="scale-100">{getStatusBadgeVer01(order.flowStatus)}</div> */}
                  <Badge className="inline-flex items-center justify-center px-3 py-1 
                  text-xs font-semibold bg-gray-100 rounded-full border text-muted-foreground" variant="outline" >
                    {order.flowStatus}
                  </Badge>
                </div>

                {/* 오른쪽: 금액 */}
                <div className="flex-1 flex justify-end">
                  <span className="text-primary font-bold text-lg text-shadow-xs">{formatCurrency(order.estimatedPriceAmount)}원</span>
                </div>
              </div>

              
              <CardContent className=" space-y-4 ">
                
                <div className="flex items-center justify-between  ">
                  {/* 상차지 정보 */}
                  <div className="flex items-center gap-2">
                    <ArrowUp className={cn(
                      "h-8 w-8 text-green-500",
                      isCurrent ? `text-${getStatusColor(order.flowStatus)}` : "text-muted"
                    )} />

                    {/* <ArrowUp className="h-8 w-8 text-green-500" /> */}
                    <div>
                      <div className="font-medium line-clamp-1 scale-120 ml-2"> {order.pickupAddressSnapshot.name}</div>
                      <div className="font-semibold text-muted-foreground w-[155px] truncate">({order.pickupAddressSnapshot.roadAddress})</div>
                      <div className="font-semibold scale-110">{order.pickupTime.slice(0, 5)}</div>
                    </div>
                  </div>

                  {/* 세로선 */}
                  <div className="flex items-center gap-2">                    
                    <div className="relative flex flex-col items-center justify-center h-20">
                      {/* 세로선 */}
                      <div className="absolute top-0 bottom-0 w-px bg-gray-200" />

                      {/* VS 원 */}
                      <div className="z-10 bg-gray-100 text-xs text-gray-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center shadow-sm border">
                        <ChevronsRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>


                  {/* 하차지 정보 */}
                  <div className="flex items-center gap-2">
                    
                    {/* < className="h-8 w-8 text-blue-500" /> */}
                    <div>
                      <div className="font-medium line-clamp-1 scale-120 ml-2"> {order.deliveryAddressSnapshot.name}</div>
                      <div className="font-semibold text-muted-foreground w-[155px] truncate">({order.deliveryAddressSnapshot.roadAddress})</div>
                      <div className="font-semibold scale-110">{order.deliveryTime.slice(0, 5)}</div>
                    </div>
                    <ArrowDown className={cn(
                      "h-8 w-8 text-blue-500",
                      isCurrent ? `text-${getStatusColor(order.flowStatus)}` : "text-muted"
                    )} />
                  </div>
                </div>
                
              </CardContent>
              
              {/* <CardFooter className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
              등록일: {format(new Date(order.createdAt), "yyyy.MM.dd HH:mm")}
              </CardFooter> */}

              

              {/* 하단 정보: 차량 및 차주 */}
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="text-sm font-medium px-2 py-1 rounded-md bg-muted text-foreground flex items-center">
                  <Truck className="h-4 w-4 mr-1" />
                  {order.requestedVehicleType} {order.requestedVehicleWeight}
                </div>

                {/* 차주명/연락처 */}                
                <Button variant="outline" size="sm" className="text-xs px-3 py-1 border-dashed">
                  <Link2Off className="h-4 w-4 mr-1" />
                  배차전
                </Button>
              </div>

            </Card>
            </>
          )})}
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

    

    </>
  );
} 