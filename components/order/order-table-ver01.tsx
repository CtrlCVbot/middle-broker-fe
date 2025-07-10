"use client";

import React from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowBigRightDash,
  Link2Off,
  Truck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { IOrder, IOrderWithDispatch } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { useOrderDetailStore } from "@/store/order-detail-store";
import { ko } from "date-fns/locale";


// 화물 상태에 따른 배지 색상 설정
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "운송요청":
      return <Badge className="text-md" variant="destructive" >운송요청</Badge>;
    case "배차대기":
      return <Badge className="text-md bg-orange-500">배차대기</Badge>;
    case "배차완료":
      return <Badge className="text-md bg-green-500">배차완료</Badge>;
    case "상차대기":
      return <Badge className="text-md bg-green-800">상차대기</Badge>;
    case "상차완료":
      return <Badge className="text-md bg-blue-300">상차완료</Badge>;
    case "운송중":
      return <Badge className="text-md bg-blue-500">운송중</Badge>;
    case "하차완료":
      return <Badge className="text-md bg-blue-800">하차완료</Badge>;
    case "운송완료":
    case "운송완료":
      return <Badge className="text-md bg-purple-500">운송완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
export const getStatusColor = (status: string) => {
  switch (status) {
    case "운송요청":
      return "red";
    case "배차대기":
      return "orange";
    case "배차완료":
      return "green";
    case "상차대기":
      return "green";
    case "상차완료":
      return "blue";
    case "운송중":
      return "blue";
    case "하차완료":
      return "blue";
    case "운송완료":
    case "운송완료":
      return "purple";
    default:
      return "gray";
  }
}
export const getStatusColorSummary = (status: string) => {
  switch (status) {
    case "운송요청":
      return "orange";
    case "배차중":
      return "green";    
    case "운송중":
      return "blue";
    case "운송완료":
      return "purple";
    default:
      return "gray";
  }
}


const getDateTimeformat = (date: string) => {
  const dateObj = new Date(date);
  return format(dateObj, "MM.dd (E) HH:mm", { locale: ko });
}

export const getSchedule = (pickupDate: string, pickupTime: string, deliveryDate: string, deliveryTime: string) => {
  const pickupDateObj = format(pickupDate, "MM.dd(E)", { locale: ko });
  const deliveryDateObj = format(deliveryDate, "dd", { locale: ko });
  if (pickupDate === deliveryDate) {
    return pickupDateObj;
  } else {
    return pickupDateObj + ' - ' + deliveryDateObj;
  }
}

export const getTime = (pickupDate: string, pickupTime: string, deliveryDate: string, deliveryTime: string) => {
  console.log("pickupDate, pickupTime, deliveryDate, deliveryTime", pickupDate, pickupTime, deliveryDate, deliveryTime);
  const pickupTimeObj = format(parseISO('1970-01-01T' + pickupTime), 'HH:mm', {locale: ko});
  let deliveryTimeObj = format(parseISO('1970-01-01T' + deliveryTime), 'HH:mm', {locale: ko});
  const deliveryDateObj = format(deliveryDate, "dd", { locale: ko });
  if (pickupDate === deliveryDate) {
    deliveryTimeObj = deliveryTimeObj;
  } else {
    deliveryTimeObj = deliveryTimeObj + "(" + deliveryDateObj + ")";
  }
  if (pickupDate === deliveryDate) {
    return pickupTimeObj + ' - ' + deliveryTimeObj;
  } else {
    return pickupTimeObj + ' - ' + deliveryTimeObj;
  }
}



function formatTimeOnly(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(date) ? format(date, 'HH:mm', {locale: ko}) : '-';
}

interface OrderTableProps {
  orders: (IOrder & Partial<IOrderWithDispatch>)[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrderTable({
  orders,
  currentPage,
  totalPages,
  onPageChange,
}: OrderTableProps) {
  console.log('orders-->', orders);
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              {/* <TableHead className="w-[80px] text-center">ID</TableHead> */}
              <TableHead className="w-[80px] text-center">상태</TableHead>
              <TableHead className="w-[80px] ">일정</TableHead>
              <TableHead className="w-[120px] ">시간</TableHead>              
              <TableHead>상차지</TableHead>
              <TableHead>{/* 상차지 하차지 흐름 보여주는 이미지 넣는 컬럼! 지우지 마세요!*/}</TableHead>
              <TableHead>하차지</TableHead>              
              <TableHead >품목</TableHead>              
              <TableHead className="w-[80px] ">차량</TableHead>
              <TableHead className="w-[80px]">기사</TableHead>
              <TableHead className="text-right">운송비</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 화물 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-secondary/80" onClick={() => handleOrderClick(order.id)}>
                  {/* <TableCell className="font-medium text-primary underline">{order.id.slice(0, 8)}</TableCell> */}
                  <TableCell className="text-center scale-90">{getStatusBadge(order.flowStatus)}</TableCell>
                  <TableCell className="font-medium">
                    {getSchedule(order.pickupDate, order.pickupTime, order.deliveryDate, order.deliveryTime)}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {getTime(order.pickupDate, order.pickupTime, order.deliveryDate, order.deliveryTime)}
                  </TableCell>
                  
                  <TableCell className="max-w-[100px] truncate" title={order.pickupAddressSnapshot.name}>
                    <div className="flex flex-col">
                      <div className="text-md font-medium text-shadow-xs">
                        {order.pickupAddressSnapshot.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.pickupAddressSnapshot.roadAddress}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><ChevronsRight className="h-5 w-5 text-muted-foreground" /></TableCell>
                  <TableCell className="max-w-[100px] truncate" title={order.deliveryAddressSnapshot.name}>
                    <div className="flex flex-col">
                      <div className="text-md font-medium text-shadow-xs">
                        {order.deliveryAddressSnapshot.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.deliveryAddressSnapshot.roadAddress}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{order.cargoName}</TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="text-md font-bold text-neutral-800">
                        {order.requestedVehicleWeight}
                      </div>
                      <div className="text-md font-medium text-shadow-xs">
                        {order.requestedVehicleType}
                      </div>                      
                    </div> 
                  </TableCell>
                  <TableCell>
                    {order.assignedDriverId 
                      ? (
                        <>
                        <Badge variant="outline"  className="text-xs px-3 py-1 border ">    
                          <Truck className="h-4 w-4 mr-1" />{order.assignedVehicleNumber}
                        </Badge>
                        </>
                        )
                      : (
                        <>
                        <Badge variant="outline"  className="text-xs px-3 py-1 border-dashed text-muted-foreground">    
                          <Link2Off className="h-4 w-4 mr-1" />배차전
                        </Badge>
                        </>
                        )
                    }                        
                  </TableCell>
                  <TableCell className="text-right text-primary font-bold text-md text-shadow-xs">
                    {order.estimatedPriceAmount<= 0 ? "협의" : formatCurrency(order.estimatedPriceAmount) + "원"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between">
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