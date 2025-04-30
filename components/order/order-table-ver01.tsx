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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { IOrder } from "@/types/order1";
import { formatCurrency } from "@/lib/utils";
import { useOrderDetailStore } from "@/store/order-detail-store";
import { ko } from "date-fns/locale";


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
    case "운송마감":
      return <Badge className="bg-purple-500">운송마감</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
const getDateTimeformat = (date: string) => {
  const dateObj = new Date(date);
  return format(dateObj, "MM.dd (E) HH:mm", { locale: ko });
}

const getSchedule = (pickupDate: string, pickupTime: string, deliveryDate: string, deliveryTime: string) => {
  const pickupDateObj = format(pickupDate, "MM.dd", { locale: ko });
  const deliveryDateObj = format(deliveryDate, "dd", { locale: ko });
  if (pickupDate === deliveryDate) {
    return pickupDateObj;
  } else {
    return pickupDateObj + ' - ' + deliveryDateObj;
  }
}

const getTime = (pickupDate: string, pickupTime: string, deliveryDate: string, deliveryTime: string) => {
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
  orders: IOrder[];
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>상태</TableHead>
              <TableHead className="w-[120px]">일정</TableHead>
              <TableHead className="w-[120px]">시간</TableHead>
              
              <TableHead>상차지</TableHead>
              <TableHead>하차지</TableHead>
              <TableHead>상차 일시</TableHead>              
              <TableHead>하차 일시</TableHead>
              <TableHead>차량</TableHead>
              <TableHead>기사</TableHead>
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
                <TableRow key={order.id} className="cursor-pointer hover:bg-secondary/20" onClick={() => handleOrderClick(order.id)}>
                  <TableCell>{getStatusBadge(order.flowStatus)}</TableCell>
                  <TableCell className="font-medium text-primary underline">
                    {getSchedule(order.pickupDate, order.pickupTime, order.deliveryDate, order.deliveryTime)}
                  </TableCell>
                  <TableCell className="font-medium text-primary ">
                    {getTime(order.pickupDate, order.pickupTime, order.deliveryDate, order.deliveryTime)}
                  </TableCell>
                  
                  <TableCell className="max-w-[200px] truncate" title={order.pickupAddressSnapshot.name}>
                    {order.pickupAddressSnapshot.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={order.deliveryAddressSnapshot.name}>
                    {order.deliveryAddressSnapshot.name}
                  </TableCell>
                  <TableCell>{getDateTimeformat(order.pickupDate + ' ' + order.pickupTime)}</TableCell>                  
                  <TableCell>{getDateTimeformat(order.deliveryDate + ' ' + order.deliveryTime)}</TableCell>
                  <TableCell>
                    {order.requestedVehicleType} {order.requestedVehicleWeight}
                  </TableCell>
                  <TableCell>
                    {/* {order.driver.name || "-"} */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>{"-"}</TooltipTrigger>
                        <TooltipContent>{"-"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.estimatedPriceAmount)}원
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